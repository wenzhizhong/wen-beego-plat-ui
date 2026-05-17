<template>
  <el-dialog
    v-model="visible"
    :title="editData?.id ? '编辑表配置' : '选择表'"
    width="90%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-row :gutter="20" class="mb-4">
      <el-col :span="4">
        <span class="label-text">选择表</span>
      </el-col>
      <el-col :span="12">
        <el-select
          v-model="selectedTable"
          filterable
          placeholder="请选择数据库表"
          :disabled="!!editData?.id"
          @change="handleTableChange"
          style="width: 100%"
        >
          <el-option
            v-for="item in dbTableList"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-col>
    </el-row>

    <div v-if="tableDetail.fullName">
      <h3 class="table-title">表名：{{ tableDetail.fullName }}</h3>
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="name" label="字段名称" width="150" >
          <template #default="{ row }">
            <font color="#0072ff" size="3">{{ row.name }}</font>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="字段类型" width="150" />
        <el-table-column label="是否必填" width="90">
          <template #default="{ row }">
            <el-switch v-model="row.required" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="默认值" width="80">
          <template #default="{ row }">
            <span>{{ row.defVal ?? "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="表单类型" width="170">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 4px;">
              <el-select v-model="row.formType" filterable  @change="(val: string) => handleFormTypeChange(val, row)">
                <el-option value="input" label="input" />
                <el-option value="textarea" label="textarea" />
                <el-option value="select" label="select" />
                <el-option value="radio" label="radio" />
                <el-option value="switch" label="switch" />
                <el-option value="checkbox" label="checkbox" />
                <el-option value="datetime" label="datetime" />
                <el-option value="imageUpload" label="imageUpload" />
                <el-option value="fileUpload" label="fileUpload" />
                <el-option value="editor" label="editor" />
              </el-select>
              <el-link v-if="docLinks[row.formType]" :href="docLinks[row.formType]" target="_blank" type="primary" :underline="false">
                <span style="font-size: 13px;">📖</span>
              </el-link>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="字段备注" width="200" />
        <el-table-column label="表单参数" >
          <template #default="{ row }">
            <el-input
              v-model="row.formParam"
              size="small"
              type="textarea"
              placeholder='参数示例：size="small" disabled'
              class="c-textarea-font-size"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saveLoading" @click="handleSave">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import {
  getDbTableList,
  getDbTableDetail,
  saveFormDetail
} from "@/api/generate-code";
import { getVarType } from "@/components/sliceUpload/common";

const props = defineProps<{
  modelValue: boolean;
  editData?: any;
}>();

const emit = defineEmits(["update:modelValue", "refresh"]);

const visible = ref(false);
const saveLoading = ref(false);
const dbTableList = ref<string[]>([]);
const selectedTable = ref("");
const tableDetail = ref<{ fullName?: string; comment?: string; columns?: any[] }>({});
const tableData = ref<any[]>([]);

const docLinks: Record<string, string> = {
  input: "https://cn.element-plus.org/zh-CN/component/input",
  textarea: "https://cn.element-plus.org/zh-CN/component/input#text-area",
  select: "https://cn.element-plus.org/zh-CN/component/select",
  radio: "https://cn.element-plus.org/zh-CN/component/radio",
  switch: "https://cn.element-plus.org/zh-CN/component/switch",
  checkbox: "https://cn.element-plus.org/zh-CN/component/checkbox",
  datetime: "https://cn.element-plus.org/zh-CN/component/datetime-picker",
  imageUpload: "https://cn.element-plus.org/zh-CN/component/upload#picture-card",
  fileUpload: "https://cn.element-plus.org/zh-CN/component/upload"
};

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val;
    if (val) {
      initData();
      fetchDbTableList();
      if (props.editData) {
        loadEditData();
      }
    }
  },
  { immediate: true }
);

function initData() {
  tableDetail.value = {};
  tableData.value = [];
  selectedTable.value = "";
  saveLoading.value = false;
}

async function fetchDbTableList() {
  try {
    const res = await getDbTableList({});
    dbTableList.value = res.data ?? [];
  } catch (e) {
    console.error(e);
  }
}

function loadEditData() {
  const row = props.editData;
  if (!row) return;
  selectedTable.value = row.table_name;
  tableDetail.value = { fullName: row.table_name };
  if (row.data) {
    let parsed: any[];
    try {
      parsed = typeof row.data === "string" ? JSON.parse(row.data) : row.data;
    } catch {
      parsed = [];
    }
    tableData.value = parsed;
  }
}

async function handleTableChange(val: string) {
  if (!val) return;
  try {
    const res = await getDbTableDetail({ tableName: val });
    if (res.code !== 200) {
      message(res.message || "获取表详情失败", { type: "error" });
      return;
    }
    tableDetail.value = res.data;
    const columns = tableDetail.value.columns ?? [];
    const rows: any[] = [];
    for (const col of columns) {
      const formType = getDefaultFormType(col);
      const defVal = getDefaultValue(col);
      const rowData: any = {
        name: col.column_name,
        type: col.data_type,
        required: col.is_nullable === "NO",
        defVal,
        formType,
        formParam: "",
        comment: col.comment || "",
        maxLength: col.character_maximum_length ?? 0
      };
      rowData.formParam = getDefaultFormParam(formType, rowData);
      rows.push(rowData);
    }
    tableData.value = rows;
  } catch (e) {
    console.error(e);
  }
}

