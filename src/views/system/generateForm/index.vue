<script setup lang="ts">
import { ref } from "vue";
import { hasPerms } from "@/utils/auth";
import { useGenerateForm, previewVisible, previewFileList, t_selectOptions, t_switchOptions, t_radioOptions, t_checkboxOptions } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import GenerateFormForm from "./form.vue";

import SelectUserUnitTree from "@/components/unit/SelectUserUnitTree.vue";

import Delete from "~icons/ep/delete";
import EditPen from "~icons/ep/edit-pen";
import Refresh from "~icons/ep/refresh";
import AddFill from "~icons/ri/add-circle-line";

defineOptions({
  name: "system_GenerateForm"
});

const formRef = ref();
const tableRef = ref();
const searchFormRef = ref();
const {
  loading,
  dataList,
  selectedNum,
  searchForm,
  pagination,
  columns,
  onSearch,
  resetForm,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange,
  onSelectionCancel,
  openDialog,
  handleDelete,
  onBatchDel,
  onTreeSelect,
} = useGenerateForm(formRef);
</script>

<template>
<div :class="['flex']">
  <SelectUserUnitTree
    ref="treeRef"
    
    @tree-select="onTreeSelect"
  />
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="searchForm"
      class="search-form bg-bg_color w-full pl-8 pt-[12px]"
    >
    <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="10" :lg="6" :xl="6">
          <el-form-item label="输入框：" prop="t_input">
            <el-input v-model="searchForm.t_input" placeholder="请输入输入框" clearable class="!w-[180px]" />
            
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="10" :lg="6" :xl="6">
          <el-form-item label="文本：" prop="t_textarea">
            <el-input v-model="searchForm.t_textarea" placeholder="请输入文本" clearable class="!w-[180px]" />
            
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="10" :lg="6" :xl="6">
          <el-form-item label="下拉选择：" prop="t_select">
            <el-select v-model="searchForm.t_select" multiple placeholder="下拉选择" clearable class="!w-[200px]">
              <el-option v-for="o in t_selectOptions" :key="o.id" :label="o.name" :value="o.id" />
            </el-select>
            
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="10" :lg="6" :xl="6">
          <el-form-item label="开关：" prop="t_switch">
            <el-select v-model="searchForm.t_switch" placeholder="开关" clearable class="!w-[160px]">
              <el-option v-for="o in t_switchOptions" :key="o.id" :label="o.name" :value="o.id" />
            </el-select>
            
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="10" :lg="6" :xl="6">
          <el-form-item label="单选框：" prop="t_radio">
            <el-select v-model="searchForm.t_radio" placeholder="单选框" clearable class="!w-[160px]">
              <el-option v-for="o in t_radioOptions" :key="o.id" :label="o.name" :value="o.id" />
            </el-select>
            
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="10" :lg="6" :xl="6">
          <el-form-item label="多选：" prop="t_checkbox">
            <el-select v-model="searchForm.t_checkbox" multiple placeholder="多选" clearable class="!w-[200px]">
              <el-option v-for="o in t_checkboxOptions" :key="o.id" :label="o.name" :value="o.id" />
            </el-select>
            
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="10" :lg="6" :xl="6">
          <el-form-item label="时间：" prop="t_datetime">
            <el-date-picker v-model="searchForm.t_datetime" type="daterange" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" class="!w-[240px]" />
            
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="10" :lg="6" :xl="6">
          <el-form-item label="创建人：" prop="create_uid">
            <el-input v-model="searchForm.create_uid" placeholder="请输入创建人" clearable class="!w-[180px]" />
            
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="10" :lg="6" :xl="6">
          <el-form-item label="创建时间：" prop="create_time">
            <el-date-picker v-model="searchForm.create_time" type="daterange" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" class="!w-[240px]" />
            
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="10" :lg="6" :xl="6">
          <el-form-item label="更新人：" prop="update_uid">
            <el-input v-model="searchForm.update_uid" placeholder="请输入更新人" clearable class="!w-[180px]" />
            
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="10" :lg="6" :xl="6">
          <el-form-item label="更新时间：" prop="update_time">
            <el-date-picker v-model="searchForm.update_time" type="daterange" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" class="!w-[240px]" />
            
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="10" :lg="6" :xl="6">
          <el-form-item>
            <el-button type="primary" :icon="useRenderIcon('ri/search-line')" :loading="loading" @click="onSearch">搜索</el-button>
            <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(searchFormRef)">重置</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <PureTableBar title="" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button type="primary" :icon="useRenderIcon(AddFill)" @click="openDialog()" :disabled="!hasPerms(['admin_plat:system-generateForm:add'])">新增</el-button>
        <el-button type="danger" :icon="useRenderIcon(Delete)" :disabled="!hasPerms(['admin_plat:system-generateForm:del']) || selectedNum === 0" @click="onBatchDel(tableRef?.getTableRef()?.getSelectionRows())">批量删除</el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <div
          v-if="selectedNum > 0"
          v-motion-fade
          class="bg-[var(--el-fill-color-light)] w-full h-[46px] mb-2 pl-4 flex items-center"
        >
          <div class="flex-auto">
            <span class="text-[rgba(42,46,54,0.5)] dark:text-[rgba(220,220,242,0.5)]">
              已选 {{ selectedNum }} 项
            </span>
            <el-button type="primary" text @click="onSelectionCancel">取消选择</el-button>
          </div>
        </div>
        <pure-table
          ref="tableRef"
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
          @selection-change="handleSelectionChange"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row }">
            <el-button class="reset-margin" link type="primary" :size="size" :icon="useRenderIcon(EditPen)" @click="openDialog('编辑', row)" :disabled="!hasPerms(['admin_plat:system-generateForm:edit', 'admin_plat:system-generateForm:detail'])">编辑</el-button>
            <el-button class="reset-margin" link type="danger" :size="size" :icon="useRenderIcon(Delete)" @click="handleDelete(row)" :disabled="!hasPerms(['admin_plat:system-generateForm:del'])">删除</el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>

    <GenerateFormForm ref="formRef" @refresh="onSearch" />

    <el-dialog v-model="previewVisible" title="附件预览" width="700px">
      <div v-for="item in previewFileList" :key="item.id" class="preview-item">
        <el-image v-if="['jpg','jpeg','png','gif','webp','bmp'].includes(item.suffix)" :src="item.path" fit="contain" style="max-width:100%;max-height:400px" />
        <div v-else>
          <el-link :href="item.path" target="_blank" type="primary">{{ item.name }}</el-link>
        </div>
      </div>
    </el-dialog>
  </div>
</div>
</template>

<style scoped>
.main {
  margin: 0;
}
.search-form :deep(.el-form-item) {
  margin-bottom: 12px;
}
.preview-item {
  margin-bottom: 12px;
}
.el-form--inline .el-form-item{
  width: 100%;
  margin-right: 0;
  :deep(  .el-form-item__label){
    min-width: 82px;
  }
}
</style>

