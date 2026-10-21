<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    :close-on-click-modal="false"
    width="600px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px"><el-form-item label="组织单位"  prop="unit_id">
        <SelectUserUnitCascader :changed="handelSelectUserUnit" :modelValue="form.unit_id" />
      </el-form-item>

      
      <el-form-item label="输入框" prop="t_input">
        <el-input v-model="form.t_input" placeholder="请输入输入框" maxlength="64" show-word-limit clearable />
      </el-form-item>
      
      
      <el-form-item label="文本" prop="t_textarea">
        <el-input type="textarea" v-model="form.t_textarea" placeholder="请输入文本" maxlength="500" show-word-limit />
      </el-form-item>
      
      
      <el-form-item label="下拉选择" prop="t_select">
        <el-select v-model="form.t_select" placeholder="请选择下拉选择" style="width: 100%" :options="t_selectOptions" :props="t_selectProps" clearable></el-select>
      </el-form-item>
      
      
      <el-form-item label="开关" prop="t_switch">
        <el-switch v-model="form.t_switch" :active-text="t_switchOptions[0]['name']" :inactive-text="t_switchOptions[1]['name']" />
      </el-form-item>
      
      
      <el-form-item label="单选框" prop="t_radio">
       <el-radio-group v-model="form.t_radio" >
          <template v-slot:default>
            <el-radio-button v-for="item in t_radioOptions" :key="item.id" :value="item.id">
              {{ item.name }} 
            </el-radio-button>
          </template>
        </el-radio-group>
      </el-form-item>
      
      
      <el-form-item label="多选" prop="t_checkbox">
        <el-checkbox-group v-model="form.t_checkbox">
          <el-checkbox-button v-for="item in t_checkboxOptions" :key="item.id" :value="item.id">
            {{ item.name }} 
          </el-checkbox-button>
        </el-checkbox-group>
      </el-form-item>
      
      
      <el-form-item label="时间" prop="t_datetime">
        <el-date-picker v-model="form.t_datetime" type="datetime" placeholder="请选择时间"  format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" @change="(dateStr: any)=>{form.t_datetime = dateParsingInZone(dateStr)}"/>
      </el-form-item>
      
      
      <el-form-item label="文件" prop="t_file">
        <sliceUploadV2
          :bucketACL="'public'"
          :uploadSuccessCallback="(uploadResult: any, file: any)=>{uploadFileSuccessCallback(uploadResult, file, 't_file')}"
          :elementPlusUploader="{ 'list-type': 'picture-card', 'show-file-list': true, 'file-list': fileListObj['t_file'], 'on-remove': (e: any)=>{removeFile(e, 't_file')}  , 'multiple': false, }">
          <template #default>
            <AddLargeLine style="width: 40px; height: 40px;"/>
          </template>
        </sliceUploadV2>
      </el-form-item>
      
      
      <el-form-item label="多文件" prop="t_files">
        <sliceUploadV2
          :bucketACL="'public'"
          :uploadSuccessCallback="(uploadResult: any, file: any)=>{uploadFileSuccessCallback(uploadResult, file, 't_files')}"
          :elementPlusUploader="{ 'list-type': 'text', 'show-file-list': true, 'file-list': fileListObj['t_files'], 'on-remove': (e: any)=>{removeFile(e, 't_files')}  , 'multiple': true, }">
          <template #default>
            <el-button type="primary">上传文件</el-button>
          </template>
        </sliceUploadV2>
      </el-form-item>
      
      
      <el-form-item label="编辑器" prop="t_editor">
        <EditorBase v-if="editorVisible" v-model="form.t_editor"/>
      </el-form-item>
      
          </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit" :disabled="!hasPerms(['admin_plat:system-generateForm:add', 'admin_plat:system-generateForm:edit'])">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from "vue";
import type { FormInstance } from "element-plus";
import { ElMessageBox } from "element-plus";
import { hasPerms } from "@/utils/auth";
import { message } from "@/utils/message";
import { dateParsingInZone } from "@/utils/time";
import { getVarType } from "@/components/sliceUpload/common";
import sliceUploadV2 from "@/components/sliceUploadV2/index.vue";
import { EditorBase } from "@/components/Editor/components";
import AddLargeLine from "~icons/ri/add-large-line";
import { getGenerateFormDetail, addGenerateForm, editGenerateForm } from "@/api/generateForm";
import { formRules } from "./utils/rule";
import { getLinkById } from "@/api/upload";
import SelectUserUnitCascader from "@/components/unit/SelectUserUnitCascader.vue";

import { t_selectOptions, t_selectProps } from "./utils/hook";

import { t_switchOptions } from "./utils/hook";

import { t_radioOptions, t_radioProps } from "./utils/hook";

import { t_checkboxOptions, t_checkboxProps } from "./utils/hook";


