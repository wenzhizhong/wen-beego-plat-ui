<script setup lang="ts">
import { shallowRef, reactive, watch } from "vue";
import { getRoleTree } from "@/api/system";
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
const roleList = shallowRef([]);

const emit = defineEmits<{
  (e: 'closeCallback', data: null): void
  (e: 'selectRoleCallback', data: null): void
}>();

defineOptions({
  name: "SelectRoleCascader",
  isLoad:"isLoad"
});


/** 获取角色列表 */
function getUserRole_(selectUnitIds) { 
  if (!selectUnitIds || selectUnitIds.length === 0) {
    roleList.value = [];
    return;
  }


  state.loading = true;
  getRoleTree({selectUnitIds}).then((res) => {
    let tmpData =  res && res.data && res.data.list || [];
    let tmpRoleList= [];
    tmpData.forEach(item => {
      let tmpItem = {
        disabled: item.status !== 1,
        label : item.role_name,
        value : item.id,
        id : item.id,
        pid : item.pid && item.pid.replace(/\s+/g, '') || '',
      }
      let tmpData = props.disableValue && props.disableValue as Array<any>;
      if (tmpData && tmpData.length > 0 && tmpData.includes(item.id)){
        tmpItem.disabled = true;
      }
      
      tmpRoleList.push(tmpItem);
    });
    let treeData = handleTree( tmpRoleList, "id", "pid", "children" );
    roleList.value = treeData
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
function handelSelectRole(val) { 
  console.log('val', val,  getVarType(val));
  props.changed(val);
}

watch(
  () => props.selectUnitIds, 
  (val) => {
    getUserRole_(val)
    
  }, 
  { 
    deep: true,
    immediate: true
  }
);

</script>
<template>
    <el-cascader v-model="state.pid" :options="roleList" :props="props_" @change="handelSelectRole" clearable style="width: 100%;" >
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