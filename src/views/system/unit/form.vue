<script setup lang="ts">
import { ref, watch } from "vue";
import {getFileName} from "@/utils/util.js"
import ReCol from "@/components/ReCol";
import sliceUploadV2 from "@/components/sliceUploadV2/index.vue";
// import SimpleUploader from "@/components/sliceUpload/index.vue";
// import SimpleUploaderDrawer from "@/components/sliceUpload/uploadDrawer.vue";
import SelectUserUnitCascader from "@/components/unit/SelectUserUnitCascader.vue";

import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import AddLargeLine from "~icons/ri/add-large-line";
// // import { transformI18n } from "@/plugins/i18n";
// let transformI18n = (label: string) => label; // 不需要i18n,临时解决i18n报错
// import { IconSelect } from "@/components/ReIcon";
// import Segmented from "@/components/ReSegmented";
// import ReAnimateSelector from "@/components/ReAnimateSelector";
// import { } from "./utils/enums";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    pid: "",
    id: "",
    logo: "",
    logoLink: "",
    name: "",
    code: "",
    corporation: "",
    license: "",
    licenseLink: "",
    address: "",
    status: 0,
    deleted: 0,
    createdAt: 0,
    updatedAt: 0,
    deletedAt: null,
    sort: 0
  }),
  unitSelectList: () => [],
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);
const logoList = ref([]);
const licenseList = ref([]);

function getRef() {
  return ruleFormRef.value;
}
function uploadSuccessLogo(uploadResult, file) {
  console.log(uploadResult, file);
  newFormInline.value.logo = uploadResult.filePath;
}
function removeLogo(uploadFile, uploadFiles){
  newFormInline.value.logo = ""
  newFormInline.value.logoLink = ""
}

function uploadSuccessLicense(uploadResult, file) {
  console.log(uploadResult, file);
  newFormInline.value.license = uploadResult.filePath;
}
function removeLicense(uploadFile, uploadFiles){
  newFormInline.value.license = ""
  newFormInline.value.licenseLink = ""
}

function handelSelectUserUnit(e) {
  if (e && e[0]){
    newFormInline.value.pid = e[e.length-1]
  }
}

watch(
  ()=>props.formInline.logoLink,
  (newValue, oldValue) => {
    if (newValue){
      logoList.value = [
        {
          url: newValue,
          name: getFileName(props.formInline.logoLink)
        }
      ]
    }
  },
  { immediate: true }
)
watch(
  ()=>props.formInline.licenseLink,
  (newValue, oldValue) => {
    if (newValue){
      licenseList.value = [
        {
          url: newValue,
          name: getFileName(props.formInline.licenseLink)
        }
      ]
    }
  },
  { immediate: true }
)

defineExpose({ getRef, handelSelectUserUnit });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="82px"
  >
    <el-row :gutter="30">
      <re-col :value="20" :xs="24" :sm="24">
        <el-form-item label="上级" prop="pid">
          <!-- 请选择上级组织 -->
          <SelectUserUnitCascader :changed="handelSelectUserUnit" :modelValueIsPid="true" :modelValue="newFormInline.id" :disableValue="[newFormInline.id]"/>
        </el-form-item>
      </re-col>


      <re-col :value="20" :xs="24" :sm="24">
        <el-form-item label="Logo" prop="logo">
          <sliceUploadV2 
            :bucketACL="'public'"
            :uploadSuccessCallback="uploadSuccessLogo"
            :elementPlusUploader="{
              'list-type': 'picture-card',
              'show-file-list': true,
              'file-list': logoList,
              'on-remove': removeLogo,

            }"
          >
            <template #default>
              <AddLargeLine  style="width: 40px; height: 40px;"/>
            </template>
          </sliceUploadV2>
        </el-form-item>
      </re-col>

      <re-col :value="20" :xs="24" :sm="24">
        <el-form-item label="单位名称" prop="name">
          <el-input
            v-model="newFormInline.name"
            clearable
            placeholder="请输入单位名称"
          />
        </el-form-item>
      </re-col>

      <re-col :value="20" :xs="24" :sm="24">
        <el-form-item label="机构代码" prop="code">
          <el-input
            v-model="newFormInline.code"
            clearable
            placeholder="请输入组织机构代码"
          />
        </el-form-item>
      </re-col>

      <re-col :value="20" :xs="24" :sm="24">
        <el-form-item label="法人" prop="corporation">
          <el-input
            v-model="newFormInline.corporation"
            clearable
            placeholder="请输入法人姓名"
          />
        </el-form-item>
      </re-col>

      <re-col :value="20" :xs="24" :sm="24">
        <el-form-item label="营业执照" prop="license">
          
          <sliceUploadV2 
            :bucketACL="'private'"
            :uploadSuccessCallback="uploadSuccessLicense"
            :elementPlusUploader="{
              'show-file-list': true,
              'file-list': licenseList,
              'on-remove': removeLicense,
            }"
          >
              <template #default>
                <el-button type="primary" icon="ri:upload-2-line">上传营业执照</el-button> 
              </template>
          </sliceUploadV2>
        </el-form-item>
      </re-col>


      <re-col :value="20" :xs="24" :sm="24">
        <el-form-item label="排序" prop="address">
          <el-input
            v-model="newFormInline.sort"
            clearable
            type="number"
            placeholder="请输入排序"
          />
        </el-form-item>
      </re-col>

      <re-col :value="20" :xs="24" :sm="24">
        <el-form-item label="地址" prop="address">
          <el-input
            v-model="newFormInline.address"
            clearable
            placeholder="请输入地址"
          />
        </el-form-item>
      </re-col>

      <re-col :value="20" :xs="24" :sm="24">
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="newFormInline.status"
            class="w-full"
            placeholder="请选择状态"
          >
            <el-option :value="0" label="未审核" />
            <el-option :value="1" label="审核通过" />
            <el-option :value="2" label="审核不通过" />
            <el-option :value="3" label="禁用" />
          </el-select>
        </el-form-item>
      </re-col>

    </el-row>
  </el-form>
</template>