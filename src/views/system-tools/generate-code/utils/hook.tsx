import { ref, reactive, onMounted } from "vue";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import {
  getGenerateCodeList,
  delFormDetail
} from "@/api/generate-code";
import type { PaginationProps } from "@pureadmin/table";

export function useGenerateCode() {
  const loading = ref(false);
  const dataList = ref([]);
  const selectedRows = ref([]);
  const selectedNum = ref(0);

  const searchForm = reactive({
    keyword: ""
  });

  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  const columns: TableColumnList = [
    {
      label: "勾选列",
      type: "selection",
      fixed: "left",
      reserveSelection: true
    },
    {
      label: "表名",
      prop: "table_name",
      fixed: "left",
      minWidth: 200
    },
    {
      label: "创建时间",
      prop: "create_time",
      minWidth: 180,
      formatter: ({ create_time }) => {
        if (!create_time) return "";
        return new Date(create_time).toLocaleString();
      }
    },
    {
      label: "操作",
      fixed: "right",
      width: 200,
      slot: "operation"
    }
  ];

  onMounted(() => {
    onSearch();
  });

  async function onSearch() {
    loading.value = true;
    try {
      const res = await getGenerateCodeList({
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize,
        keyword: searchForm.keyword
      });
      const { list, total } = res.data ?? { list: [], total: 0 };
      dataList.value = list ?? [];
      pagination.total = total ?? 0;
      selectedRows.value = [];
      selectedNum.value = 0;
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  }

  function onReset() {
    searchForm.keyword = "";
    onSearch();
  }

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }

  function handleSelectionChange(val: any) {
    selectedRows.value = val;
    selectedNum.value = val.length;
  }

  function onSelectionCancel() {
    selectedNum.value = 0;
  }

  async function handleDelete(row: any) {
    try {
      await ElMessageBox.confirm("确认删除该配置？");
      await delFormDetail({ ids: [row.id] });
      message("删除成功", { type: "success" });
      onSearch();
    } catch (e) {
      // cancelled
    }
  }

  async function onBatchDel() {
    if (!selectedRows.value.length) {
      message("请选择要删除的记录", { type: "warning" });
      return;
    }
    try {
      await ElMessageBox.confirm(`确认删除选中的 ${selectedRows.value.length} 条记录？`);
      const ids = selectedRows.value.map((item: any) => item.id);
      await delFormDetail({ ids });
      message("批量删除成功", { type: "success" });
      onSearch();
    } catch (e) {
      // cancelled
    }
  }

  return {
    loading,
    dataList,
    selectedRows,
    selectedNum,
    searchForm,
    pagination,
    columns,
    onSearch,
    onReset,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange,
    onSelectionCancel,
    handleDelete,
    onBatchDel
  };
}
