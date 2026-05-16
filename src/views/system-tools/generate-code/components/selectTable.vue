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
        <el-table-column prop="name" label="字段名称" min-width="120" />
        <el-table-column prop="type" label="字段类型" width="100" />
        <el-table-column label="是否必填" width="90">
          <template #default="{ row }">
            <el-switch v-model="row.required" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="默认值" width="100">
          <template #default="{ row }">
            <span>{{ row.defVal ?? "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="表单类型" width="140">
          <template #default="{ row }">
            <el-select v-model="row.formType" size="small" style="width: 120px">
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
          </template>
        </el-table-column>
        <el-table-column label="表单参数" min-width="160">
          <template #default="{ row }">
            <el-input
              v-model="row.formParam"
              size="small"
              placeholder='参数：json格式'
            />
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="字段备注" min-width="120" />
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
      rows.push({
        name: col.column_name,
        type: col.data_type,
        required: col.is_nullable === "NO",
        defVal,
        formType,
        formParam: "",
        comment: col.comment || ""
      });
    }
    tableData.value = rows;
  } catch (e) {
    console.error(e);
  }
}

function getDefaultFormType(col: any): string {
  const name = (col.column_name ?? "").toLowerCase();
  const type = (col.data_type ?? "").toLowerCase();
  const datetimeTypes = ["date", "datetime", "timestamptz", "timestamp", "timestamp without time zone", "timestamp with time zone", "time without time zone", "time with time zone"];
  if (datetimeTypes.includes(type)) return "datetime";
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
</style>