const emit = defineEmits(["refresh"]);
const visible = ref(false);
const dialogTitle = ref("新增");
const submitLoading = ref(false);
const formRef = ref<FormInstance>();
const editId = ref("");
const editorVisible = ref(false);

const fileListObj = ref<Record<string, any[]>>({
  t_file: [],
  t_files: [],

});

const needStringifyFields = reactive([
  "t_select",
  "t_checkbox",
  ...(Object.keys(fileListObj.value))
]);
const needConvertBoolFields = reactive([
  "t_switch",

]);

const form = reactive({
t_input: "",
t_textarea: "",
t_select: "",
t_switch: 0,
t_radio: "",
t_checkbox: [],
t_datetime: "",
t_file: [],
t_files: [],
t_editor: "",
unit_id: "",

});

function open(title = "新增", row?: any) {
  dialogTitle.value = title;
  visible.value = true;
  editorVisible.value = false;

  nextTick(async () => {
    if (row && row.id) {
      editId.value = row.id;
      const res = await getGenerateFormDetail({ id: row.id });
      const data = res.data ?? {};
      for (let i = 0; i < needStringifyFields.length; i++) {
        if (data[needStringifyFields[i]] === null || data[needStringifyFields[i]] === undefined) continue;
        if (getVarType(form[needStringifyFields[i]]) === 'array') {
          data[needStringifyFields[i]] = data[needStringifyFields[i]].split(",");
        }
      }
      for (let i = 0; i < needConvertBoolFields.length; i++) {
        if (data[needConvertBoolFields[i]] === null || data[needConvertBoolFields[i]] === undefined) continue;
        data[needConvertBoolFields[i]] = Boolean(data[needConvertBoolFields[i]]);
      }
      Object.assign(form, data);
      fileListObj.value['t_file'] = await doGetLinkById("t_file");
      fileListObj.value['t_files'] = await doGetLinkById("t_files");
    } else {
      editId.value = "";
      formRef.value?.resetFields();
    }

    nextTick(() => {
      editorVisible.value = true;
    });
  });
}

function handleClose() {
  formRef.value?.resetFields();
  editId.value = "";
  visible.value = false;
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitLoading.value = true;
  try {
    await ElMessageBox.confirm(editId.value ? "是否修改?" : "是否新增?");
    let tmpForm: any = JSON.parse(JSON.stringify(form));
    for (let i = 0; i < needStringifyFields.length; i++) {
      if (form[needStringifyFields[i]] === null || form[needStringifyFields[i]] === undefined) continue;
      if (getVarType(form[needStringifyFields[i]]) === 'array') {
        tmpForm[needStringifyFields[i]] = form[needStringifyFields[i]].join(",");
      }
    }
    for (let i = 0; i < needConvertBoolFields.length; i++) {
      if (form[needConvertBoolFields[i]] === null || form[needConvertBoolFields[i]] === undefined) continue;
      tmpForm[needConvertBoolFields[i]] = Number(!!tmpForm[needConvertBoolFields[i]]);
    }
    let result;
    if (editId.value) {
      result = await editGenerateForm({ id: editId.value, ...tmpForm });
    } else {
      result = await addGenerateForm(tmpForm);
    }
    if (result && result.code === 200) {
      message(editId.value ? "修改成功" : "新增成功", { type: "success" });
    } else {
      message(result?.message || "操作失败", { type: "error" });
    }
    emit("refresh");
    handleClose();
  } catch (error: any) {
    message(error?.message || "操作失败", { type: "error" });
  } finally {
    submitLoading.value = false;
  }
}

const uploadFileSuccessCallback = async (uploadResult: any, file: any, key: string) => {
  form[key] = form[key].length ? [...form[key], uploadResult.fileId] : [uploadResult.fileId];
  fileListObj.value[key] = await doGetLinkById(key);
};

function removeFile(e: any, key: string) {
  const fileId = e?.raw && e.raw instanceof File ? e.raw.fileId : e.id;
  if (!fileId) return;
  fileListObj.value[key] = fileListObj.value[key].filter((item: any) => item.id != fileId);
  form[key] = form[key].filter((item: any) => item != fileId);
}

const getShowUploadListItem = (fileId: string, fileName: string, filePath: string) => {
  return { id: fileId, name: fileName, url: filePath };
};

const doGetLinkById = async (key: string) => {
  if (!form[key] || !form[key].length) return [];
  return await getLinkById(form[key]).then((res: any) => {
    if (res?.code !== 200) {
      console.error(res?.message || "getLinkById() 获取数据错误");
      return [];
    }
    return (res?.data?.list || []).map((item: any) =>
      getShowUploadListItem(item.id, item.realName, item.path)
    );
  });
};
function handelSelectUserUnit(e){
  if (e && e[0]){
    console.log( e[e.length-1])
  }
}
defineExpose({ open });
</script>
