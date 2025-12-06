import dayjs from "dayjs";
import editForm from "../form.vue";
import { handleTree, handleTreeToMap, getTreeMapByKeys, getTreeMapKeys } from "@/utils/tree";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { usePublicHooks } from "../../hooks";
// import { transformI18n } from "@/plugins/i18n";
let transformI18n = (label: string) => label; // 不需要i18n,临时解决i18n报错
import { addDialog } from "@/components/ReDialog";
import type { FormItemProps } from "./types";
import type { PaginationProps } from "@pureadmin/table";
import { getKeyList, deviceDetection } from "@pureadmin/utils";
import { addRole, delRole, editRole, getRoleList, getRoleMenu, getRoleMenuIds, saveRoleMenu } from "@/api/system";
import { type Ref, reactive, ref, onMounted, h, toRaw, watch } from "vue";
import { useUserStoreHook } from "@/store/modules/user";

export function useRole(treeRef: Ref) {
  interface Tree {
    id: string
    parentId: string
    title: string
    children: Tree[]
    pids : string[]
  }

  const form = reactive({
    role_name: "",
    status: "-1",
    selectUnitIds: "",
    role_classify_name: "",
  });
  const curRow = ref();
  const formRef = ref();
  const dataList = ref([]);
  const treeIds = ref([]);
  const treeData = ref([]);
  const treePidMap = ref({});
  const isShow = ref(false);
  const loading = ref(true);
  const isLinkage = ref(false);
  const treeSearchValue = ref();
  const switchLoadMap = ref({});
  const isExpandAll = ref(false);
  const isSelectAll = ref(false);
  const default_unit_id = ref("");
  const { tagStyle } = usePublicHooks();
  const { switchStyle } = usePublicHooks();
  const treeProps = {
    value: "id",
    label: "title",
    children: "children"
  };
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "角色名称",
      prop: "role_name",
      minWidth: 180
    },
    {
      label: "组织单位",
      prop: "unit_name",
      minWidth: 180
    },
    {
      label: "角色分类",
      prop: "role_classify_name"
    },
    {
      label: "状态",
      cellRenderer: ({ row, props }) => (
        <el-tag size={props.size} style={tagStyle.value(row.status)}>
          {row.status === 1 ? "启用" : "停用"}
        </el-tag>
      ),
      minWidth: 80
    },
    {
      label: "排序",
      prop: "role_sort",
      minWidth: 80
    },
    {
      label: "备注",
      prop: "remark",
      minWidth: 160
    },
    {
      label: "创建时间",
      prop: "createTime",
      minWidth: 160,
      formatter: ({ createTime }) =>
        dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      fixed: "right",
      width: 210,
      slot: "operation"
    }
  ];
  // const buttonClass = computed(() => {
  //   return [
  //     "h-[20px]!",
  //     "reset-margin",
  //     "text-gray-500!",
  //     "dark:text-white!",
  //     "dark:hover:text-primary!"
  //   ];
  // });

  function onChange({ row, index }) {
    ElMessageBox.confirm(
      `确认要<strong>${
        row.status === 0 ? "停用" : "启用"
      }</strong><strong style='color:var(--el-color-primary)'>${
        row.role_name
      }</strong>吗?`,
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
          message(`已${row.status === 0 ? "停用" : "启用"}${row.role_name}`, {
            type: "success"
          });
        }, 300);
      })
      .catch(() => {
        row.status === 0 ? (row.status = 1) : (row.status = 0);
      });
  }

  function handleDelete(row) {
    delRole({ id: row.id }).then((res) => {
      if (res.code === 200) { 
        onSearch();
        message(`您删除了角色【${transformI18n(row.role_name)}】`, {
          type: "success"
        });
      }else {
        message(res.message || "删除失败" , { type: "error" });
      }
    });
  }

  function handleSizeChange(val: number) {
    // console.log(`${val} items per page`);
    pagination.pageSize = val || 10;
    pagination.currentPage = 1;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    // console.log(`current page: ${val}`);
    pagination.currentPage = val || 1;
    onSearch();
  }

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  async function onSearch() {
    loading.value = true;
    let tmpForm = {...toRaw(form), ...toRaw(pagination)}
    if (tmpForm.status === undefined || tmpForm.status === null){
      tmpForm.status = "-1"
    }
    const { data } = await getRoleList(tmpForm);
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
    onSearch();
  };

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}角色`,
      props: {
        formInline: {
          id: row?.id && title != "新增" ? row.id: "",
          unit_id: row?.unit_id ?? "",
          role_name: row?.role_name ?? "",
          role_sort: row?.role_sort ?? 0,
          status: row?.status ?? null,
          remark: row?.remark ?? "",
          role_classify_name: row?.role_classify_name ?? "",
        }
      },
      width: "40%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(valid => {
          if (valid) {
            console.log("curData", curData);
            
            ElMessageBox.confirm("确认保存数据？", "提示", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
              dangerouslyUseHTMLString: true,
            })
            .then(() => {
              // 表单规则校验通过
              if (title === "新增") {
                addRole(curData).then(res => {
                  if (res.code === 200) {
                    chores();
                    message(`新增成功：`+curData.role_name, {
                      type: "success"
                    });
                  }else {
                    message(res.message || `新增失败：`+ curData.role_name, {
                      type: "error"
                    });
                  }
                });
              } else {
                editRole(curData).then(res => { 
                  if (res.code === 200) {
                    chores();
                    message(`修改成功：`+curData.role_name, {
                      type: "success"
                    });
                  } else {
                    message(`修改失败：`+curData.role_name, {
                      type: "error"
                    });
                  }
                });
              }
            }).catch((e) => {
              
            })
          }
        });
      }
    });
  }

  /** 菜单权限 */
  async function handleMenu(row?: any) {
    const { id } = row;
    if (id) {
      curRow.value = row;
      isShow.value = true;
      const { data } = await getRoleMenuIds({ id });
      let tmpData = data && data.list || [];
      treeRef.value.setCheckedKeys(tmpData);
    } else {
      curRow.value = null;
      isShow.value = false;
    }
  }

  /** 高亮当前权限选中行 */
  function rowStyle({ row: { id } }) {
    return {
      cursor: "pointer",
      background: id === curRow.value?.id ? "var(--el-fill-color-light)" : ""
    };
  }

  /** 菜单权限-保存 */
  function handleSave() {
    const { id, role_name, role_classify_name } = curRow.value;
    if (role_classify_name == 'admin'){
      message(`【${role_name}】为系统管理员角色，请勿修改`, {
        type: "error"
      });
      return;
    }
    // 根据用户 id 调用实际项目中菜单权限修改接口
    let checkedKeys = [...treeRef.value.getCheckedKeys(), ...treeRef.value.getHalfCheckedKeys()];
    ElMessageBox.confirm("确认保存数据？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
      dangerouslyUseHTMLString: true,
    })
    .then(() => { 
      saveRoleMenu({ id, menuIds: checkedKeys }).then((res) => {
        if (res && res.code === 200){
          treeIds.value = []
          isSelectAll.value = false;
          isShow.value = false;

          message(`角色【${role_name}】的菜单权限修改成功`, {
            type: "success"
          });
        }else {
          message(res.message || "修改失败" , { type: "error" });
        }
      });
    })
  }

  /** 数据权限 可自行开发 */
  // function handleDatabase() {}

  const onQueryChanged = (query: string) => {
    treeRef.value!.filter(query);
  };

  const filterMethod = (query: string, node) => {
    return transformI18n(node.title)!.includes(query);
  };
  const doGetRoleMenu = async (selectUnitIds) => { 
    if(!selectUnitIds) return false;

    form.selectUnitIds = selectUnitIds || "";
    default_unit_id.value = selectUnitIds;

    const { data } = await getRoleMenu(form);
    let tmpData = data && data.list || [];
    treeIds.value = getKeyList(tmpData, "id");
    treeData.value = handleTree(tmpData);
    treePidMap.value = handleTreeToMap(treeData.value)
    // console.log(treeData)
    return true
  }
  async function onTreeSelect({ id, selected}){
    form.selectUnitIds = selected ? id : "";
    await doGetRoleMenu(id);
    onSearch();
  }

  function onMenuTreeCheckChange( data: Tree, checked: boolean ) :boolean{
    let checkedKeys = [...treeRef.value.getCheckedKeys(), ...treeRef.value.getHalfCheckedKeys()];
    let checkedKeysMap = checkedKeys.reduce((acc, cur) => {
      acc[cur] = true;
      return acc;
    }, {});
    // let dataPidsMap = data && data.pids && data.pids.reduce((acc, cur) => {
    //   acc[cur] = true;
    //   return acc;
    // }, {}) || {};

    function doHandelSelectMenu(checked :boolean){
      // 1. children Menu 当前菜单有子菜单
      if (checked) checkedKeysMap[data.id] = true
      else delete checkedKeysMap[data.id]

      let hasChild = data && data.children && data.children.length > 0
      if (hasChild){
        let tmpPids = data.pids && [...data.pids, data.id] || [data.id];
        let curLevelAllChild = getTreeMapByKeys(treePidMap.value, tmpPids);
        let curLevelKeyArr = getTreeMapKeys(curLevelAllChild);
        
        for (const k in curLevelKeyArr ){
          let item = curLevelKeyArr[k]
          if (checked) checkedKeysMap[item] = true
          else if (checkedKeysMap[item]) delete checkedKeysMap[item]
        }
      }

      // 2. sibling Menu 当前菜单相邻菜单
      if (data.id && data.pids && data.pids.length > 0){
        let siblingMenuChecked = false;
        let siblingMenuNoChecked = false;
        let tmpPids = [...data.pids];
        while(tmpPids.length > 0) { 
          let curPidsAllChild = getTreeMapByKeys(treePidMap.value, tmpPids);
          let curLevelKeyArr = getTreeMapKeys(curPidsAllChild);
          let lastLevelPid = tmpPids.pop();

          // 校验部分选中前，同一级菜单全选，则“上一级”也直接选中
          let curLevelKeyArrLen = curLevelKeyArr.length
          let curLevelMenuAllChecked = 0
          let curLevelMenuAllNotChecked = 0
          for (let i = 0; i < curLevelKeyArrLen; i++){
            if (checked && checkedKeysMap[curLevelKeyArr[i]]) {
              curLevelMenuAllChecked++
            }else if (!checked && !checkedKeysMap[curLevelKeyArr[i]]){
              curLevelMenuAllNotChecked++
            }
          }
          if (checked && curLevelMenuAllChecked >0){
            checkedKeysMap[lastLevelPid] = true
          }else if(!checked && curLevelMenuAllNotChecked=== curLevelKeyArrLen){
            delete checkedKeysMap[lastLevelPid]
          }

          // 同一级菜单部分选中
          for (let i = 0; i < curLevelKeyArrLen; i++){ 
            if (checked && !checkedKeysMap[curLevelKeyArr[i]]){
              siblingMenuNoChecked = true;
              break
            } else if (!checked && checkedKeysMap[curLevelKeyArr[i]]){
              siblingMenuChecked = true;
              break
            }
          }
          for (let i = 0; i < curLevelKeyArrLen; i++){ 
            if (checked && !siblingMenuNoChecked)
              checkedKeysMap[curLevelKeyArr[i]] = true;
            if (!checked && !siblingMenuChecked)
              delete checkedKeysMap[curLevelKeyArr[i]]
          }
        }
      }
      treeRef.value.setCheckedKeys(Object.keys(checkedKeysMap));
    }

    doHandelSelectMenu(checked)
    return true
  }

  onMounted(async () => {
    const { default_unit_id: tmpDefaultUnitId } = useUserStoreHook();
    await doGetRoleMenu(tmpDefaultUnitId);
    onSearch();
  });

  watch(isExpandAll, val => {
    val
      ? treeRef.value.setExpandedKeys(treeIds.value)
      : treeRef.value.setExpandedKeys([]);
  });

  watch(isSelectAll, val => {
    val
      ? treeRef.value.setCheckedKeys(treeIds.value)
      : treeRef.value.setCheckedKeys([]);
  });

  return {
    form,
    isShow,
    curRow,
    loading,
    columns,
    rowStyle,
    dataList,
    treeData,
    treeProps,
    isLinkage,
    pagination,
    isExpandAll,
    isSelectAll,
    treeSearchValue,
    // buttonClass,
    onSearch,
    resetForm,
    openDialog,
    handleMenu,
    handleSave,
    handleDelete,
    filterMethod,
    // transformI18n,
    onQueryChanged,
    // handleDatabase,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange,
    onTreeSelect,
    default_unit_id,
    onMenuTreeCheckChange,
  };
}
