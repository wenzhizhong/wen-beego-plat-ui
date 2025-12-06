<script setup lang="ts">
import { ref, watch } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "../utils/rule";
import { FormProps } from "../utils/types";
import { usePublicHooks } from "../../hooks";
import { useUser } from "../utils/hook";
import {getFileName, getConstellation} from "@/utils/util.js"
import {get_link_sign} from "@/api/upload";
import SelectDeptCascader from "@/components/unitDept/SelectDeptCascader.vue";
import SelectRoleCascader from "@/components/unitRole/SelectRoleCascader.vue";
import SelectUserUnitCascader from "@/components/unit/SelectUserUnitCascader.vue";
import sliceUploadV2 from "@/components/sliceUploadV2/index.vue";
import AddLargeLine from "~icons/ri/add-large-line";
import Key from "~icons/ep/key";
import CameraFilled from "~icons/ep/CameraFilled";

import { message } from "@/utils/message";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "新增",
    
    id: "",
    unit_id: "",
    dept_id: "",
    role_id: [],
    is_default: 0,
    default_unit_id: "",
    user_id: "",
    phone: "",
    password: "",
    name: "",
    avatar: "",
    avatarLink: "",
    card_type: 0,
    card_num: "",
    card_images: "",
    gender: 0,
    birth_date: null,
    constellation: "",
    occupation: "",
    company: "",
    emergency_name: "",
    emergency_tel: "",
    address: "",
    email: "",
    source: 1,
    valid_date_begin: null,
    valid_date_end: null,
    graduated_from: "",
    schooling: "",
    degree_number: "",
    professional: "",
    status: 1,
    remark: "",

    dept_ids: "",
    dept_names: "",
    role_ids: "",
    role_names: ""
  })
});
const {
  radioBttonParams,
  generatePassword,
} = useUser(null, null)
const card_valid_date = ref([]);
const ruleFormRef = ref();
const { switchStyle } = usePublicHooks();
const newFormInline = ref(props.formInline);
const avatarList = ref([]);
const card_images_0 = ref([]);
const card_images_1 = ref([]);



function getRef() {
  return ruleFormRef.value;
}

function handelSelectUserUnitDept(e){
  if (e && e[0]){
    newFormInline.value.dept_id = e[e.length-1]
  }
}
function handelSelectUserUnitRole(e){
  if (e && e[0]){
    newFormInline.value.role_id = [e[e.length-1]]
  }
}

function handelSelectUserUnit(e){
  if (e && e[0]){
    newFormInline.value.unit_id = e[e.length-1]
  }
}
function uploadSuccessAvatar(uploadResult, file) {
  // console.log(uploadResult, file);
  newFormInline.value.avatar = uploadResult.filePath;
}
function removeAvatar(uploadFile, uploadFiles){
  newFormInline.value.avatar = ""
  newFormInline.value.avatarLink = ""
}
function uploadSuccessCard(uploadResult, file, index) {
  let tmpArr = newFormInline.value.card_images.split(",") || [];
  tmpArr[index] = uploadResult.filePath;
  newFormInline.value.card_images = tmpArr.join(",");
}
function removeCard(uploadResult, file, index) {
  let tmpArr = newFormInline.value.card_images.split(",");
  tmpArr[index] = '';
  newFormInline.value.card_images = tmpArr.join(",");
}

function handelCardValidDate(val){
  console.log(val);
  if (val && val.length > 0 ){
    newFormInline.value.valid_date_end = val[1] || ""
    newFormInline.value.valid_date_begin = val[0] || ""
  }
}
function hendelGeneratePassword(){
  newFormInline.value.password =  generatePassword()
}

watch(
  ()=>props.formInline.avatarLink,
  (newValue, oldValue) => {
    if (newValue){
      avatarList.value = [
        {
          url: newValue,
          name: getFileName(props.formInline.avatarLink)
        }
      ]
    }
  },
  { immediate: true }
)
watch(
  ()=>newFormInline.value.valid_date_end,
  (newValue, oldValue) => {
    if (newFormInline.value.valid_date_end && newFormInline.value.valid_date_begin && !card_valid_date.value.length ){
      card_valid_date.value = [newFormInline.value.valid_date_begin, newFormInline.value.valid_date_end]
    }
  },
  { immediate: true }
)
watch(
  ()=>newFormInline.value.card_images,
  (newValue, oldValue) => {
    if (newValue ){
      get_link_sign({
        urls: newFormInline.value.card_images 
      }).then(res => {
        let tmpArr = newValue.split(",")
        
        let cardImagesArr = []
        for (let i = 0; i < tmpArr.length; i++) { 
          let tmpName = getFileName(tmpArr[i])
          let signLink = res && res.data && res.data.list && res.data.list[i] || ""
          if (signLink && signLink.indexOf(tmpName) ){
            cardImagesArr.push({
              url: signLink,
              name: tmpName
            })
          }
        }
        if (cardImagesArr.length > 0){ 
          card_images_0.value = [cardImagesArr[0]]
          card_images_1.value = [cardImagesArr[1]]

        }
      })
    }
  },
  { immediate: true }
)
watch(
  () => newFormInline.value.birth_date,
  (val) => { 
    if (val) { 
      newFormInline.value.constellation = getConstellation(val)
    }
  },
  { immediate: true }
)

