import dayjs from "dayjs";
import editForm from "../form.vue";
import { handleTree, handleTreeToMap, getTreeMapByKeys, getTreeMapKeys } from "@/utils/tree";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { usePublicHooks } from "../../../system/hooks";
// import { transformI18n } from "@/plugins/i18n";
let transformI18n = (label: string) => label; // 不需要i18n,临时解决i18n报错
import { addDialog } from "@/components/ReDialog";
import type { FormItemProps } from "./types";
import type { PaginationProps } from "@pureadmin/table";
import { getKeyList, deviceDetection } from "@pureadmin/utils";
import { getCronList,  addCron,  editCron,  delCron,  avaibleCron, changeStatusCron} from "@/api/monitor";
import { type Ref, reactive, ref, onMounted, h, toRaw, watch } from "vue";
import { useUserStoreHook } from "@/store/modules/user";
import { hasPerms } from "@/utils/auth";

export function useCron() {
  interface Tree {
    id: string
    parentId: string
    title: string
    children: Tree[]
    pids : string[]
  }

  const form = reactive({
    name: "",
    status: "-1",
    selectUnitIds: "",
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
  const avaibleCronList = ref([]);


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
      label: "定时任务名称",
      fixed: "left",
      prop: "name",
      minWidth: 180
    },
    {
      label: "定时任务名称",
      prop: "name_en",
      minWidth: 120
    },
    {
      label: "定时任务分组",
      prop: "group",
      minWidth: 120
    },
    {
      label: "定时任务表达式",
      prop: "cron_expr",
      minWidth: 120
    },
    {
      label: "状态",
      cellRenderer: ({ row, props }) => (
        <el-switch
          v-model={row.status}
          inline-prompt
          active-value={1}
          inactive-value={0}
          active-text="启用"
          inactive-text="停用"
          onChange={(value) => handleStatusChange(value, row)}
          disabled={!hasPerms("admin_plat:monitor-cron:change-status")}
        />
      ),
      minWidth: 80
    },
    {
      label: "备注",
      prop: "remark",
      minWidth: 160
    },
    {
      label: "更新人",
      prop: "created_by_name",
      minWidth: 120
    },
    {
      label: "修改时间",
      prop: "updated_at",
      minWidth: 160,
      formatter: ({ updated_at }) =>
        dayjs(updated_at).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      fixed: "right",
      width: 160,
      slot: "operation"
    }
  ];
  
  function handleStatusChange(value, row) {
    ElMessageBox.confirm(
      `确认要<strong>${
        row.status === 1 ? "启用" : "停用"
      }</strong><strong style='color:var(--el-color-primary)'>${
        row.name
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
      changeStatusCron({ id: row.id, status: value }).then((res) => { 
        if (res.code === 200) { 
          onSearch();
          message(`已${row.status === 1 ? "启用" : "停用"}${row.name}`, {
            type: "success"
          });
        }else {
          message(res.message || "操作失败" , { type: "error" });
        }
      }).catch((error) => {
        console.error(error);
      });
    })
    .catch((error) => {
      // row.status === 1? (row.status = 0): (row.status = 1);
      row.status = Number(!row.status);
    });
  }

  function handleDelete(row) {
    delCron({ id: row.id }).then((res) => {
      if (res.code === 200) { 
        onSearch();
        message(`您删除了定时任务【${transformI18n(row.name)}】`, {
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
    const { data } = await getCronList(tmpForm);
    let tmpDataList = data.list || [];
    for (let i = 0; i < tmpDataList.length; i++) {
      tmpDataList[i].statusBool = tmpDataList[i].status === 1;
    }
    dataList.value = tmpDataList;
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
      title: `${title}定时任务`,
      props: {
        formInline: {
          id: row?.id && title != "新增" ? row.id: "",
          unit_id: row?.unit_id ?? "",
          name: row?.name ?? "",
          name_en: row?.name_en ?? "",
          group: row?.group ?? "默认",
          cron_expr: row?.cron_expr ?? "",
          status: row?.status ?? null,
          remark: row?.remark ?? "",
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
                addCron(curData).then(res => {
                  if (res.code === 200) {
                    chores();
                    message(`新增成功：`+curData.name, {
                      type: "success"
                    });
                  }else {
                    message(res.message || `新增失败：`+ curData.name, {
                      type: "error"
                    });
                  }
                });
              } else {
                editCron(curData).then(res => { 
                  if (res.code === 200) {
                    chores();
                    message(`修改成功：`+curData.name, {
                      type: "success"
                    });
                  } else {
                    message(`修改失败：`+curData.name, {
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


  /** 高亮当前权限选中行 */
  function rowStyle({ row: { id } }) {
    return {
      cursor: "pointer",
      background: id === curRow.value?.id ? "var(--el-fill-color-light)" : ""
    };
  }

  const filterMethod = (query: string, node) => {
    return transformI18n(node.title)!.includes(query);
  };

  function getAvaibleCron(){
    avaibleCron().then(res => {
      if(res?.data?.list){
        avaibleCronList.value = res.data.list 
      }
    })
  }

  onMounted(async () => {
    const { default_unit_id: tmpDefaultUnitId } = useUserStoreHook();
    
    onSearch();
    getAvaibleCron()
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
    handleDelete,
    filterMethod,
    // transformI18n,
    // handleDatabase,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange,
    default_unit_id,
    avaibleCronList,
  };
}
