<template>
  <div class="sqlite-datasource">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="searchForm"
      class="search-form bg-bg_color w-full pl-8 pt-[12px]"
    >
      <el-form-item label="关键字：">
        <el-input
          v-model="searchForm.keyword"
          placeholder="数据源名称 / 文件路径"
          clearable
          class="!w-[240px]"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('ri/search-line')"
          :loading="loading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="onReset">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="SQLite 数据源" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(Plus)"
          @click="openDialog()"
        >
          新增数据源
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          row-key="id"
          adaptive
          :adaptiveConfig="{ offsetBottom: 108 }"
          align-whole="center"
          table-layout="auto"
          :loading="loading"
          :size="size"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="{ ...pagination, size }"
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(EditPen)"
              @click="openDialog(row)"
            >
              编辑
            </el-button>
            <el-popconfirm
              width="320"
              :title="`确认删除数据源【${row.name}】？仅删除配置，不会删除数据文件`"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button
                  class="reset-margin"
                  link
                  type="danger"
                  :size="size"
                  :icon="useRenderIcon(Delete)"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>
      </template>
    </PureTableBar>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑 SQLite 数据源' : '新增 SQLite 数据源'"
      width="600px"
      draggable
      :close-on-click-modal="false"
      @closed="handleDialogClosed"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="110px"
        @submit.prevent
      >
        <el-form-item label="数据源名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入数据源名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="数据文件路径" prop="file_path">
          <el-input
            v-model="form.file_path"
            placeholder="如 D:\\data\\app.db，文件不存在时会自动创建"
            clearable
          />
        </el-form-item>
        <el-form-item label="连接密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            :placeholder="isEdit ? '留空表示不修改原密码' : '留空表示不加密'"
            clearable
          />
          <div class="form-tip">
            填写密码时使用 gosqlite.org/vfs/crypto 进行整库加密；不填写则为普通
            SQLite。
          </div>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item v-if="testMessage" label="连接结果">
          <el-alert
            :title="testMessage"
            :type="testSuccess ? 'success' : 'error'"
            :closable="false"
            show-icon
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :loading="testing" @click="handleTest">测试连接</el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="saving"
          :disabled="!testSuccess"
          @click="handleSave"
        >
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onMounted } from "vue";
import dayjs from "dayjs";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import type { PaginationProps } from "@pureadmin/table";
import {
  getSqliteDataSourceList,
  testSqliteConnection,
  saveSqliteDataSource,
  delSqliteDataSource
} from "@/api/sqlite-dms";

import Refresh from "~icons/ep/refresh";
import Plus from "~icons/ep/plus";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";

defineOptions({
  name: "SqliteDataSource"
});

const loading = ref(false);
const dataList = ref<any[]>([]);
const searchFormRef = ref();
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
  { label: "数据源名称", prop: "name", minWidth: 160 },
  {
    label: "数据文件路径",
    prop: "file_path",
    minWidth: 300,
    showOverflowTooltip: true
  },
  {
    label: "描述",
    prop: "description",
    minWidth: 180,
    showOverflowTooltip: true
  },
  {
    label: "创建时间",
    prop: "create_time",
    minWidth: 170,
    formatter: ({ create_time }) =>
      create_time ? dayjs(create_time).format("YYYY-MM-DD HH:mm:ss") : ""
  },
  { label: "操作", fixed: "right", width: 180, slot: "operation" }
];

const dialogVisible = ref(false);
const isEdit = ref(false);
const testing = ref(false);
const saving = ref(false);
const testSuccess = ref(false);
const testMessage = ref("");
const formRef = ref();
const form = reactive({
  id: "",
  name: "",
  file_path: "",
  password: "",
  description: ""
});

const formRules = {
  name: [{ required: true, message: "请输入数据源名称", trigger: "blur" }],
  file_path: [
    { required: true, message: "请输入数据文件路径", trigger: "blur" }
  ]
};

watch(
  form,
  () => {
    testSuccess.value = false;
    testMessage.value = "";
  },
  { deep: true }
);

onMounted(() => {
  onSearch();
});

async function onSearch() {
  loading.value = true;
  try {
    const res = await getSqliteDataSourceList({
      currentPage: pagination.currentPage,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword
    });
    if (res.code === 200) {
      dataList.value = res.data?.list ?? [];
      pagination.total = res.data?.total ?? 0;
    } else {
      message(res.message || "获取数据源失败", { type: "error" });
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

function onReset() {
  searchForm.keyword = "";
  pagination.currentPage = 1;
  onSearch();
}

function handleSizeChange(val: number) {
  pagination.pageSize = val;
  pagination.currentPage = 1;
  onSearch();
}

function handleCurrentChange(val: number) {
  pagination.currentPage = val;
  onSearch();
}

function openDialog(row?: any) {
  isEdit.value = !!row;
  form.id = row?.id ?? "";
  form.name = row?.name ?? "";
  form.file_path = row?.file_path ?? "";
  form.password = "";
  form.description = row?.description ?? "";
  testSuccess.value = false;
  testMessage.value = "";
  dialogVisible.value = true;
}

function handleDialogClosed() {
  formRef.value?.resetFields?.();
  testSuccess.value = false;
  testMessage.value = "";
}

async function handleTest() {
  testSuccess.value = false;
  testMessage.value = "";
  if (!form.file_path) {
    message("请先填写数据文件路径", { type: "warning" });
    return;
  }
  testing.value = true;
  try {
    const res = await testSqliteConnection({
      id: form.id,
      name: form.name,
      file_path: form.file_path,
      password: form.password
    });
    if (res.code === 200) {
      testSuccess.value = true;
      testMessage.value = `连接成功，当前共 ${res.data?.table_count ?? 0} 张数据表`;
      message("连接成功", { type: "success" });
    } else {
      testSuccess.value = false;
      testMessage.value = res.message || "连接失败";
      message(res.message || "连接失败", { type: "error" });
    }
  } catch (error: any) {
    testSuccess.value = false;
    testMessage.value = error?.message || "连接失败";
    message(testMessage.value, { type: "error" });
  } finally {
    testing.value = false;
  }
}

async function handleSave() {
  if (!testSuccess.value) {
    message("请先测试连接，测试成功后再保存", { type: "warning" });
    return;
  }
  const valid = await formRef.value?.validate?.().catch(() => false);
  if (!valid) return;
  saving.value = true;
  try {
    const res = await saveSqliteDataSource({
      id: form.id,
      name: form.name,
      file_path: form.file_path,
      password: form.password,
      description: form.description
    });
    if (res.code === 200) {
      message(isEdit.value ? "修改成功" : "新增成功", { type: "success" });
      dialogVisible.value = false;
      onSearch();
    } else {
      message(res.message || "保存失败", { type: "error" });
    }
  } catch (error: any) {
    message(error?.message || "保存失败", { type: "error" });
  } finally {
    saving.value = false;
  }
}

async function handleDelete(row: any) {
  try {
    const res = await delSqliteDataSource({ ids: [row.id] });
    if (res.code === 200) {
      message("删除成功", { type: "success" });
      onSearch();
    } else {
      message(res.message || "删除失败", { type: "error" });
    }
  } catch (error: any) {
    ElMessageBox.alert(error?.message || "删除失败", "提示", { type: "error" });
  }
}
</script>

<style scoped>
.search-form :deep(.el-form-item) {
  margin-bottom: 12px;
}
.form-tip {
  width: 100%;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 18px;
}
</style>
