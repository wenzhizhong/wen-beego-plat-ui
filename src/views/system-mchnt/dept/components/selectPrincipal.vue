<script lang="ts" setup>
import { ref, watch } from 'vue';
import {useDept} from "../utils/hook";
import { message } from '@/utils/message';

const props = defineProps({ 
  selectUnitIds:{
    type: String,
    required: true
  },
  show: {
    type: Boolean,
    default: false
  },
  close: {
    type: Function,
    required: true
  },
  callback: {
    type: Function,
    required: true
  }
})


const tableData = ref([])
const loading = ref(false)
const show_ = ref(false)
const { getDeptPrincipalApi } = useDept()
const formObj = ref( {
  selectUnitIds: "",
  keyword: "",
  pageSize: 10,
  currentPage: 1,
  total: 0,
})
function close_(){
  show_.value = false
  props.close()
}

function handleCurrentChange(val) {
  formObj.value.currentPage = val || 1
  getDeptPrincipal_()
}
function handleSelect(val) {
  props.callback(val)
}

function getDeptPrincipal_(){
  tableData.value = []
  if(!show_.value){
    return 
  }
  if (!formObj.value.selectUnitIds){
    message("请选择组织单位", {
      type: "error",
      duration: 2000
    });
    return false
  }
  
  loading.value = true
  getDeptPrincipalApi(formObj.value).then(res => { 
    tableData.value = res && res.list || []
    formObj.value.total = res && res.total || 0
    formObj.value.currentPage = res && res.currentPage || 1
    loading.value = false
  })
}

watch(() => props.selectUnitIds, (val) => {
  formObj.value.selectUnitIds = val || ""
},{
  immediate: true
})
watch(() => props.show, (val) => {
  show_.value = val
  getDeptPrincipal_()
},{
  immediate: true
})

watch(() => formObj.value.keyword, (val) => {
  getDeptPrincipal_()
},{
  immediate: true
})


defineExpose({
  close_,
})
</script>
<template>
  <el-dialog 
    v-model="show_"
    title="选择部门负责人"
    width="500px"
    :before-close="close_"
  >
    <el-form ref="form" label-width="80px">
      <el-form-item label="组织单位">
        <el-input v-model="formObj.keyword" placeholder="请输入关键词..." clearable />
      </el-form-item>
    </el-form>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="operate" label="选择" width="100" >
        <template #default="scope">
          <el-button
            type="primary"
            size="small"
            @click="handleSelect(scope.row)"
          >选择</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      size="small"
      background
      layout="prev, pager, next"
      :total="formObj.total"
      :page-size="formObj.pageSize"
      class="mt-4"
      @current-change="handleCurrentChange"
    />
    
  </el-dialog>
</template>