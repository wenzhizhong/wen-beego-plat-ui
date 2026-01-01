import dayjs from "dayjs";
import editForm from "../form.vue";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { usePublicHooks } from "../../../system/hooks";
// import { transformI18n } from "@/plugins/i18n";
let transformI18n = (label: string) => label; // 不需要i18n,临时解决i18n报错
import { addDialog } from "@/components/ReDialog";
import type { FormItemProps } from "./types";
import type { PaginationProps } from "@pureadmin/table";
import { getKeyList, deviceDetection, copyTextToClipboard } from "@pureadmin/utils";
import { getCronLogList, avaibleCron} from "@/api/monitor";
import { type Ref, reactive, ref, onMounted, h, toRaw, watch } from "vue";
import { useUserStoreHook } from "@/store/modules/user";
import { listToMap } from "@/utils/util.js";
import { create } from "sortablejs";

export function useCron() {
  interface Tree {
    id: string
    parentId: string
    title: string
    children: Tree[]
    pids : string[]
  }

  const form = reactive({
    name_en: "",
    created_at: "",
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
  const avaibleCronMap = ref({});


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
      label: "执行状态",
      cellRenderer: ({ row, props }) => (
        <el-tag   >
          {row.result ? "正常" : "异常"}
        </el-tag>
      ),
      minWidth: 80
    },
    {
      label: "备注",
      prop: "remark",
      cellRenderer: ({ row, props }) => (
        <span 
          class="copy-remark"
          onClick={(e)=>{copyRemark(row.remark, e)}}
        >
          {row.remark}
        </span>
      )
    },
    {
      label: "日志时间",
      prop: "created_at",
      minWidth: 160,
      formatter: ({ created_at }) => dayjs(created_at * 1000).format("YYYY-MM-DD HH:mm:ss")
    },
  ];
  
  function handleDelete(row) {
    // delCron({ id: row.id }).then((res) => {
    //   if (res.code === 200) { 
    //     onSearch();
    //     message(`您删除了定时任务【${transformI18n(row.name)}】`, {
    //       type: "success"
    //     });
    //   }else {
    //     message(res.message || "删除失败" , { type: "error" });
    //   }
    // });
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

    const { data } = await getCronLogList(tmpForm);
    let tmpDataList = data.list || [];
    for (let i = 0; i < tmpDataList.length; i++) {
      let name_en = tmpDataList[i]['name_en']
      tmpDataList[i].name = avaibleCronMap.value?.[name_en]?.['name'] || "";
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

  async function getAvaibleCron(){
    await avaibleCron().then(res => {
      if(res?.data?.list){
        avaibleCronList.value = res.data.list 
        avaibleCronMap.value = listToMap(res.data.list, 'name_en')
      }
    })
  }
  function copyRemark (remark, e){
    const success = copyTextToClipboard(remark);
    success
      ? message("复制成功", { type: "success" })
      : message("复制失败", { type: "error" });
  }

  onMounted(async () => {
    await getAvaibleCron()
    onSearch();
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
