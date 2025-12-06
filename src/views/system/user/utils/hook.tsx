import "./reset.css";
import dayjs from "dayjs";
import roleForm from "../form/role.vue";
import editForm from "../form/index.vue";
import { zxcvbn } from "@zxcvbn-ts/core";
import { handleTree } from "@/utils/tree";
import { message } from "@/utils/message";
import {randomPassword } from "@/utils/util.js";
import userAvatar from "@/assets/user.jpg";
import { usePublicHooks } from "../../hooks";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import ReCropperPreview from "@/components/ReCropperPreview";
import type { FormItemProps, RoleFormItemProps } from "../utils/types";
import {useDbModelParamsStoreHook } from "@/store/modules/globalParams";

import {
  getKeyList,
  isAllEmpty,
  hideTextAtIndex,
  deviceDetection
} from "@pureadmin/utils";
import {
  getRoleIds,
  getDeptList,
  getUserList,
  getRoleTree,
  addUser,
  editUser,
  delUser,
} from "@/api/system";
import {
  ElForm,
  ElInput,
  ElFormItem,
  ElProgress,
  ElMessageBox
} from "element-plus";
import {
  type Ref,
  h,
  ref,
  toRaw,
  watch,
  computed,
  reactive,
  onMounted
} from "vue";
import { useUserStoreHook } from "@/store/modules/user";

const { unit_gender_map, unit_user_source_map, unit_card_type_map, unit_user_profile_map } = useDbModelParamsStoreHook();

