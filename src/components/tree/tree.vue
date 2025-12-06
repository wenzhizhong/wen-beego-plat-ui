<script setup lang="ts">
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { ref, computed, watch, getCurrentInstance, onMounted } from "vue";

import Dept from "~icons/ri/git-branch-line";
import Reset from "~icons/ri/restart-line";
import More2Fill from "~icons/ri/more-2-fill?width=18&height=18";
import OfficeBuilding from "~icons/ep/office-building";
import LocationCompany from "~icons/ep/add-location";
import ExpandIcon from "./svg/expand.svg?component";
import UnExpandIcon from "./svg/unexpand.svg?component";
import { nextTick } from "process";
import { string } from "vue-types";

interface Tree {
  id: number;
  name: string;
  highlight?: boolean;
  children?: Tree[];
}

const props = defineProps({
  treeLoading: Boolean,
  treeData: Array,
  placeholder: String,
  defaultCheckedKeys: {
    type: Array as () => number[],
    default: () => []
  },
  currentNodeKey: String
});

const emit = defineEmits(["tree-select"]);

const dragBorder = ref();
const treeRef = ref();
const isExpand = ref(true);
const searchValue = ref("");
const highlightMap = ref({});
const { proxy } = getCurrentInstance();
const defaultProps = {
  children: "children",
  label: "name"
};
const buttonClass = computed(() => {
  return [
    "h-[20px]!",
    "text-sm!",
    "reset-margin",
    "text-(--el-text-color-regular)!",
    "dark:text-white!",
    "dark:hover:text-primary!"
  ];
});

const filterNode = (value: string, data: Tree) => {
  if (!value) return true;
  return data.name.includes(value);
};

function nodeClick(value) {
  const nodeId = value.$treeNodeId;
  highlightMap.value[nodeId] = highlightMap.value[nodeId]?.highlight
    ? Object.assign({ id: nodeId }, highlightMap.value[nodeId], {
        highlight: false
      })
    : Object.assign({ id: nodeId }, highlightMap.value[nodeId], {
        highlight: true
      });
  Object.values(highlightMap.value).forEach((v: Tree) => {
    if (v.id !== nodeId) {
      v.highlight = false;
    }
  });
  emit(
    "tree-select",
    highlightMap.value[nodeId]?.highlight
      ? Object.assign({ ...value, selected: true })
      : Object.assign({ ...value, selected: false })
  );
}

function toggleRowExpansionAll(status) {
  isExpand.value = status;
  const nodes = (proxy.$refs["treeRef"] as any).store._getAllNodes();
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].expanded = status;
  }
}

/** 重置部门树状态（选中状态、搜索框值、树初始化） */
function onTreeReset() {
  highlightMap.value = {};
  searchValue.value = "";
  toggleRowExpansionAll(true);
}
function onTrag() {
  let isDragging = false;
  let startX = 0;
  let startWidth = 0;
  let containerTree = dragBorder.value.parentElement;
  let containerTreeSibling = containerTree.nextElementSibling;
  containerTree.style.flexShrink = 0; // 防止被压缩
  if (containerTreeSibling){
    containerTreeSibling.style.flex = 1; // 自动占满剩余空间
    containerTreeSibling.style.minWidth = 0; // 允许自动元素的内容换行/压缩
  }
  
  // 鼠标按下开始拖拽
  dragBorder.value.addEventListener("mousedown", function (e) {
    isDragging = true;
    startX = e.clientX;
    // 获取当前容器宽度
    const container = dragBorder.value.parentElement;
    startWidth = container.offsetWidth;
    
    // 添加全局鼠标移动和松开事件
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    
    // 防止文本选中
    e.preventDefault();
  });
  
  function onMouseMove(e) {
    if (!isDragging) return;
    
    // 计算宽度变化
    const deltaX = e.clientX - startX;
    const newWidth = startWidth + deltaX;
    
    // 设置最小和最大宽度限制
    const minWidth = 200;
    const maxWidth = 800;
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      containerTree.style.width = newWidth + "px";
    }
  }
  
  function onMouseUp() {
    isDragging = false;
    // 清理事件监听器
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }
}

watch(searchValue, val => {
  treeRef.value!.filter(val);
});

onMounted(() => { 
  onTrag() 
});

defineExpose({ onTreeReset });
</script>

<template>
  <div
    v-loading="treeLoading"
    class="h-full bg-bg_color overflow-hidden relative drag-box"
    :style="{ minHeight: `calc(100vh - 126px)` }"
  >
    <div class="flex items-center h-[34px]">
      <el-input
        v-model="searchValue"
        class="ml-2"
        size="small"
        :placeholder="placeholder || '搜索'"
        clearable
      >
        <template #suffix>
          <el-icon class="el-input__icon">
            <IconifyIconOffline
              v-show="searchValue.length === 0"
              icon="ri/search-line"
            />
          </el-icon>
        </template>
      </el-input>
      <el-dropdown :hide-on-click="false">
        <More2Fill class="w-[28px] cursor-pointer outline-hidden" />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <el-button
                :class="buttonClass"
                link
                type="primary"
                :icon="useRenderIcon(isExpand ? ExpandIcon : UnExpandIcon)"
                @click="toggleRowExpansionAll(isExpand ? false : true)"
              >
                {{ isExpand ? "折叠全部" : "展开全部" }}
              </el-button>
            </el-dropdown-item>
            <el-dropdown-item>
              <el-button
                :class="buttonClass"
                link
                type="primary"
                :icon="useRenderIcon(Reset)"
                @click="onTreeReset"
              >
                重置状态
              </el-button>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <el-divider />
    <el-scrollbar height="calc(90vh - 88px)">
      <el-tree
        ref="treeRef"
        :data="treeData"
        node-key="id"
        size="small"
        :props="defaultProps"
        :highlight-current="true"
        default-expand-all
        :expand-on-click-node="false"
        :filter-node-method="filterNode"
        @node-click="nodeClick"
        :default-checked-keys="defaultCheckedKeys"
        :current-node-key="currentNodeKey"
      >
        <template #default="{ node, data }">
          <div
            :class="[
              'rounded-sm',
              'flex',
              'items-center',
              'select-none',
              'hover:text-primary',
              searchValue.trim().length > 0 &&
                node.label.includes(searchValue) &&
                'text-red-500',
              highlightMap[node.id]?.highlight ? 'dark:text-primary' : ''
            ]"
            :style="{
              color: highlightMap[node.id]?.highlight
                ? 'var(--el-color-primary)'
                : '',
              background: highlightMap[node.id]?.highlight
                ? 'var(--el-color-primary-light-7)'
                : 'transparent'
            }"
          >
            <IconifyIconOffline
              :icon="
                data.type === 1
                  ? OfficeBuilding
                  : data.type === 2
                    ? LocationCompany
                    : Dept
              "
            />
            <span class="!w-[120px] truncate!" :title="node.label">
              {{ node.label }}
            </span>
          </div>
        </template>
      </el-tree>
    </el-scrollbar>

    <span ref="dragBorder" class="drag-border" ></span>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-divider) {
  margin: 0;
}

:deep(.el-tree) {
  --el-tree-node-hover-bg-color: transparent;
}
.drag-box {
  .drag-border {
    display: inline-block;
    box-sizing: border-box;
    width: 6px;
    height: 100% !important;
    background-color: #ddd;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    cursor: e-resize;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #999;
    }
  }
}

</style>
