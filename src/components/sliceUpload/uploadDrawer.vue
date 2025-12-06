<script lang="ts">
  import { ref, defineOptions } from 'vue';
  import SimpleUploader from './index.vue'
  // import SimpleUploader from "@/components/sliceUpload/index.vue";
  
  export default {
    name: 'SimpleUploaderDrawer',
    components: {
      SimpleUploader
    },
    props: {
      batchId: {
        type: String,
        default: ''
      },
      uploadOption: {
        type: Object,
        default: {}
      },
      uploadTip:{
        type: String,
        default: ''
      },
      showUploadFileBtn: {
        type: Boolean,
        default: true
      },
      showUploadDirBtn: {
        type: Boolean,
        default: true
      },
      showUploadImageBtn: {
        type: Boolean,
        default: true
      },
      beforeUploadCallback: {
          type: Function,
          required: false,
          default: null
      },
      uploadSuccessCallback:{
          type: Function,
          required: true
      },
    },
    setup (props) { 
      const show = ref(false)

      defineOptions({
        name: 'SimpleUploaderDrawer'
      })

      return {
        show,
        // title: props.title,
        // uploadOption: props.uploadOption,
        // uploadTip: props.uploadTip
        uploadSuccessCallback: props.uploadSuccessCallback
      }
    }
  }
</script>
<template>
  <div>
    <el-button @click="show=true"> 上传文件</el-button>

    <el-drawer 
      :direction="'rtl'"
      v-model="show"
      :title="'上传文件'"
      class="upload-drawer"
      :close-on-click-modal="false"
      :size="'900px'"
      append-to-body
    >
      <SimpleUploader 
        :option="uploadOption" 
        :tip="uploadTip" 
        :showUploadFileBtn="showUploadFileBtn" 
        :showUploadDirBtn="showUploadDirBtn" 
        :showUploadImageBtn="showUploadImageBtn"
        :beforeUploadCallback="beforeUploadCallback"
        :uploadSuccessCallback="uploadSuccessCallback"
      ></SimpleUploader>
    </el-drawer>
    
  </div>
</template>