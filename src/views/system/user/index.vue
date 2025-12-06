<script setup lang="ts">
import { ref, onMounted } from "vue";
import { hasPerms } from "@/utils/auth";
import SelectUserUnitTree from "@/components/unit/SelectUserUnitTree.vue";
import SelectDeptCascader from "@/components/unitDept/SelectDeptCascader.vue";
import { useUser } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Upload from "~icons/ri/upload-line";
import Role from "~icons/ri/admin-line";
import Password from "~icons/ri/lock-password-line";
import More from "~icons/ep/more-filled";
import Delete from "~icons/ep/delete";
import EditPen from "~icons/ep/edit-pen";
import Refresh from "~icons/ep/refresh";
import AddFill from "~icons/ri/add-circle-line";

defineOptions({
  name: "SystemUser"
});

const treeRef = ref();
const formRef = ref();
const tableRef = ref();
const defaultCheckedKeys = ref([])
const currentNodeKey = ref("")

function handelSelectUserUnitDept(e){
  if (e && e[0]){
    // form.deptId = e[e.length-1]
    form.deptId = e.join(",")
  }
}

const {
  form,
  loading,
  columns,
  dataList,
  treeData,
  treeLoading,
  selectedNum,
  pagination,
  buttonClass,
  deviceDetection,
  onSearch,
  resetForm,
  onbatchDel,
  openDialog,
  onTreeSelect,
  handleUpdate,
  handleDelete,
  handleUpload,
  handleReset,
  handleRole,
  handleSizeChange,
  onSelectionCancel,
  handleCurrentChange,
  handleSelectionChange,
  default_unit_id,
} = useUser(tableRef, treeRef);

onMounted(() => {
  let tmpUnitId = default_unit_id.value || ""
  form.selectUnitIds = tmpUnitId;
  if(tmpUnitId) {
    currentNodeKey.value = tmpUnitId;
    defaultCheckedKeys.value = [tmpUnitId]
  }
  console.log("tmpUnitId=", tmpUnitId);

  // useResizeObserver(contentRef, async () => {
  //   await nextTick();
  //   delay(60).then(() => {
  //     treeHeight.value = parseFloat(
  //       subBefore(tableRef.value.getTableDoms().tableWrapper.style.height, "px")
  //     );
  //   });
  // });
});

</script>

<template>
  <div :class="['flex']">
    <SelectUserUnitTree
      ref="treeRef"
      @tree-select="onTreeSelect"
      :defaultCheckedKeys="defaultCheckedKeys"
      :currentNodeKey="currentNodeKey"
    />
    <div >
      <el-form
        ref="formRef"
        :inline="true"
        :model="form"
        class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
      >
      
        <el-form-item label="部门：" prop="name">
          <SelectDeptCascader  :changed="handelSelectUserUnitDept" :modelValue="''" :selectUnitIds="form.selectUnitIds"></SelectDeptCascader>
        </el-form-item>
        <el-form-item label="用户名称：" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入用户名称"
            clearable
            class="!w-[180px]"
          />
        </el-form-item>
        <el-form-item label="手机号码：" prop="phone">
          <el-input
            v-model="form.phone"
            placeholder="请输入手机号码"
            clearable
            class="!w-[180px]"
          />
        </el-form-item>
        <el-form-item label="状态：" prop="status">
          <el-select
            v-model="form.status"
            placeholder="请选择"
            clearable
            class="!w-[180px]"
          >
            <el-option label="已开启" value="1" />
            <el-option label="已关闭" value="0" />
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
        title="用户管理"
        :columns="columns"
        @refresh="onSearch"
      >
        <template #buttons>
          <el-button
            type="primary"
            :icon="useRenderIcon(AddFill)"
            @click="openDialog()"
            :disabled="!hasPerms(['admin_plat:system-user:add'])"
          >
            新增用户
          </el-button>
        </template>
        <template v-slot="{ size, dynamicColumns }">
          <div
            v-if="selectedNum > 0"
            v-motion-fade
            class="bg-[var(--el-fill-color-light)] w-full h-[46px] mb-2 pl-4 flex items-center"
          >
            <div class="flex-auto">
              <span
                style="font-size: var(--el-font-size-base)"
                class="text-[rgba(42,46,54,0.5)] dark:text-[rgba(220,220,242,0.5)]"
              >
                已选 {{ selectedNum }} 项
              </span>
              <el-button type="primary" text @click="onSelectionCancel">
                取消选择
              </el-button>
            </div>
            <el-popconfirm title="是否确认删除?" @confirm="onbatchDel">
              <template #reference>
                <el-button type="danger" text class="mr-1!" :disabled="!hasPerms(['admin_plat:system-user:del'])">
                  批量删除
                </el-button>
              </template>
            </el-popconfirm>
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
              <el-button
                class="reset-margin"
                link
                type="primary"
                :size="size"
                :icon="useRenderIcon(EditPen)"
                @click="openDialog('修改', row)"
                :disabled="!hasPerms(['admin_plat:system-user:edit'])"
              >
                修改
              </el-button>
              <el-popconfirm
                width="320"
                :icon="Delete"
                icon-color="red"
                confirm-button-type="danger"
                :title="`是否确认删除用户 【${row.name}】`"
                @confirm="handleDelete([row.id])"
              >
                <template #reference>
                  <el-button
                    class="reset-margin"
                    link
                    type="danger"
                    :size="size"
                    :icon="useRenderIcon(Delete)"
                    :disabled="!hasPerms(['admin_plat:system-user:del'])"
                  >
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
              <el-dropdown>
                <el-button
                  class="ml-3! mt-[2px]!"
                  link
                  type="primary"
                  :size="size"
                  :icon="useRenderIcon(More)"
                  @click="handleUpdate(row)"
                />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>
                      <el-button
                        :class="buttonClass"
                        link
                        type="primary"
                        :size="size"
                        :icon="useRenderIcon(Upload)"
                        @click="handleUpload(row)"
                      >
                        上传头像
                      </el-button>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <el-button
                        :class="buttonClass"
                        link
                        type="primary"
                        :size="size"
                        :icon="useRenderIcon(Password)"
                        @click="handleReset(row)"
                      >
                        重置密码
                      </el-button>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <el-button
                        :class="buttonClass"
                        link
                        type="primary"
                        :size="size"
                        :icon="useRenderIcon(Role)"
                        @click="handleRole(row)"
                      >
                        分配角色
                      </el-button>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
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

:deep(.el-button:focus-visible) {
  outline: none;
}

.main-content {
  margin: 8px 8px 0 !important;
  .left-tree{
    z-index: 0;
  }
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
