<script setup lang="ts">
import { shallowRef, reactive, watch } from "vue";
import { getUserUnit } from "@/api/unit";
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
  }

});

const state = reactive({ 
  loading: false,
  curUnitId: "",
  pid: [],
})
const unitList = shallowRef([]);

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
    let tmpData =  res && res.data && res.data.list || [];
    let tmpUnitList= [];
    tmpData.forEach(item => {
      let tmpItem = {
        disabled: false,
        label : item.name,
        value : item.id,
        id : item.id,
        pid : item.pid && item.pid.replace(/\s+/g, '') || '',
        logoLink : item.logoLink,
      }
      let tmpData = props.disableValue && props.disableValue as Array<any>;
      if (tmpData && tmpData.length > 0 && tmpData.includes(item.id)){
        tmpItem.disabled = true;
      }
      
      tmpUnitList.push(tmpItem);
    });
    let treeData = handleTree( tmpUnitList, "value", "pid", "children" );
    unitList.value = treeData
    state.loading = false;
    state.pid = getModelValueFromTree(treeData, props.modelValue)
  });
}
getUserUnit_();

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
function handelSelectUserUnit(val) { 
  console.log('val', val,  getVarType(val));
  props.changed(val);
}

// watch(
//   () => props.modelValue, 
//   (val) => {
//     if (!val) return; 
//     let varType = getVarType(val)
//     if (varType === "string" || varType === "number"){
//       state.pid = [val];
//     }else{
//       state.pid = val as Array<any> ;
//     }
//     console.log('val', val,  getVarType(val));
//   }, 
//   { 
//     deep: true,
//     immediate: true
//   }
// );

</script>
<template>
    <el-cascader v-model="state.pid" :options="unitList" :props="props_" @change="handelSelectUserUnit" clearable style="width: 100%;" >
      <template #default="{ node, data }">
        <div class="select-tree-item">
          <img :src="data.logoLink" alt="" class="select-tree-logo">
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