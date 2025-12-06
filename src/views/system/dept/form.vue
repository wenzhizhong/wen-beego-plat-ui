<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import { usePublicHooks } from "../hooks";
// import {myTrim} from "@/utils/util"

import SelectDeptCascader from "@/components/unitDept/SelectDeptCascader.vue";
import SelectUserUnitCascader from "@/components/unit/SelectUserUnitCascader.vue";
import SelectPrincipal  from "./components/selectPrincipal.vue"
import { message } from "@/utils/message";
// import { message } from "@/utils/message";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    id: "",
    pid: "",
    unit_id: "",
    name: "",
    principal_id: "",
    principal: "",
    sort: 0,
    status: 1,
    remark: ""
  })
});

const ruleFormRef = ref();
const { switchStyle } = usePublicHooks();
const newFormInline = ref(props.formInline);
const principalShow = ref(false)

function getRef() {
  return ruleFormRef.value;
}

function handelSelectUserUnit(e){
  newFormInline.value.principal = ""
  newFormInline.value.principal_id = ""
  if (e && e[0]){
    newFormInline.value.unit_id =  e[e.length-1]
  }
}

function handelSelectUserUnitDept(e){
  if (e && e[0]){
    newFormInline.value.pid = e[e.length-1]
  }
}
function principalCallback({id, name  }) {
  if (!(id && name)) { 
    message( `请选择负责人异常：id=${id},name=${name}`, {
      type: "error",
      duration: 2000
    })
    return
  }
  principalShow.value = false
  newFormInline.value.principal_id = id
  newFormInline.value.principal = name
}

defineExpose({ 
  getRef, 
  handelSelectUserUnit,
  handelSelectUserUnitDept,
  principalCallback,
});
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="82px"
  >
  
    <el-row :gutter="30">
      <re-col>
        <el-form-item label="组织单位"  prop="unit_id">
          <SelectUserUnitCascader :changed="handelSelectUserUnit" :modelValue="newFormInline.unit_id"  />
        </el-form-item>
      </re-col>
    </el-row>
    <el-row :gutter="30">
      <re-col>
        <el-form-item label="上级部门">
          <SelectDeptCascader  :changed="handelSelectUserUnitDept" :modelValueIsPid="true" :modelValue="newFormInline.id" :disableValue="[newFormInline.id]" :selectUnitIds="newFormInline.unit_id"></SelectDeptCascader>
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="部门名称" prop="name">
          <el-input
            v-model="newFormInline.name"
            clearable
            placeholder="请输入部门名称"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="部门负责人">
          <el-input
            v-model="newFormInline.principal"
            clearable
            placeholder="请选择"
            readonly
            style="width: 60%"
          />
          <el-button type="primary" @click="principalShow = true">选择</el-button>
        </el-form-item>
      </re-col>


      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="排序">
          <el-input-number
            v-model="newFormInline.sort"
            class="w-full!"
            :min="0"
            :max="9999"
            controls-position="right"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="部门状态">
          <el-switch
            v-model="newFormInline.status"
            inline-prompt
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="停用"
            :style="switchStyle"
          />
        </el-form-item>
      </re-col>

      <re-col>
        <el-form-item label="备注">
          <el-input
            v-model="newFormInline.remark"
            placeholder="请输入备注信息"
            type="textarea"
          />
        </el-form-item>
      </re-col>
    </el-row>

    <SelectPrincipal :selectUnitIds="newFormInline.unit_id" :show="principalShow" :close="()=>{principalShow=false}" :callback="principalCallback" />
  </el-form>
</template>
