<script setup lang="ts">
import { ref } from "vue";
import { hasPerms } from "@/utils/auth";
import { useHook } from "./utils/hook";
// import { transformI18n } from "@/plugins/i18n";
let transformI18n = (label: string) => label; // 不需要i18n,临时解决i18n报错
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Delete from "~icons/ep/delete";
import EditPen from "~icons/ep/edit-pen";
import Refresh from "~icons/ep/refresh";
import AddFill from "~icons/ri/add-circle-line";

defineOptions({
  name: "SystemUnit"
});

const formRef = ref();
const tableRef = ref();
const {
  form,
  loading,
  pagination,
  columns,
  dataList,
  getStatusMap,
  onSearch,
  resetForm,
  openDialog,
  handleDelete,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange
} = useHook();

function onFullscreen() {
  // 重置表格高度
  tableRef.value.setAdaptive();
}
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item label="组织单位名称：" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入组织单位名称"
          clearable
          class="!w-[180px]"
        />
      </el-form-item>
      <el-form-item label="组织机构代码：" prop="code">
        <el-input
          v-model="form.code"
          placeholder="请输入组织机构代码："
          clearable
          class="!w-[180px]"
        />
      </el-form-item>
      
      <el-form-item label="状态：" prop="status">
        <el-select v-model="form.status" placeholder="请选择状态"  style="width: 180px;">
          <el-option :key="'-1'" :label="'全部'" :value="-1"></el-option>
          <el-option
            v-for="(item, index) in getStatusMap"
            :key="index"
            :label="item.text "
            :value="Number(index)"
          ></el-option>
        </el-select>
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
      title="组织单位管理"
      :columns="columns"
      :isExpandAll="false"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
      @fullscreen="onFullscreen"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog()"
          :disabled="!hasPerms(['admin_plat:system-unit:add'])"
        >
          新增组织单位
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          ref="tableRef"
          adaptive
          :adaptiveConfig="{ offsetBottom: 45 }"
          align-whole="center"
          row-key="id"
          showOverflowTooltip
          table-layout="auto"
          default-expand-all
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
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(EditPen)"
              @click="openDialog('修改', row)"
              :disabled="!hasPerms(['admin_plat:system-unit:edit'])"
            >
              修改
            </el-button>
            <el-button
              v-show="row.menuType !== 3"
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(AddFill)"
              @click="openDialog('新增', { pid: row.id } as any)"
              :disabled="!hasPerms(['admin_plat:system-unit:add'])"
            >
              新增
            </el-button>
            <el-popconfirm
              width="320"
              :icon="Delete"
              icon-color="red"
              confirm-button-type="danger"
              :title="`是否确认删除组织单位【${transformI18n(row.name)}】${row?.children?.length > 0 ? '。注意下级组织单位也会一并删除，请谨慎操作' : ''}`"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button
                  class="reset-margin"
                  link
                  type="danger"
                  :size="size"
                  :icon="useRenderIcon(Delete)"
                  :disabled="!hasPerms(['admin_plat:system-unit:del'])"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
    
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-table__inner-wrapper::before) {
  height: 0;
}

.main-content {
  box-sizing: border-box;
  margin: 8px 8px 0 !important;
  :deep(.unit-logo){
    img{
      border-radius: 4px;
    }
  }
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
