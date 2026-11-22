<template>
  <div class="sqlite-data-manager">
    <div class="toolbar">
      <span class="toolbar-label">数据源：</span>
      <el-select
        v-model="selectedDataSource"
        placeholder="请选择 SQLite 数据源"
        class="!w-[280px]"
        filterable
        @change="handleDataSourceChange"
      >
        <el-option
          v-for="item in dataSources"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        >
          <span>{{ item.name }}</span>
          <span class="option-path">{{ item.file_path }}</span>
        </el-option>
      </el-select>
      <el-button
        :icon="useRenderIcon(Refresh)"
        :disabled="!selectedDataSource"
        @click="loadTables"
      >
        刷新数据表
      </el-button>
      <span v-if="currentDataSource" class="toolbar-path">
        文件：{{ currentDataSource.file_path }}
      </span>
    </div>

    <div class="workspace">
      <div class="table-panel">
        <div class="panel-title">数据表（{{ tables.length }}）</div>
        <el-scrollbar class="table-scroll">
          <div
            v-for="item in tables"
            :key="item"
            class="table-item"
            :class="{ active: item === selectedTable }"
            @click="handleSelectTable(item)"
          >
            <el-icon><Menu /></el-icon>
            <span class="table-item-name">{{ item }}</span>
          </div>
          <el-empty
            v-if="!tablesLoading && tables.length === 0"
            description="暂无数据表"
            :image-size="60"
          />
        </el-scrollbar>
      </div>

      <div class="content-panel">
        <el-tabs v-model="activeTab" class="content-tabs">
          <el-tab-pane label="表数据" name="data">
            <div v-if="!selectedTable" class="empty-tip">
              <el-empty description="请先选择一个数据表" :image-size="80" />
            </div>
            <template v-else>
              <div class="content-header">
                <span class="table-name">{{ selectedTable }}</span>
                <el-button
                  size="small"
                  :icon="useRenderIcon(Refresh)"
                  :loading="dataLoading"
                  @click="loadTableData"
                >
                  刷新
                </el-button>
              </div>
              <el-table
                v-loading="dataLoading"
                :data="tableData.rows"
                border
                stripe
                max-height="480"
                class="data-table"
              >
                <el-table-column
                  v-for="(col, colIndex) in tableData.columns"
                  :key="col + colIndex"
                  :label="col"
                  min-width="140"
                >
                  <template #default="{ row }">
                    <span
                      class="cell-value"
                      :class="{ 'is-null': isNull(row[colIndex]) }"
                      :title="formatCell(row[colIndex])"
                    >
                      {{ formatCell(row[colIndex]) }}
                    </span>
                  </template>
                </el-table-column>
                <template #empty>
                  <el-empty description="暂无数据" :image-size="60" />
                </template>
              </el-table>
              <div class="pagination-bar">
                <el-pagination
                  v-model:current-page="pagination.currentPage"
                  v-model:page-size="pagination.pageSize"
                  :total="pagination.total"
                  :page-sizes="[20, 50, 100, 200]"
                  layout="total, sizes, prev, pager, next, jumper"
                  background
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                />
              </div>
            </template>
          </el-tab-pane>

          <el-tab-pane label="表结构" name="schema">
            <div v-if="!selectedTable" class="empty-tip">
              <el-empty description="请先选择一个数据表" :image-size="80" />
            </div>
            <el-table
              v-else
              v-loading="schemaLoading"
              :data="schemaList"
              border
              stripe
              max-height="540"
            >
              <el-table-column
                prop="cid"
                label="序号"
                width="80"
                align="center"
              />
              <el-table-column prop="name" label="字段名" min-width="160" />
              <el-table-column prop="type" label="类型" min-width="140" />
              <el-table-column label="非空" width="90" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.notnull ? 'danger' : 'info'" size="small">
                    {{ row.notnull ? "是" : "否" }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="dflt_value" label="默认值" min-width="140">
                <template #default="{ row }">
                  <span :class="{ 'is-null': isNull(row.dflt_value) }">
                    {{ formatCell(row.dflt_value) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="主键" width="90" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.pk" type="success" size="small">PK</el-tag>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <template #empty>
                <el-empty description="暂无表结构" :image-size="60" />
              </template>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="SQL 执行" name="sql">
            <div v-if="!selectedDataSource" class="empty-tip">
              <el-empty description="请先选择数据源" :image-size="80" />
            </div>
            <template v-else>
              <el-input
                v-model="sqlText"
                type="textarea"
                :rows="8"
                resize="vertical"
                placeholder="支持 DML/DDL，例如：&#10;SELECT * FROM your_table LIMIT 100;&#10;CREATE TABLE demo (id INTEGER PRIMARY KEY, name TEXT);"
              />
              <div class="sql-actions">
                <el-button
                  type="primary"
                  :loading="sqlLoading"
                  :icon="useRenderIcon('ri/play-line')"
                  @click="handleExecute"
                >
                  执行
                </el-button>
                <el-button @click="handleClearSql">清空</el-button>
                <span class="sql-tip"
                  >查询语句默认最多返回 {{ maxExecuteRowLimit }} 行</span
                >
              </div>

              <div v-if="sqlResult" class="sql-result">
                <el-alert
                  v-if="sqlResult.queryType === 'exec'"
                  :title="`执行成功，影响行数：${sqlResult.rowsAffected}，耗时 ${sqlResult.elapsedMs} ms`"
                  type="success"
                  :closable="false"
                  show-icon
                />
                <template v-else>
                  <div class="sql-result-title">
                    查询结果（{{ sqlResult.rows.length }} 行，耗时
                    {{ sqlResult.elapsedMs }} ms）
                    <el-tag
                      v-if="sqlResult.truncated"
                      type="warning"
                      size="small"
                    >
                      结果已截断
                    </el-tag>
                  </div>
                  <el-table
                    :data="sqlResult.rows"
                    border
                    stripe
                    max-height="420"
                  >
                    <el-table-column
                      v-for="(col, colIndex) in sqlResult.columns"
                      :key="col + colIndex"
                      :label="col"
                      min-width="140"
                    >
                      <template #default="{ row }">
                        <span
                          class="cell-value"
                          :class="{ 'is-null': isNull(row[colIndex]) }"
                          :title="formatCell(row[colIndex])"
                        >
                          {{ formatCell(row[colIndex]) }}
                        </span>
                      </template>
                    </el-table-column>
                    <template #empty>
                      <el-empty description="无结果集" :image-size="60" />
                    </template>
                  </el-table>
                </template>
              </div>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { message } from "@/utils/message";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import {
  getAllSqliteDataSource,
  getSqliteTables,
  getSqliteTableSchema,
  getSqliteTableData,
  executeSqliteSql
} from "@/api/sqlite-dms";

import Refresh from "~icons/ep/refresh";
import Menu from "~icons/ep/menu";

defineOptions({
  name: "SqliteDataManager"
});

const maxExecuteRowLimit = 5000;

const dataSources = ref<any[]>([]);
const selectedDataSource = ref("");
const currentDataSource = computed(() =>
  dataSources.value.find(item => item.id === selectedDataSource.value)
);

const tables = ref<string[]>([]);
const tablesLoading = ref(false);
const selectedTable = ref("");
const activeTab = ref("data");

const dataLoading = ref(false);
const tableData = reactive<{
  columns: string[];
  rows: any[][];
}>({
  columns: [],
  rows: []
});
const pagination = reactive({
  total: 0,
  pageSize: 20,
  currentPage: 1
});

const schemaLoading = ref(false);
const schemaList = ref<any[]>([]);

const sqlText = ref("");
const sqlLoading = ref(false);
const sqlResult = ref<any>(null);

onMounted(async () => {
  await loadDataSources();
});

async function loadDataSources() {
  try {
    const res = await getAllSqliteDataSource();
    if (res.code === 200) {
      dataSources.value = res.data ?? [];
      if (dataSources.value.length > 0 && !selectedDataSource.value) {
        selectedDataSource.value = dataSources.value[0].id;
        await loadTables();
      }
    } else {
      message(res.message || "获取数据源失败", { type: "error" });
    }
  } catch (error) {
    console.error(error);
  }
}

async function handleDataSourceChange() {
  selectedTable.value = "";
  tables.value = [];
  tableData.columns = [];
  tableData.rows = [];
  schemaList.value = [];
  sqlResult.value = null;
  await loadTables();
}

async function loadTables() {
  if (!selectedDataSource.value) return;
  tablesLoading.value = true;
  try {
    const res = await getSqliteTables({
      dataSourceId: selectedDataSource.value
    });
    if (res.code === 200) {
      tables.value = res.data ?? [];
      if (tables.value.length > 0) {
        const stillExists = tables.value.includes(selectedTable.value);
        await handleSelectTable(
          stillExists ? selectedTable.value : tables.value[0]
        );
      } else {
        selectedTable.value = "";
      }
    } else {
      message(res.message || "获取数据表失败", { type: "error" });
    }
  } catch (error: any) {
    message(error?.message || "获取数据表失败", { type: "error" });
  } finally {
    tablesLoading.value = false;
  }
}

async function handleSelectTable(tableName: string) {
  if (!tableName) return;
  selectedTable.value = tableName;
  pagination.currentPage = 1;
  await Promise.all([loadTableData(), loadTableSchema()]);
}

async function loadTableData() {
  if (!selectedDataSource.value || !selectedTable.value) return;
  dataLoading.value = true;
  try {
    const res = await getSqliteTableData({
      dataSourceId: selectedDataSource.value,
      tableName: selectedTable.value,
      pageSize: pagination.pageSize,
      currentPage: pagination.currentPage
    });
    if (res.code === 200) {
      tableData.columns = res.data?.columns ?? [];
      tableData.rows = res.data?.rows ?? [];
      pagination.total = res.data?.total ?? 0;
    } else {
      message(res.message || "获取表数据失败", { type: "error" });
    }
  } catch (error: any) {
    message(error?.message || "获取表数据失败", { type: "error" });
  } finally {
    dataLoading.value = false;
  }
}

async function loadTableSchema() {
  if (!selectedDataSource.value || !selectedTable.value) return;
  schemaLoading.value = true;
  try {
    const res = await getSqliteTableSchema({
      dataSourceId: selectedDataSource.value,
      tableName: selectedTable.value
    });
    if (res.code === 200) {
      schemaList.value = res.data ?? [];
    } else {
      message(res.message || "获取表结构失败", { type: "error" });
    }
  } catch (error: any) {
    message(error?.message || "获取表结构失败", { type: "error" });
  } finally {
    schemaLoading.value = false;
  }
}

function handleSizeChange(size: number) {
  pagination.pageSize = size;
  pagination.currentPage = 1;
  loadTableData();
}

function handleCurrentChange(page: number) {
  pagination.currentPage = page;
  loadTableData();
}

async function handleExecute() {
  if (!selectedDataSource.value) {
    message("请先选择数据源", { type: "warning" });
    return;
  }
  if (!sqlText.value.trim()) {
    message("请输入要执行的 SQL", { type: "warning" });
    return;
  }
  sqlLoading.value = true;
  sqlResult.value = null;
  try {
    const res = await executeSqliteSql({
      dataSourceId: selectedDataSource.value,
      sql: sqlText.value
    });
    if (res.code === 200) {
      sqlResult.value = res.data;
      if (res.data?.queryType === "exec") {
        message(`执行成功，影响行数：${res.data.rowsAffected}`, {
          type: "success"
        });
        await loadTables();
      } else {
        message(`查询成功，返回 ${res.data?.rows?.length ?? 0} 行`, {
          type: "success"
        });
      }
    } else {
      message(res.message || "执行失败", { type: "error" });
    }
  } catch (error: any) {
    message(error?.message || "执行失败", { type: "error" });
  } finally {
    sqlLoading.value = false;
  }
}

function handleClearSql() {
  sqlText.value = "";
  sqlResult.value = null;
}

function isNull(value: any) {
  return value === null || value === undefined;
}

function formatCell(value: any): string {
  if (value === null || value === undefined) {
    return "NULL";
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}
</script>

<style scoped>
.sqlite-data-manager {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--el-bg-color);
  border-radius: 4px;
}

.toolbar-label {
  color: var(--el-text-color-regular);
}

.toolbar-path {
  overflow: hidden;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.option-path {
  float: right;
  margin-left: 16px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.workspace {
  display: flex;
  gap: 12px;
  min-height: 600px;
}

.table-panel {
  display: flex;
  flex-direction: column;
  width: 260px;
  min-width: 220px;
  background: var(--el-bg-color);
  border-radius: 4px;
}

.panel-title {
  padding: 12px;
  color: var(--el-text-color-primary);
  font-weight: 600;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.table-scroll {
  flex: 1;
  max-height: 640px;
}

.table-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 12px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  transition: background-color 0.2s;
}

.table-item:hover {
  background: var(--el-fill-color-light);
}

.table-item.active {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-right: 3px solid var(--el-color-primary);
}

.table-item-name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.content-panel {
  flex: 1;
  min-width: 0;
  padding: 0 12px 12px;
  background: var(--el-bg-color);
  border-radius: 4px;
}

.content-tabs {
  height: 100%;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.table-name {
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.empty-tip {
  padding: 60px 0;
}

.cell-value {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.cell-value.is-null {
  color: var(--el-text-color-placeholder);
  font-style: italic;
}

.sql-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

.sql-tip {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.sql-result {
  margin-top: 12px;
}

.sql-result-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: var(--el-text-color-primary);
  font-weight: 600;
}
</style>