defineExpose({ getRef, handelSelectUserUnitDept });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="110px"
  >
    <el-row :gutter="30">
      <re-col>
        <el-form-item label="组织单位"  prop="unit_id">
          <SelectUserUnitCascader :changed="handelSelectUserUnit" :modelValue="newFormInline.unit_id"  />
        </el-form-item>
      </re-col>
    </el-row>
    <el-row :gutter="30">
      <re-col >
        <el-form-item label="归属部门" prop="dept_id">
          <SelectDeptCascader  :changed="handelSelectUserUnitDept" :modelValue="newFormInline.dept_id" :selectUnitIds="newFormInline.unit_id"></SelectDeptCascader>
        </el-form-item>
      </re-col>
    </el-row>
    <el-row :gutter="30">
      <re-col >
        <el-form-item label="用户角色" prop="role_id">
          <SelectRoleCascader  :changed="handelSelectUserUnitRole" :modelValue="newFormInline.role_id.length>0 && newFormInline.role_id[newFormInline.role_id.length-1]" :selectUnitIds="newFormInline.unit_id"></SelectRoleCascader>
        </el-form-item>
      </re-col>
    </el-row>
    
    <el-row :gutter="30">
      <re-col >
        <el-form-item label="头像" prop="avatar">
          <sliceUploadV2 
            :bucketACL="'public'"
            :uploadSuccessCallback="uploadSuccessAvatar"
            :elementPlusUploader="{
              'list-type': 'picture-card',
              'show-file-list': true,
              'file-list': avatarList,
              'on-remove': removeAvatar,
            }"
          >
            <template #default>
              <AddLargeLine  style="width: 40px; height: 40px;"/>
            </template>
          </sliceUploadV2>
        </el-form-item>
      </re-col>
    </el-row>
    <el-row :gutter="30">
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="用户名称" prop="name">
          <el-input
            v-model="newFormInline.name"
            clearable
            placeholder="请输入用户名称"
          />
        </el-form-item>
      </re-col>

      <re-col
        v-if="newFormInline.title === '新增'"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="用户密码" prop="password">
          <el-input
            v-model="newFormInline.password"
            clearable
            placeholder="请生成用户密码"
            readonly
          >
            <template #append>
              <el-button :icon="Key" class="key-width" type="primary" @click="hendelGeneratePassword"/>
            </template>
          </el-input>
        </el-form-item>
      </re-col>
      
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="newFormInline.phone"
            clearable
            placeholder="请输入手机号"
            :readonly="newFormInline.id!=''"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="newFormInline.email"
            clearable
            placeholder="请输入邮箱"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="用户性别" prop="gender">
          <el-radio-group v-model="newFormInline.gender">
            <el-radio-button 
              v-for="(item, index) in radioBttonParams.gender"
              :key="index"
              :label="item.value"
            >
              {{item.label}}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </re-col>

      <re-col
        v-if="newFormInline.title === '新增'"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="用户状态" prop="status">
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
      
      
      <re-col :value="24" :xs="24" :sm="24"> 
        <el-form-item label="注册渠道" prop="source">
          <el-radio-group v-model="newFormInline.source">
            <el-radio-button 
              v-for="(item, index) in radioBttonParams.user_source"
              :key="index"
              :label="item.value"
              :disabled="index!==0"
            >
              {{item.label}}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </re-col>
      
      <re-col :value="12" :xs="24" :sm="24"> 
        <el-form-item label="毕业院校" prop="graduated_from">
          <el-input
            v-model="newFormInline.graduated_from"
            clearable
            placeholder="请输入毕业院校"
          />
        </el-form-item>
      </re-col>
      
      <re-col :value="12" :xs="24" :sm="24"> 
        <el-form-item label="学历" prop="schooling">
          <el-input
            v-model="newFormInline.schooling"
            clearable
            placeholder="请输入学历"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24"> 
        <el-form-item label="学位编号" prop="degree_number">
          <el-input
            v-model="newFormInline.degree_number"
            clearable
            placeholder="请输入学位编号"
          />
        </el-form-item>
      </re-col>
      
      <re-col :value="12" :xs="24" :sm="24"> 
        <el-form-item label="所学专业" prop="professional">
          <el-input
            v-model="newFormInline.professional"
            clearable
            placeholder="请输入所学专业"
          />
        </el-form-item>
      </re-col>
      
      <re-col :value="12" :xs="24" :sm="24"> 
        <el-form-item label="职业" prop="occupation">
          <el-input
            v-model="newFormInline.occupation"
            clearable
            placeholder="请输入职业"
          />
        </el-form-item>
      </re-col>
      
      <re-col :value="12" :xs="24" :sm="24" v-if="false"> 
        <el-form-item label="所属公司名称" prop="company">
          <el-input
            v-model="newFormInline.company"
            clearable
            placeholder="请输入所属公司名称"
          />
        </el-form-item>
      </re-col>
      
      <re-col :value="12" :xs="24" :sm="24"> 
        <el-form-item label="通讯地址" prop="address">
          <el-input
            v-model="newFormInline.address"
            clearable
            placeholder="请输入通讯地址"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24"> 
        <el-form-item label="紧急联系人姓名" prop="emergency_name">
          <el-input
            v-model="newFormInline.emergency_name"
            clearable
            placeholder="请输入紧急联系人姓名"
          />
        </el-form-item>
      </re-col>
      
      <re-col :value="12" :xs="24" :sm="24"> 
        <el-form-item label="紧急联系人电话" prop="emergency_tel">
          <el-input
            v-model="newFormInline.emergency_tel"
            clearable
            placeholder="请输入紧急联系人电话"
          />
        </el-form-item>
      </re-col>
      
      <re-col :value="24" :xs="24" :sm="24"> 
        <el-form-item label="证件类型" prop="card_type">
          <el-radio-group v-model="newFormInline.card_type">
            <el-radio-button 
              v-for="(item, index) in radioBttonParams.card_type"
              :key="index"
              :label="item.value"
            >
              {{item.label}}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24"> 
        <el-form-item label="证件照正面" prop="card_images">
          <sliceUploadV2 
            class="card-images-upload"
            :bucketACL="'private'"
            :uploadSuccessCallback="(uploadResult, file)=>{uploadSuccessCard(uploadResult, file, 0)}"
            :elementPlusUploader="{
              'list-type': 'picture-card',
              'show-file-list': true,
              'file-list': card_images_0,
              'on-remove': (uploadResult, file)=>{removeCard(uploadResult, file, 0)},
            }"
          >
            <template #default>
              <AddLargeLine  style="width: 40px; height: 40px;"/>
            </template>
          </sliceUploadV2>
        </el-form-item>
      </re-col>
      
      <re-col :value="12" :xs="24" :sm="24"> 
        <el-form-item label="证件照反面" prop="card_images">
          <sliceUploadV2 
            class="card-images-upload"
            :bucketACL="'private'"
            :uploadSuccessCallback="(uploadResult, file)=>{uploadSuccessCard(uploadResult, file, 1)}"
            :elementPlusUploader="{
              'list-type': 'picture-card',
              'show-file-list': true,
              'file-list': card_images_1,
              'on-remove': (uploadResult, file)=>{removeCard(uploadResult, file, 1)},
            }"
          >
            <template #default>
              <AddLargeLine  style="width: 40px; height: 40px;"/>
            </template>
          </sliceUploadV2>
        </el-form-item>
      </re-col>
      
      <re-col :value="12" :xs="24" :sm="24"> 
        <el-form-item label="证件号码" prop="card_num">
          <el-input
            v-model="newFormInline.card_num"
            clearable
            placeholder="请输入证件号码"
          />
        </el-form-item>
      </re-col>
      
      <re-col :value="12" :xs="24" :sm="24"> 
        <el-form-item label="身份证有效期" prop="card_valid_date">
          <el-date-picker
            v-model="card_valid_date"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change = "handelCardValidDate"
          >
          </el-date-picker>
        </el-form-item>
      </re-col>
      
      <re-col :value="12" :xs="24" :sm="24"> 
        <el-form-item label="出生日期" prop="birth_date">
          <el-date-picker
            v-model="newFormInline.birth_date"
            type="date"
            placeholder="选择出生日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </re-col>
      
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="星座" prop="constellation">
          <el-input
            v-model="newFormInline.constellation"
            clearable
            readonly
            placeholder="选择出生日期"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="newFormInline.remark"
            placeholder="请输入备注信息"
            type="textarea"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <font color="red">注：请填写正确的手机号，手机号后续维护由用户自己更新绑定</font>
      </re-col>
    </el-row>
  </el-form>
</template>

<style lang="scss" scoped>
:deep(.card-images-upload){
  .el-upload--picture-card{
    width: 80px!important;
    height: 80px!important;
  }
}
:deep(.key-width){
  padding: 2px;
  .el-icon {
    height: 1.5em;
    line-height: 1.5em;
    width: 1.5em;
    svg {
      height: 1.5em;
      line-height: 1.5em;
      width: 1.5em;
    }
  }
}
</style>
