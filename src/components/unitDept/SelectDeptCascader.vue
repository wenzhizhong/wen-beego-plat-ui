<script setup lang="ts">
import { shallowRef, reactive, watch } from "vue";
import { getDeptTree } from "@/api/system";
import { ArrowRightBold } from "@element-plus/icons-vue";
import { handleTree } from "@/utils/tree";
import { getVarType } from "@/utils/util.js"


const props = defineProps({
  changed:{
    type: Function,
    required: true
  },
  props_:{
    type: Object,
    required: false,
    default: () => ({ checkStrictly: true})
  },
  modelValueIsPid: Boolean,
  modelValue: {
    type: [String, Number, Object, Array],
    required: true,
  },
  selectUnitIds: {
    type: String,
    default: "",
    required: true,
  },
  disableValue: {
    type: Array,
    required: false,
    default: () => []
  },
  placeholder:{
    type: String,
    default: ""
  },
  disabled:{
    type: Boolean,
    default: false
  },

});

const state = reactive({ 
  loading: false,
  pid: [],
})
const deptList = shallowRef([]);

const emit = defineEmits<{
  (e: 'closeCallback', data: null): void
  (e: 'selectDeptCallback', data: null): void
}>();

defineOptions({
  name: "SelectDeptCascader",
  isLoad:"isLoad"
});


/** 获取部门列表 */
function getUserDept_(selectUnitIds) { 
  if (!selectUnitIds || selectUnitIds.length === 0) {
    deptList.value = [];
    return;
  }


  state.loading = true;
  getDeptTree({selectUnitIds}).then((res) => {
    let tmpData =  res && res.data && res.data.list || [];
    let tmpDeptList= [];
    tmpData.forEach(item => {
      let tmpItem = {
        disabled: false,
        label : item.name,
        value : item.id,
        id : item.id,
        pid : item.pid && item.pid.replace(/\s+/g, '') || '',
      }
      let tmpData = props.disableValue && props.disableValue as Array<any>;
      if (tmpData && tmpData.length > 0 && tmpData.includes(item.id)){
        tmpItem.disabled = true;
      }
      
      tmpDeptList.push(tmpItem);
    });
    let treeData = handleTree( tmpDeptList, "id", "pid", "children" );
    deptList.value = treeData
    state.loading = false;
    state.pid = getModelValueFromTree(treeData, props.modelValue)
  });
}


function getModelValueFromTree(treeData, id) { 
  let pids = [];
  if (!id || id.length === 0) return pids;

  for (let i = 0; i < treeData.length; i++) { 
    let item = treeData[i];
    if (item.id === id) { 
      let tmpPids = item.pid && item.pids && item.pids.length? item.pids : [] ;
      if (props.modelValueIsPid){
        pids = tmpPids && tmpPids.length ? tmpPids : pids;
      }else{
        pids = tmpPids.concat(item.id);
      }
      
      break;
    } else if (item.children && item.children.length > 0) { 
      let tmpPids = getModelValueFromTree(item.children, id);
      if (tmpPids && tmpPids.length > 0) { 
        pids = pids.concat(tmpPids);
      }
    }
  }
  return pids;
}
function handelSelectDept(val) { 
  console.log('val', val,  getVarType(val));
  props.changed(val);
}

watch(
  () => props.selectUnitIds, 
  (val) => {
    getUserDept_(val)
    
  }, 
  { 
    deep: true,
    immediate: true
  }
);

</script>
<template>
    <el-cascader v-model="state.pid" :options="deptList" :props="props_" @change="handelSelectDept" clearable style="width: 100%;" >
      <template #default="{ node, data }">
        <div class="select-tree-item">
          <span>{{ data.label }}</span>
          <span v-if="!node.isLeaf" class="select-tree-children-count"> 
            {{ data.children.length }} 
          </span>
        </div>
      </template>
    </el-cascader>
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