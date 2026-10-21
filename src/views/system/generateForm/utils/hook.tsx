import { reactive, ref, onMounted, nextTick } from "vue";
import dayjs from "dayjs";
import { message } from "@/utils/message";
import { ElMessageBox, ElDialog, ElImage, ElLink } from "element-plus";
import { listToMap, getFileSuffix, getFileIcon } from "@/utils/util.js";
import { dateParsingInZone } from "@/utils/time";
import { getGenerateFormList, delGenerateForm } from "@/api/generateForm";
import { getLinkById } from "@/api/upload";
import type { PaginationProps } from "@pureadmin/table";
import type { FormItemProps } from "./types";


export const t_selectProps = { value: 'id', label: 'name', disabled: 'disabled' };
export const t_selectOptions = [{ id: '1', name: 'Option A' }, { id: '2', name: 'Option B' }];

export const t_switchOptions = [{id: 1, name: '是'}, {id: 0, name: '否'}]

export const t_radioOptions = [{ id: '1', name: 'Option A' }, { id: '2', name: 'Option B' }];
export const t_radioProps = { value: 'id', label: 'name' };

export const t_checkboxOptions = [{ id: '1', name: 'Option A' }, { id: '2', name: 'Option B' }];
export const t_checkboxProps = { value: 'id', label: 'name' };



const t_selectOptionsMap = listToMap(t_selectOptions, 'id', 'name');

const t_switchOptionsMap = listToMap(t_switchOptions, 'id', 'name');

const t_radioOptionsMap = listToMap(t_radioOptions, 'id', 'name');

const t_checkboxOptionsMap = listToMap(t_checkboxOptions, 'id', 'name');


export const previewVisible = ref(false);
export const previewFileList = ref<any[]>([]);

export async function handlePreview(row: any, key: string) {
  if (!row[key]) return;
  const ids = typeof row[key] === 'string' ? row[key].split(',').filter(Boolean) : [row[key]];
  if (!ids.length) return;
  const res: any = await getLinkById(ids);
  if (res?.code !== 200) { message("获取文件链接失败", { type: "error" }); return; }
  previewFileList.value = (res?.data?.list || []).map((item: any) => ({
    id: item.id, name: item.realName, path: item.path, suffix: getFileSuffix(item.realName)
  }));
  previewVisible.value = true;
}

