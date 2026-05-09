<script setup lang="ts">
import { useQueueDlq } from "./utils/hook";
import { hasPerms } from "@/utils/auth";
import { ref } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Refresh from "~icons/ep/refresh";

defineOptions({
  name: "QueueDlqIndex"
});

const formRef = ref();
const {
  form,
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
  showArgsDialog,
  showArgsString,
  parseArgs
} = useQueueDlq();
</script>

<template>
  <div>
    <el-form
      ref="formRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item label="任务名称：" prop="task_name">
        <el-input
          v-model="form.task_name"
          placeholder="请输入任务名称"
          clearable
          style="width:200px"
        />
      </el-form-item>
      <el-form-item label="状态：" prop="status">
        <el-select v-model="form.status" placeholder="请选择状态" clearable style="width:140px">
          <el-option label="全部" value="" />
          <el-option label="待处理" value="0" />
          <el-option label="已重新入队" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间：" prop="create_time">
        <el-date-picker
          v-model="form.create_time_begin"
          type="datetime"
          placeholder="开始时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width:180px"
        />
        <span class="mx-2">-</span>
        <el-date-picker
          v-model="form.create_time_end"
          type="datetime"
          placeholder="结束时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width:180px"
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
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar
      title="死信队列日志"
      :columns="columns"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          type="warning"
          :icon="useRenderIcon('ri/refresh-line')"
          :disabled="!hasPerms(['admin_plat:monitor-queue-dlq:requeue'])"
          @click="handleBatchRequeue"
        >
          批量重新入队
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          align-whole="center"
          showOverflowTooltip
          table-layout="auto"
          :loading="loading"
          :size="size"
          adaptive
          :adaptiveConfig="{ offsetBottom: 108 }"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="{ ...pagination, size }"
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }"
          @selection-change="handleSelectionChange"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row }">
            <el-button
                  link
                  type="info"
                  :icon="useRenderIcon('ri/refresh-line')"
                  @click="parseArgs(row)"
                >
                  查看参数
            </el-button>

            <el-popconfirm
              v-if="row.status === 0"
              title="确定将该任务重新添加到队列？"
              @confirm="handleRequeue(row)"
            >
              <template #reference>
                <el-button
                  link
                  type="primary"
                  :icon="useRenderIcon('ri/refresh-line')"
                  :disabled="!hasPerms(['admin_plat:monitor-queue-dlq:requeue'])"
                >
                  重新入队
                </el-button>
              </template>
            </el-popconfirm>
            
          </template>
        </pure-table>
      </template>
    </PureTableBar>


    <el-dialog
      v-model="showArgsDialog"
      title="参数详情"
      width="800px"
    >
      <div class="show-args-box">
        <pre>{{ showArgsString }}
        </pre>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
.show-args-box{
  max-height: 700px;
  overflow: hidden;
  overflow-y: scroll;
}
</style>
