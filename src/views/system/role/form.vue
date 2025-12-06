<script setup lang="ts">
import { ref, watch } from "vue";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import SelectUserUnitCascader from "@/components/unit/SelectUserUnitCascader.vue";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    id: "",
    unit_id: "",
    role_name: "",
    role_sort: 0,
    code: "",
    status: -1,
    remark: "",
    role_classify_name: ""
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}
function handelSelectUserUnit(e){
  if (e && e[0]){
    newFormInline.value.unit_id =  e[e.length-1]
  }
}
watch(() => props.formInline.status, (val) => {
  console.log("status==", val )
});

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="82px"
  >
    <el-form-item label="组织单位"  prop="unit_id">
      <SelectUserUnitCascader :changed="handelSelectUserUnit" :modelValue="newFormInline.unit_id"  />
    </el-form-item>
    <el-form-item label="角色名称" prop="role_name">
      <el-input
        v-model="newFormInline.role_name"
        clearable
        placeholder="请输入角色名称"
      />
    </el-form-item>

    <el-form-item label="角色分类" prop="role_classify_name">
      <el-input
        v-model="newFormInline.role_classify_name"
        clearable
        placeholder="请输入角色分类"
        :disabled="newFormInline.id && newFormInline.role_classify_name == 'admin'?true:false"
      />
    </el-form-item>
    <el-form-item label="角色状态" prop="status">
      <el-switch
        v-model="newFormInline.status" 
        :active-value="1"
        :inactive-value="0"
        active-text="已启用"
        inactive-text="已停用"
        inline-prompt
      /> 
      <font color="red">
        &nbsp;&nbsp;注：停用角色，无法操作、不能登录系统。
      </font>
    </el-form-item>
    <el-form-item label="排序" prop="status">
      <el-input-number
          v-model="newFormInline.role_sort"
          class="w-full!"
          :min="0"
          :max="9999"
          controls-position="right"
        />
    </el-form-item>

    <el-form-item label="备注">
      <el-input
        v-model="newFormInline.remark"
        placeholder="请输入备注信息"
        type="textarea"
      />
    </el-form-item>
  </el-form>
</template>
