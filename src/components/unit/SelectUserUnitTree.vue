<script setup lang="ts">
import { shallowRef, reactive, ref, onMounted} from "vue";
import { useNav } from "@/layout/hooks/useNav";
import LaySidebarLeftCollapse from "@/layout/components/lay-sidebar/components/SidebarLeftCollapse.vue";
import LaySidebarCenterCollapse from "@/layout/components/lay-sidebar/components/SidebarCenterCollapse.vue";
import { getUserUnit } from "@/api/unit";
import { getMenuMchntUnitTree } from "@/api/system";
import { handleTree } from "@/utils/tree";
import tree from "../tree/tree.vue"

import {
  deviceDetection
} from "@pureadmin/utils";
import { nextTick } from "vue";

const {
  device,
  pureApp,
  isCollapse,
  tooltipEffect,
  menuSelect,
  toggleSideBar
} = useNav();

const props = defineProps({
  apiType:{
    type: String,
    default: "" // for-mchnt-unit-tree
  },
  onTreeSelect:{
    type: Function,
    required: true,
  },
  defaultCheckedKeys: {
    type: Array as () => any[],
    default: () => []
  },
  currentNodeKey: String,
});

const state = reactive({ 
  loading:false,
  treeLoading: false,
  pid: [],
})
const treeData = shallowRef([]);
const isShow = ref(false);
const toggleSideBarOpened = ref(false);
const toggleSideBarClass = ref("select-user-unit-tree-closed");

const emit = defineEmits<{
  (e: 'closeCallback', data: null): void
  (e: 'selectUserUnitCallback', data: null): void
}>();

defineOptions({
  name: "SelectUserUnitTree",
  isLoad:"isLoad"
});

onMounted(() => {
  getUserUnit_();
});

/** 获取组织列表 */
function getUserUnit_() { 
  state.loading = true;
  let callback = (res) => {
    state.treeLoading = true
    let tmpData =  res && res.data && res.data.list || [];
    let tmpUnitList= [];
    tmpData.forEach(item => {
      let pid = item.pid && item.pid.replace(/\s+/g, '') || '';
      let tmpItem = {
        disabled: false,
        label : item.name,
        name : item.name,
        value : item.id,
        id : item.id,
        pid : pid,
        logoLink : item.logoLink,
      }
      // let tmpData = props.disableValue && props.disableValue as Array<any>;
      // if (tmpData && tmpData.length > 0 && tmpData.includes(item.id)){
      //   tmpItem.disabled = true;
      // }
      
      tmpUnitList.push(tmpItem);
    });
    // 使用新数组替换并触发更新
    const processedTreeData = handleTree(tmpUnitList, "id", "pid", "children");
    treeData.value = processedTreeData;
    
    state.loading = false;
    state.treeLoading = false
  }
  
  switch (props.apiType) {
    case "for-mchnt-unit-tree":
      getMenuMchntUnitTree({}).then(callback);
      break;
    default:
      getUserUnit({data:{}}).then(callback);
      break;
  }
}

function onTreeSelect({ id, selected }) {
  props.onTreeSelect({ id, selected });
}

function toggleUnitTreeSideBar(){
  toggleSideBarOpened.value = !toggleSideBarOpened.value
   
}

</script>
<template>
  <div :class="'select-user-unit-tree '+ ( device === 'mobile' && !toggleSideBarOpened? toggleSideBarClass:'')">
    <tree
      ref="treeRef"
      placeholder="搜索组织单位"
      :treeData="treeData"
      :treeLoading="state.treeLoading"
      :defaultCheckedKeys="defaultCheckedKeys"
      :currentNodeKey="currentNodeKey"
      @tree-select="onTreeSelect"
    />
    
    <LaySidebarCenterCollapse
      v-if="device === 'mobile'"
      :is-active="toggleSideBarOpened"
      @toggleClick="toggleUnitTreeSideBar"
    />
  </div>
</template> 

<style lang="scss" scoped>
.select-user-unit-tree{
  position: relative;
  z-index: 1000;
  // width: 100%;
  transition: all 0.3s linear;
  .select-tree-item{
    display: flex;
    align-items: center;
    .select-tree-logo{
      width: 20px;
      height: 20px;
      margin-right: 5px;
      border-radius: 4px;
    }
    .select-tree-children-count{
      box-sizing: border-box;
      margin-left: auto;
      padding-left: 50px;
    }
  }
}
.select-user-unit-tree-closed{
  width: 30px;
} 
</style> 