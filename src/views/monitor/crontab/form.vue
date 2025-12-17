<script setup lang="ts">
import { ref, watch } from "vue";
import { useCron } from "./utils/hook";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import CronGenerator from '@/components/Crontab/CronGenerator.vue'

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    id: "",
    unit_id: "",
    name: "",
    name_en: "",
    group: "默认",
    cron_expr: "",
    status: 0,
    remark: "",
  })
});

const formRef = ref();
const showCronExprDialog = ref(false);


const newFormInline = ref(props.formInline);
const {
  avaibleCronList
}= useCron()
function getRef() {
  return formRef.value;
}
function handelSelectName(val){
  for (let i = 0; i < avaibleCronList.value.length; i++) {
    if (avaibleCronList.value[i].name_en == val) {
      newFormInline.value.name = avaibleCronList.value[i].name;
      break;
    }
  }
}
function openCronExprDialog() {
  showCronExprDialog.value = true;
}
function closeCronExprDialog() {
  showCronExprDialog.value = false;
}
function handleCronExprGenerate(data: { expression: string; description: string }) {
  newFormInline.value.cron_expr = data.expression;
  newFormInline.value.remark = data.description;
  closeCronExprDialog();
}

watch(() => props.formInline.status, (val) => {
  console.log("status==", val )
});

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="82px"
  >
    <el-form-item label="名称" prop="name_en">
      <el-select v-model="newFormInline.name_en" @change="handelSelectName">
        <el-option
          v-for="item in avaibleCronList"
          :key="item.name_en"
          :label="item.name"
          :value="item.name_en"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="分组" prop="group">
      <el-input
        v-model="newFormInline.group"
        clearable
        placeholder="请输入分组"
      />
    </el-form-item>
    <el-form-item label="表达式" prop="cron_expr">
      <el-input
        v-model="newFormInline.cron_expr"
        clearable
        placeholder="请输入表达式"
      >
        <template #append><el-button type="primary" @click="openCronExprDialog">点击生成</el-button></template>
      </el-input>
    </el-form-item>
    
    <el-form-item label="状态" prop="status">
      <el-switch
        v-model="newFormInline.status" 
        :active-value="1"
        :inactive-value="0"
        active-text="已启用"
        inactive-text="已停用"
        inline-prompt
      /> 
    </el-form-item>

    <el-form-item label="备注" prop="remark">
      <el-input
        v-model="newFormInline.remark"
        placeholder="请输入备注信息"
        type="textarea"
      />
    </el-form-item>

    
    <el-dialog
      v-model="showCronExprDialog"
      title="Cron 表达式生成器"
      width="800px"
    >
      <cron-generator @confirm="handleCronExprGenerate" />
    </el-dialog>
    
  </el-form>
</template>
