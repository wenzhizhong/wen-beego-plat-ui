<script setup lang="ts">
import { shallowRef, reactive, ref, onMounted} from "vue";
import { getUserUnit } from "@/api/unit";
import { handleTree } from "@/utils/tree";
import tree from "../tree/tree.vue"

import {
  deviceDetection
} from "@pureadmin/utils";
import { nextTick } from "vue";

const props = defineProps({
  onTreeSelect:{
    type: Function,
    required: true,
  },
  defaultCheckedKeys: {
    type: Array as () => number[],
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

const emit = defineEmits<{
  (e: 'closeCallback', data: null): void
  (e: 'selectUserUnitCallback', data: null): void
}>();

defineOptions({
  name: "SelectUserUnitTree",
  isLoad:"isLoad"
});


/** 获取组织列表 */
function getUserUnit_() { 
  state.loading = true;
  
  getUserUnit({data:{}}).then((res) => {
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
  });
}

function onTreeSelect({ id, selected }) {
  props.onTreeSelect({ id, selected });
}

onMounted(() => {
  getUserUnit_();
});

</script>
<template>
    <tree
      ref="treeRef"
      placeholder="搜索组织单位"
      :treeData="treeData"
      :treeLoading="state.treeLoading"
      :defaultCheckedKeys="defaultCheckedKeys"
      :currentNodeKey="currentNodeKey"
      @tree-select="onTreeSelect"
    />
</template>

<style lang="scss" scoped>
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
</style>