function getDefaultFormParam(formType: string, col: any): string {
  const maxLen = col.maxLength || 0;
  const name = col.name || "";
  let formParam  = ""

  const defaultValueVarType = getVarType(col.defVal);
  let id1 = defaultValueVarType === 'string'? "'1'": "1"
  let id2 = defaultValueVarType === 'string'? "'2'": "2"

  switch (formType) {
    case "input":
      formParam = maxLen > 0
        ? JSON.stringify({ ts: "", vue: `maxlength="${maxLen}" show-word-limit clearable` })
        : JSON.stringify({ ts: "", vue: `clearable` });
      break;
    case "textarea":
      formParam = JSON.stringify({ ts: "", vue: `maxlength="500" show-word-limit` });
      break;
    case "select":
      formParam  = JSON.stringify({
        ts: `const ${name}Props = { value: 'id', label: 'name', disabled: 'disabled' };\nconst ${name}Options = [{ id: ${id1}, name: 'Option A' }, { id: ${id2}, name: 'Option B' }];`,
        vue: `:options="${name}Options" :props="${name}Props" clearable`
      });
      break;
    case "radio":
      formParam = JSON.stringify({
        ts: `const ${name}Options = [{ id: ${id1}, name: 'Option A' }, { id: ${id2}, name: 'Option B' }];\nconst ${name}Props = { value: 'id', label: 'name' };`,
        vue: `:options="${name}Options" :props="${name}Props"`
      });
      break;
    case "checkbox":
      formParam = JSON.stringify({
        ts: `const ${name}Options = [{ id: ${id1}, name: 'Option A' }, { id: ${id2}, name: 'Option B' }];\nconst ${name}Props = { value: 'id', label: 'name' };`,
        vue: `:options="${name}Options" :props="${name}Props"`
      });
      break;
    case "switch":
      formParam = JSON.stringify({ ts: "", vue: `active-text="启用" inactive-text="禁用"` });
      break;
    case "datetime":
      formParam = JSON.stringify({ ts: "", vue: `` });
      break;
    case "imageUpload":
      formParam = JSON.stringify({ ts: "", vue: `multiple` });
      break;
    case "fileUpload":
      formParam = JSON.stringify({ ts: "", vue: `multiple` });
      break;
    case "editor":
      formParam = JSON.stringify({ ts: "", vue: `` });
      break;
  }
  return formParam;
}

function handleFormTypeChange(val: string, row: any) {
  if (val) {
    row.formParam = getDefaultFormParam(val, row);
  }
}

function getDefaultFormType(col: any): string {
  const name = (col.column_name ?? "").toLowerCase();
  const type = (col.data_type ?? "").toLowerCase();
  const timeTypes = ["time",  "time without time zone", "time with time zone"];
  const datetimeTypes = ["date", "datetime", "timestamptz", "timestamp", "timestamp without time zone", "timestamp with time zone",];
  if (datetimeTypes.includes(type)) return "datetime";
  else if (timeTypes.includes(type)) return "time";
  
  const intTypes = ["smallint", "integer", "int2", "int4", "bigint", "int8", "numeric", "decimal"];
  if (intTypes.includes(type) && (name.includes("status") || name.includes("type"))) return "radio";
  if (name.includes("image") || name.includes("img") || name.includes("avatar")) return "imageUpload";
  if (name.includes("file")) return "fileUpload";
  return "input";
}

function getDefaultValue(col: any): any {
  const defVal = col.column_default;
  const type = (col.data_type ?? "").toLowerCase();
  const numTypes = ["smallint", "integer", "int2", "int4", "bigint", "int8", "real", "float4", "double precision", "float8", "numeric", "decimal"];
  if (numTypes.includes(type) || /^(int|bigint|smallint|integer|float|double|decimal|numeric|real)/i.test(type)) {
    const n = Number(defVal);
    return isNaN(n) ? null : n;
  }
  if (type === "boolean" || type === "bool") {
    return [true, "true", 1, "1"].includes(defVal);
  }
  
  if (defVal === null || defVal === undefined) return "";
  return String(defVal).replace(/::.*$/, "").replace(/'/g, "");
}

async function handleSave() {
  if (!selectedTable.value) {
    message("请选择数据库表", { type: "warning" });
    return;
  }
  saveLoading.value = true;
  try {
    const postData = {
      id: props.editData?.id ?? "",
      table_name: selectedTable.value,
      data: JSON.stringify(tableData.value)
    };
    const res = await saveFormDetail(postData);
    if (res.code === 200) {
      message("保存成功", { type: "success" });
      emit("refresh");
      closeDialog();
    } else {
      message(res.message || "保存失败", { type: "error" });
    }
  } catch (e) {
    console.error(e);
  } finally {
    saveLoading.value = false;
  }
}

function closeDialog() {
  visible.value = false;
  emit("update:modelValue", false);
}

function handleClose() {
  closeDialog();
}
</script>

<style scoped>
.label-text {
  display: inline-block;
  height: 32px;
  line-height: 32px;
}
.table-title {
  margin: 20px 0 10px;
  font-size: 18px;
}
.c-textarea-font-size{
  font-size: 16px;
}
</style>