export function useUser(tableRef: Ref, treeRef: Ref) {
  const form = reactive({
    // 部门树的id
    deptId: "",
    selectUnitIds: "",
    name: "",
    phone: "",
    status: ""
  });
  const formRef = ref();
  const ruleFormRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  // 上传头像信息
  const avatarInfo = ref();
  const switchLoadMap = ref({});
  const { switchStyle } = usePublicHooks();
  const higherDeptOptions = ref();
  const treeData = ref([]);
  const treeLoading = ref(true);
  const selectedNum = ref(0);
  const default_unit_id = ref("");
  const radioBttonParams = reactive({
    gender:[],
    card_type:[],
    user_source: [],
    profile_status: []
  });


  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const { unit_gender_map } = useDbModelParamsStoreHook();
  const columns: TableColumnList = [
    {
      label: "勾选列", // 如果需要表格多选，此处label必须设置
      type: "selection",
      fixed: "left",
      reserveSelection: true // 数据刷新后保留选项
    },
    {
      label: "用户头像",
      prop: "avatarLink",
      cellRenderer: ({ row }) => (
        <el-image
          fit="cover"
          preview-teleported={true}
          src={row.avatarLink || userAvatar}
          preview-src-list={Array.of(row.avatarLink || userAvatar)}
          class="w-[24px] h-[24px] rounded-full align-middle"
        />
      ),
      width: 90
    },
    {
      label: "用户名称",
      prop: "name",
      minWidth: 130
    },
    {
      label: "性别",
      prop: "sex",
      minWidth: 90,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={row.sex === 1 ? "danger" : null}
          effect="plain"
        >
          {unit_gender_map[row.sex] || "保密"}
        </el-tag>
      )
    },
    {
      label: "手机号码",
      prop: "phone",
      minWidth: 90,
      formatter: ({ phone }) => hideTextAtIndex(phone, { start: 3, end: 6 })
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 90,
      cellRenderer: scope => (
        <el-switch
          size={scope.props.size === "small" ? "small" : "default"}
          loading={switchLoadMap.value[scope.index]?.loading}
          v-model={scope.row.status}
          active-value={1}
          inactive-value={0}
          active-text="已启用"
          inactive-text="已停用"
          inline-prompt
          style={switchStyle.value}
          onChange={() => onChange(scope as any)}
        />
      )
    },
    {
      label: "部门",
      prop: "dept_names",
      minWidth: 90
    },
    {
      label: "角色",
      prop: "role_names",
      minWidth: 90
    },
    {
      label: "创建时间",
      minWidth: 90,
      prop: "createTime",
      formatter: ({ createTime }) =>
        dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      fixed: "right",
      width: 180,
      slot: "operation"
    }
  ];
  const buttonClass = computed(() => {
    return [
      "h-[20px]!",
      "reset-margin",
      "text-gray-500!",
      "dark:text-white!",
      "dark:hover:text-primary!"
    ];
  });
  // 重置的新密码
  const pwdForm = reactive({
    newPwd: ""
  });
  const pwdProgress = [
    { color: "#e74242", text: "非常弱" },
    { color: "#EFBD47", text: "弱" },
    { color: "#ffa500", text: "一般" },
    { color: "#1bbf1b", text: "强" },
    { color: "#008000", text: "非常强" }
  ];
  // 当前密码强度（0-4）
  const curScore = ref();
  const roleOptions = ref([]);

  function onChange({ row, index }) {
    ElMessageBox.confirm(
      `确认要<strong>${
        row.status === 0 ? "停用" : "启用"
      }</strong><strong style='color:var(--el-color-primary)'>${
        row.name
      }</strong>用户吗?`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    )
      .then(() => {
        switchLoadMap.value[index] = Object.assign(
          {},
          switchLoadMap.value[index],
          {
            loading: true
          }
        );
        setTimeout(() => {
          switchLoadMap.value[index] = Object.assign(
            {},
            switchLoadMap.value[index],
            {
              loading: false
            }
          );
          message("已成功修改用户状态", {
            type: "success"
          });
        }, 300);
      })
      .catch(() => {
        row.status === 0 ? (row.status = 1) : (row.status = 0);
      });
  }

  function handleUpdate(row) {
    console.log(row);
  }

  function handleDelete(ids) {
    if (ids.length === 0) {
      message("请选择要删除的用户", {
        type: "warning"
      });
      return;
    }
    delUser({ id: ids }).then((res) => {
      if (res.code === 200) { 
        onSearch();
        message(`删除成功`, {
          type: "success"
        });
      }else {
        message(res.message || "删除失败" , { type: "error" });
      }
    });
  }

  function handleSizeChange(val: number) {
    console.log(`${val} items per page`);
  }

  function handleCurrentChange(val: number) {
    console.log(`current page: ${val}`);
  }

  /** 当CheckBox选择项发生变化时会触发该事件 */
  function handleSelectionChange(val) {
    selectedNum.value = val.length;
    // 重置表格高度
    tableRef.value.setAdaptive();
  }

  /** 取消选择 */
  function onSelectionCancel() {
    selectedNum.value = 0;
    // 用于多选表格，清空用户的选择
    tableRef.value.getTableRef().clearSelection();
  }

  /** 批量删除 */
  function onbatchDel() {
    // 返回当前选中的行
    const curSelected = tableRef.value.getTableRef().getSelectionRows();
    // 接下来根据实际业务，通过选中行的某项数据，比如下面的id，调用接口进行批量删除
    message(`已删除用户编号为 ${getKeyList(curSelected, "id")} 的数据`, {
      type: "success"
    });
    tableRef.value.getTableRef().clearSelection();
    onSearch();
  }

  async function onSearch() {
    loading.value = true;
    let tmpForm = {...toRaw(form), ...toRaw(pagination)}
    const { data } = await getUserList(tmpForm);
    data.list = data.list.map(item => {
      let tmpDeptIds = item.dept_ids && item.dept_ids.split(",") || [];
      let deptLen = tmpDeptIds.length;
      item.dept_id = deptLen && tmpDeptIds[deptLen-1] || "";
      item.role_id = item.role_ids && item.role_ids.split(",") || [];
      return item;
    });
    console.log("data.list=", data.list)
    dataList.value = data.list;
    pagination.total = data.total;
    pagination.pageSize = data.pageSize;
    pagination.currentPage = data.currentPage;

    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    form.deptId = "";
    treeRef.value.onTreeReset();
    onSearch();
  };

  function onTreeSelect({ id, selected }) {
    form.selectUnitIds = selected ? id : "";
    onSearch();
  }

  function formatHigherDeptOptions(treeList) {
    // 根据返回数据的status字段值判断追加是否禁用disabled字段，返回处理后的树结构，用于上级部门级联选择器的展示（实际开发中也是如此，不可能前端需要的每个字段后端都会返回，这时需要前端自行根据后端返回的某些字段做逻辑处理）
    if (!treeList || !treeList.length) return;
    const newTreeList = [];
    for (let i = 0; i < treeList.length; i++) {
      treeList[i].disabled = treeList[i].status === 0 ? true : false;
      formatHigherDeptOptions(treeList[i].children);
      newTreeList.push(treeList[i]);
    }
    return newTreeList;
  }

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}用户`,
      props: {
        formInline: {
          title,
          higherDeptOptions: formatHigherDeptOptions(higherDeptOptions.value),

          id:               row?.id ?? "",
          unit_id:          row?.unit_id ?? "",
          dept_id:          row?.dept_id ?? "",
          role_id:          row?.role_id ?? [],
          is_default:       row?.is_default ?? 0,
          default_unit_id:  row?.default_unit_id ?? "",
          user_id:          row?.user_id ?? "",
          phone:            row?.phone ?? "",
          password:         row?.password ?? "",
          name:             row?.name ?? "",
          avatar:           row?.avatar ?? "",
          avatarLink:       row?.avatarLink ?? "",
          card_type:        row?.card_type ?? 1,
          card_num:         row?.card_num ?? "",
          card_images:      row?.card_images ?? "",
          gender:           row?.gender ?? 0,
          birth_date:       row?.birth_date ?? null,
          constellation:    row?.constellation ?? "",
          occupation:       row?.occupation ?? "",
          company:          row?.company ?? "",
          emergency_name:   row?.emergency_name ?? "",
          emergency_tel:    row?.emergency_tel ?? "",
          address:          row?.address ?? "",
          email:            row?.email ?? "",
          source:           row?.source ?? 1,
          valid_date_begin: row?.valid_date_begin ?? null,
          valid_date_end:   row?.valid_date_end ?? null,
          graduated_from:   row?.graduated_from ?? "",
          schooling:        row?.schooling ?? "",
          degree_number:    row?.degree_number ?? "",
          professional:     row?.professional ?? "",
          status:           row?.status ?? 1,
          remark:           row?.remark ?? "",
          

          dept_ids:     row?.dept_ids ??  "",
          dept_names:   row?.dept_names ??  "",
          role_ids:     row?.role_ids ?? "",
          role_names:   row?.role_names ?? "",
        }
      },
      width: "800px",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          // message(`您${title}了用户【${curData.name}】`, {
          //   type: "success"
          // });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(valid => {
          if (valid) {
            // 日期‘YYYY-MM-DD’重新处理成标椎时间格式，以免中国标准时间被json自动转为时间标准时间格式
            if (curData.birth_date) {
              curData.birth_date = dayjs(curData.birth_date).format('YYYY-MM-DDTHH:mm:ssZ');
            }
            if (curData.valid_date_begin) {
              curData.valid_date_begin = dayjs(curData.valid_date_begin).format('YYYY-MM-DDTHH:mm:ssZ');
            }
            if (curData.valid_date_end) {
              curData.valid_date_end = dayjs(curData.valid_date_end).format('YYYY-MM-DDTHH:mm:ssZ');
            }
            // 表单规则校验通过
            console.log("curData", curData);

            ElMessageBox.confirm(`您确定${title}【${curData.name}】吗？`, {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            }).then(() => {
              if (title === "新增") {
                // 实际开发先调用新增接口，再进行下面操作
                addUser(curData).then((res) => {
                  if (res && res.code === 200){
                    chores();
                    message(`新增成功`, {
                      type: "success"
                    });
                  }else {
                    message(res && res.message || `新增失败`, {
                      type: "error"
                    });
                  }
                }).catch((e) => {
                  console.error(e)
                });
              } else {
                // 实际开发先调用修改接口，再进行下面操作
                editUser(curData).then((res) => { 
                  
                  if (res && res.code === 200){
                    chores();
                    message(`编辑成功`, {
                      type: "success"
                    });
                  }else {
                    message(res && res.message ||`编辑失败`, {
                      type: "error"
                    });
                  }
                }).catch((e) => {
                  console.error(e)
                });
              }
            }).catch(() => {
              // 取消
            });
          }
        });
      }
    });
  }

  const cropRef = ref();
  /** 上传头像 */
  function handleUpload(row) {
    addDialog({
      title: "裁剪、上传头像",
      width: "40%",
      closeOnClickModal: false,
      fullscreen: deviceDetection(),
      contentRenderer: () =>
        h(ReCropperPreview, {
          ref: cropRef,
          imgSrc: row.avatarLink || userAvatar,
          onCropper: info => (avatarInfo.value = info)
        }),
      beforeSure: done => {
        console.log("裁剪后的图片信息：", avatarInfo.value);
        // 根据实际业务使用avatarInfo.value和row里的某些字段去调用上传头像接口即可
        done(); // 关闭弹框
        onSearch(); // 刷新表格数据
      },
      closeCallBack: () => cropRef.value.hidePopover()
    });
  }

  watch(
    pwdForm,
    ({ newPwd }) =>
      (curScore.value = isAllEmpty(newPwd) ? -1 : zxcvbn(newPwd).score)
  );

  /** 重置密码 */
  function handleReset(row) {
    addDialog({
      title: `重置 ${row.name} 用户的密码`,
      width: "30%",
      draggable: true,
      closeOnClickModal: false,
      fullscreen: deviceDetection(),
      contentRenderer: () => (
        <>
          <ElForm ref={ruleFormRef} model={pwdForm}>
            <ElFormItem
              prop="newPwd"
              rules={[
                {
                  required: true,
                  message: "请输入新密码",
                  trigger: "blur"
                }
              ]}
            >
              <ElInput
                clearable
                show-password
                type="password"
                v-model={pwdForm.newPwd}
                placeholder="请输入新密码"
              />
            </ElFormItem>
          </ElForm>
          <div class="my-4 flex">
            {pwdProgress.map(({ color, text }, idx) => (
              <div
                class="w-[19vw]"
                style={{ marginLeft: idx !== 0 ? "4px" : 0 }}
              >
                <ElProgress
                  striped
                  striped-flow
                  duration={curScore.value === idx ? 6 : 0}
                  percentage={curScore.value >= idx ? 100 : 0}
                  color={color}
                  stroke-width={10}
                  show-text={false}
                />
                <p
                  class="text-center"
                  style={{ color: curScore.value === idx ? color : "" }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </>
      ),
      closeCallBack: () => (pwdForm.newPwd = ""),
      beforeSure: done => {
        ruleFormRef.value.validate(valid => {
          if (valid) {
            // 表单规则校验通过
            message(`已成功重置 ${row.name} 用户的密码`, {
              type: "success"
            });
            console.log(pwdForm.newPwd);
            // 根据实际业务使用pwdForm.newPwd和row里的某些字段去调用重置用户密码接口即可
            done(); // 关闭弹框
            onSearch(); // 刷新表格数据
          }
        });
      }
    });
  }

  /** 分配角色 */
  async function handleRole(row) {
    // 选中的角色列表
    const ids = (await getRoleIds({ userId: row.id })).data ?? [];
    addDialog({
      title: `分配 ${row.name} 用户的角色`,
      props: {
        formInline: {
          name: row?.name ?? "",
          roleOptions: roleOptions.value ?? [],
          ids
        }
      },
      width: "400px",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(roleForm),
      beforeSure: (done, { options }) => {
        const curData = options.props.formInline as RoleFormItemProps;
        console.log("curIds", curData.ids);
        // 根据实际业务使用curData.ids和row里的某些字段去调用修改角色接口即可
        done(); // 关闭弹框
      }
    });
  }
  /** 按钮单选参数 */
  (function setRadioBttonParams(){
    function getRadioBttonData(params){
      let tmpData = []
      for (const key in params) {
        tmpData.push({
          value: Number(key),
          label: params[key]
        });
      }
      return tmpData
    }
    radioBttonParams.gender = getRadioBttonData(unit_gender_map)
    radioBttonParams.card_type = getRadioBttonData(unit_card_type_map)
    radioBttonParams.user_source = getRadioBttonData(unit_user_source_map)
    radioBttonParams.profile_status = getRadioBttonData(unit_user_profile_map)
  })()

  function generatePassword(){
    return randomPassword(10)
  }

  onMounted(async () => {
    const { default_unit_id: tmpDefaultUnitId } = useUserStoreHook();
    form.selectUnitIds = tmpDefaultUnitId || "";
    default_unit_id.value = tmpDefaultUnitId;

    treeLoading.value = true;
    onSearch();

    // // 归属部门
    // const { data } = await getDeptList();
    // higherDeptOptions.value = handleTree(data);
    // treeData.value = handleTree(data);
    // treeLoading.value = false;

    // 角色列表
    roleOptions.value = (await getRoleTree()).data;
  });

  return {
    form,
    loading,
    columns,
    dataList,
    treeData,
    treeLoading,
    selectedNum,
    pagination,
    buttonClass,
    deviceDetection,
    onSearch,
    resetForm,
    onbatchDel,
    openDialog,
    onTreeSelect,
    handleUpdate,
    handleDelete,
    handleUpload,
    handleReset,
    handleRole,
    handleSizeChange,
    onSelectionCancel,
    handleCurrentChange,
    handleSelectionChange,
    default_unit_id,
    radioBttonParams,
    generatePassword,
  };
}
