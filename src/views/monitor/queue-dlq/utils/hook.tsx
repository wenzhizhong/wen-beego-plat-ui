import dayjs from "dayjs";
import { message, closeAllMessage } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { getQueueDlqList, requeueDlq } from "@/api/queue-dlq";
import type { PaginationProps } from "@pureadmin/table";
import { reactive, ref, onMounted, toRaw } from "vue";
import { hasPerms } from "@/utils/auth";

const STATUS_MAP: Record<number, string> = {
  0: "待处理",
  1: "已重新入队"
};

export function useQueueDlq() {
  const form = reactive({
    task_name: "",
    status: "",
    create_time_begin: "",
    create_time_end: ""
  });
  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const showArgsDialog = ref(false);
  const showArgsString = ref("");
  const selectedRows = ref<any[]>([]);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  const columns: TableColumnList = [
    {
      type: "selection",
      minWidth: 50
    },
    {
      label: "任务UUID",
      prop: "task_uuid",
      minWidth: 200
    },
    {
      label: "任务名称",
      prop: "task_name",
      minWidth: 160
    },
    {
      label: "错误信息",
      prop: "error_msg",
      minWidth: 260,
      showOverflowTooltip: true
    },
    {
      label: "状态",
      cellRenderer: ({ row }: any) => {
        const typeMap: Record<number, string> = { 0: "warning", 1: "success" };
        return (
          <el-tag type={typeMap[row.status] || "info"}>
            {STATUS_MAP[row.status] || "未知"}
          </el-tag>
        );
      },
      minWidth: 100
    },
    {
      label: "创建时间",
      prop: "create_time",
      minWidth: 160,
      formatter: ({ create_time }: any) =>
        create_time ? dayjs(create_time).format("YYYY-MM-DD HH:mm:ss") : ""
    },
    {
      label: "操作",
      fixed: "right",
      width: 220,
      align: "left",
      slot: "operation"
    }
  ];

  function handleSizeChange(val: number) {
    pagination.pageSize = val || 10;
    pagination.currentPage = 1;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val || 1;
    onSearch();
  }

  function handleSelectionChange(val: any[]) {
    selectedRows.value = val;
  }
  function getQueryParams() {
    let tmpForm = {...toRaw(form), ...toRaw(pagination)}
    if (tmpForm.status === undefined || tmpForm.status === null){
      tmpForm.status = "-1"
    }
    return tmpForm
  }
  async function onSearch() {
    loading.value = true;
    // const params: Record<string, any> = {
    //   task_name: form.task_name,
    //   status: form.status === "" ? -1 : Number(form.status),
    //   create_time_begin: form.create_time_begin,
    //   create_time_end: form.create_time_end,
    //   pageSize: pagination.pageSize,
    //   currentPage: pagination.currentPage
    // };
    const params = getQueryParams();
    const { data } = await getQueueDlqList(params);
    dataList.value = data.list || [];
    pagination.total = data.total;
    pagination.pageSize = data.pageSize;
    pagination.currentPage = data.currentPage;

    setTimeout(() => {
      loading.value = false;
    }, 500);
  }
  async function getPendingLen(){
    // const params: Record<string, any> = {
    //   task_name: form.task_name,
    //   status: 0,
    //   create_time_begin: form.create_time_begin,
    //   create_time_end: form.create_time_end,
    //   pageSize: 10,
    //   currentPage: 1,
    //   getTotal: 1
    // };
    
    const params = getQueryParams();
    params['status'] = "0";
    params['getTotal'] = 1;

    const { data } = await getQueueDlqList(params);
    return data && data?.total || 0;
  }

  const resetForm = (formEl: any) => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  function handleRequeue(row: any) {
    ElMessageBox.confirm(
      `确定要将任务【${row.task_name}】重新添加到队列吗？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    ).then(async () => {
      const res = await requeueDlq({ task_uuid: row.task_uuid });
      if (res.code === 200) {
        message(`重新入队成功`, { type: "success" });
        onSearch();
      } else {
        message(res.message || "操作失败", { type: "error" });
      }
    });
  }

  async function handleBatchRequeue() {
    const pendingList = selectedRows.value.filter(
      (r: any) => r.status === 0
    );

    let pendingListLen = pendingList.length;
    if (pendingListLen === 0){
      message(`正在查询需要重新入队列条数......`, { type: "warning" });
      pendingListLen = await getPendingLen();
      closeAllMessage()
    }
    if (pendingListLen === 0) {
      message(`没有可重新入队的任务`, { type: "warning" });
      return;
    }
    
    ElMessageBox.confirm(
      `确定要批量重新入队列选中的 ${pendingListLen} 条记录吗？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    ).then(async () => {
      const taskUUIDs = pendingList.map((r: any) => r.task_uuid);
      const params = getQueryParams();
      params['status'] = "0";
      params['getTotal'] = 1;
      params['task_uuids'] = taskUUIDs;

      const res = await requeueDlq(params);
      if (res.code === 200) {
        message(`成功重新入队 ${res.data?.count || 0} 条`, { type: "success" });
        onSearch();
      } else {
        message(res.message || "操作失败", { type: "error" });
      }
    });
  }
  function parseArgs(row){
    showArgsDialog.value = true
    let task_args = row.task_args && JSON.parse(row.task_args) || []
    for (let i = 0; i < task_args.length; i++) {
      let arg = task_args[i]
      if (arg["Value"]){
        task_args[i]["Value"] = JSON.parse(window.atob(arg["Value"]))
      }
    }
    showArgsString.value = JSON.stringify(task_args, null, 2)
    console.log(row, showArgsString)
  }
  
  onMounted(() => {
    onSearch();
  });

  return {
    form,
    formRef,
    loading,
    columns,
    dataList,
    pagination,
    onSearch,
    resetForm,
    handleRequeue,
    handleBatchRequeue,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange,
    
    parseArgs,
    showArgsString,
    showArgsDialog,
  };
}