export function useGenerateForm(formRef: any) {
  const loading = ref(false);
  const dataList = ref([]);
  const selectedNum = ref(0);

  const searchForm = reactive({
    t_input: "",
    t_textarea: "",
    t_select: [],
    t_switch: "",
    t_radio: "",
    t_checkbox: [],
    t_datetime: "",
    create_uid: "",
    create_time: "",
    update_uid: "",
    update_time: "",
    unit_id: "",
  
    selectUnitIds:"", });

  const pagination = reactive<PaginationProps>({
    total: 0, pageSize: 10, currentPage: 1, background: true
  });

  const columns: TableColumnList = [
    { label: "勾选列", type: "selection", fixed: "left", reserveSelection: true },
    {
      label: "输入框",
      prop: "t_input",
      minWidth: 120
    },
    {
      label: "文本",
      prop: "t_textarea",
      minWidth: 120
    },
    {
      label: "下拉选择",
      prop: "t_select",
      cellRenderer: ({ row, props }: any) => {
        if (!row.t_select) return <span>-</span>;
        return <span>{ (row.t_select || '').split(',').filter(Boolean).map((v: string) => t_selectOptionsMap[v] ?? v).join(', ') }</span>;
      },
      minWidth: 120
    },
    {
      label: "开关",
      prop: "t_switch",
      cellRenderer: ({ row, props }: any) => <span>{ t_switchOptionsMap[row.t_switch] ?? row.t_switch }</span>,
      minWidth: 120
    },
    {
      label: "单选框",
      prop: "t_radio",
      cellRenderer: ({ row, props }: any) => <span>{ t_radioOptionsMap[row.t_radio] ?? row.t_radio }</span>,
      minWidth: 120
    },
    {
      label: "多选",
      prop: "t_checkbox",
      cellRenderer: ({ row, props }: any) => {
        if (!row.t_checkbox) return <span>-</span>;
        return <span>{ (row.t_checkbox || '').split(',').filter(Boolean).map((v: string) => t_checkboxOptionsMap[v] ?? v).join(', ') }</span>;
      },
      minWidth: 120
    },
    {
      label: "时间",
      prop: "t_datetime",
      formatter: ({ t_datetime }: any) => t_datetime ? dayjs(t_datetime).format("YYYY-MM-DD HH:mm:ss") : "",
      minWidth: 120
    },
    {
      label: "文件",
      prop: "t_file",
      cellRenderer: ({ row, props }: any) => {
        if (!row.t_file) return <span>-</span>;
        const count = (row.t_file || '').split(',').filter(Boolean).length;
        return <el-link type="primary" onClick={() => handlePreview(row, 't_file')}>{ count } 个文件</el-link>;
      },
      minWidth: 120
    },
    {
      label: "多文件",
      prop: "t_files",
      cellRenderer: ({ row, props }: any) => {
        if (!row.t_files) return <span>-</span>;
        const count = (row.t_files || '').split(',').filter(Boolean).length;
        return <el-link type="primary" onClick={() => handlePreview(row, 't_files')}>{ count } 个文件</el-link>;
      },
      minWidth: 120
    },
    {
      label: "创建时间",
      prop: "create_time",
      formatter: ({ create_time }: any) => create_time ? dayjs(create_time).format("YYYY-MM-DD HH:mm:ss") : "",
      minWidth: 120
    },
    {
      label: "更新时间",
      prop: "update_time",
      formatter: ({ update_time }: any) => update_time ? dayjs(update_time).format("YYYY-MM-DD HH:mm:ss") : "",
      minWidth: 120
    },

    { label: "创建人", prop: "created_by_name", minWidth: 100 },
    { label: "更新人", prop: "updated_by_name", minWidth: 100 },
    { label: "组织单位", prop: "unit_name", minWidth: 120 },
    { label: "操作", fixed: "right", width: 180, slot: "operation" }
  ];

  onMounted(() => { onSearch(); });

  async function onSearch() {
    loading.value = true;
    try {
      const searchDto: any = {};
      for (const k of Object.keys(searchForm)) {
        let val = (searchForm as any)[k];
        if (val === '' || val === null || val === undefined) continue;
        if (Array.isArray(val) && val.length === 2 && !isNaN(Date.parse(val[0]))) {
          searchDto[k + 'Start'] = dateParsingInZone(val[0]);
          searchDto[k + 'End']   = dateParsingInZone(val[1]);
        } else if (Array.isArray(val)) {
          searchDto[k] = val.join(',');
        } else {
          searchDto[k] = val;
        }
      }
      const res = await getGenerateFormList({
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize,
        dto: encodeURIComponent(JSON.stringify(searchDto))
      });
      const { list, total } = res.data ?? { list: [], total: 0 };
      dataList.value = list ?? [];
      pagination.total = total ?? 0;
      selectedNum.value = 0;
    } finally { loading.value = false; }
  }

  function resetForm(formEl: any) { if (formEl) { formEl.resetFields(); onSearch(); } }
  function handleSizeChange(val: number) { pagination.pageSize = val; onSearch(); }
  function handleCurrentChange(val: number) { pagination.currentPage = val; onSearch(); }
  function handleSelectionChange(val: any) { selectedNum.value = val.length; }
  function onSelectionCancel() { selectedNum.value = 0; }

  function openDialog(title = "新增", row?: FormItemProps) {
    nextTick(() => { formRef.value?.open(title, row); });
  }

  async function handleDelete(row: any) {
    try {
      await ElMessageBox.confirm("确认删除该记录？");
      const res = await delGenerateForm({ id: row.id });
      if (res.code === 200) { message("删除成功", { type: "success" }); onSearch(); }
      else { message(res.message || "删除失败", { type: "error" }); }
    } catch {}
  }

  async function onBatchDel(rows: any[]) {
    if (!rows.length) { message("请选择要删除的记录", { type: "warning" }); return; }
    try {
      await ElMessageBox.confirm(`确认删除选中的 ${rows.length} 条记录？`);
      const ids = rows.map((item: any) => item.id);
      const res = await delGenerateForm({ ids });
      if (res.code === 200) { message("批量删除成功", { type: "success" }); onSearch(); }
      else { message(res.message || "删除失败", { type: "error" }); }
    } catch {}
  }
  function onTreeSelect({ id, selected}){
    searchForm.selectUnitIds = selected ? id : "";
    onSearch();
  } 

  return {
    loading, dataList, selectedNum, searchForm, pagination, columns,
    onSearch, resetForm, handleSizeChange, handleCurrentChange,
    handleSelectionChange, onSelectionCancel, openDialog, handleDelete, onBatchDel, 
    onTreeSelect, 
  };
}
