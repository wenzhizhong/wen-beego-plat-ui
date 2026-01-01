<script setup lang="ts">
import { useCron } from "./utils/hook";
import { hasPerms } from "@/utils/auth";
import { ref, computed, nextTick, onMounted } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import {
  delay,
  subBefore,
  deviceDetection,
  useResizeObserver
} from "@pureadmin/utils";

// import Database from "~icons/ri/database-2-line";
// import More from "~icons/ep/more-filled";
import Delete from "~icons/ep/delete";
import EditPen from "~icons/ep/edit-pen";
import Refresh from "~icons/ep/refresh";
import Menu from "~icons/ep/menu";
import AddFill from "~icons/ri/add-circle-line";
import Close from "~icons/ep/close";
import Check from "~icons/ep/check";


defineOptions({
  name: "CrontabIndex"
});

const iconClass = computed(() => {
  return [
    "w-[22px]",
    "h-[22px]",
    "flex",
    "justify-center",
    "items-center",
    "outline-hidden",
    "rounded-[4px]",
    "cursor-pointer",
    "transition-colors",
    "hover:bg-[#0000000f]",
    "dark:hover:bg-[#ffffff1f]",
    "dark:hover:text-[#ffffffd9]"
  ];
});

const treeRef = ref();
const formRef = ref();
const tableRef = ref();
const contentRef = ref();
const treeHeight = ref();
const defaultCheckedKeys = ref([])
const currentNodeKey = ref("")
const {
  form,
  isShow,
  loading,
  columns,
  rowStyle,
  dataList,
  pagination,
  onSearch,
  resetForm,
  handleDelete,
  default_unit_id,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange,
  avaibleCronList,
} = useCron();

onMounted(() => {
  let tmpUnitId = default_unit_id.value || ""
  if(tmpUnitId) {
    currentNodeKey.value = tmpUnitId;
    defaultCheckedKeys.value = [tmpUnitId]
  }

  useResizeObserver(contentRef, async () => {
    await nextTick();
    delay(60).then(() => {
      treeHeight.value = parseFloat(
        subBefore(tableRef.value.getTableDoms().tableWrapper.style.height, "px")
      );
    });
  });
});


</script>

<template>
  <div >
    <el-form
      ref="formRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item label="定时任务名称：" prop="name">
        <el-select v-model="form.name_en" style="width:180px">
          <el-option
            v-for="item in avaibleCronList"
            :key="item.name_en"
            :label="item.name"
            :value="item.name_en"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="时间:" prop="created_at">
        <el-date-picker
          v-model="form.created_at"
          value-format="YYYY-MM-DD 00:00:00"
        ></el-date-picker>
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

    <div
      ref="contentRef"
      :class="['flex', deviceDetection() ? 'flex-wrap' : '']"
    >
        <!-- :class="[isShow && !deviceDetection() ? 'w-[60vw]!' : 'w-full']" -->
      <PureTableBar
        :class="[isShow ? '!w-[58vw]' : 'w-full']"
        style="transition: width 220ms cubic-bezier(0.4, 0, 0.2, 1)"
        title="定时任务管理"
        :columns="columns"
        @refresh="onSearch"
      >
        <template #buttons></template>
        <template v-slot="{ size, dynamicColumns }">
          <pure-table
            ref="tableRef"
            align-whole="center"
            showOverflowTooltip
            table-layout="auto"
            :loading="loading"
            :size="size"
            adaptive
            :row-style="rowStyle"
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
            <template #operation="{ row }"></template>
          </pure-table>
        </template>
      </PureTableBar>

    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.main-content {
  margin: 8px 8px 0 !important;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
:deep(.copy-remark){
  user-select: none;
  transition: all 0.1s ease-in-out;
}
:deep(.copy-remark:hover){
  cursor: pointer;
  color: var(--el-color-primary);
}

</style>
