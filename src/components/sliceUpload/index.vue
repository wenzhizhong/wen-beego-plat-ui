<template>
    <!-- @change="change"
    @dragover="dragover"
    @dragenter="dragenter"
    @dragleave="dragleave"
    @files-submitted="filesSubmitted"
    @file-removed="fileRemoved"
    @file-retry="fileRetry"
    @upload-start="uploadStart"
    @file-added="fileAdded" -->
    <!-- @files-added="filesAdded" -->
  <uploader
    :options="options"
    :file-status-text="statusText"
    class="uploader-example"
    ref="uploaderRef"
    @file-complete="fileComplete"
    @complete="complete"
    @file-success="fileSuccess"
    @file-error="fileError"
    @file-progress="fileProgress"
    @file-added="fileAdded"
  >
    <uploader-unsupport></uploader-unsupport>
    <uploader-drop>
      <div class="uploader-drop-inner">
        <div>
          <uploader-btn v-show="showUploadFileBtn"> 选择文件</uploader-btn>
          <uploader-btn v-show="showUploadImageBtn" :attrs="imgAttrs">选择文件图片</uploader-btn>
          <uploader-btn v-show="showUploadDirBtn" :directory="true">选择目录</uploader-btn>
        </div>
        <div>
          <p>拖拽上传</p>
        </div>
      </div>
    </uploader-drop>
    <uploader-list></uploader-list>
  </uploader>
</template>

<script lang="ts">
  import { nextTick, ref, onMounted, defineOptions, computed } from 'vue'
  import SparkMD5 from "spark-md5";
  import { getUploadToken, getVarType, getBatchId, setFileMD5 } from "./common"
  import { VUE_SIMPLE_UPLOAD } from "@/api/api.js"
  import { ElMessage } from 'element-plus';

  
  // https://github.com/simple-uploader/vue-uploader/tree/vue3
  export default {
    name: 'SimpleUploader',
    props: {
      bucketACL: {
        type: String,
        default: 'private' // private | public
      },
      batchId: {
        type: String,
        default: ''
      },
      uploaderOption: {
        type: Object,
        default: {}
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
      tip: {
          type: String,
          default: ''
      },
    },

    setup (props) {
      const uploaderRef = ref<any>(null)
      const options = {
        target: VUE_SIMPLE_UPLOAD,
        testChunks: true,
        forceChunkSize: true,
        chunkSize: props.uploaderOption && props.uploaderOption.chunkSize ? props.uploaderOption.chunkSize : 20 * 1024 * 1024, // 20MB
        simultaneousUploads: props.uploaderOption && props.uploaderOption.simultaneousUploads ? props.uploaderOption.simultaneousUploads : 3, //并发上传数
        fileParameterName: 'file', //上传文件时文件的参数名，默认file
        maxChunkRetries: props.uploaderOption && props.uploaderOption.maxChunkRetries ? props.uploaderOption.maxChunkRetries : 10,  //最大自动失败重试上传次数
        generateUniqueIdentifier:true,
        headers: {
            'Authorization': getUploadToken() // 在添加added file的时候再设置Authorization
        },
        categoryMap:{
          image: ['gif', 'jpg', 'jpeg', 'png', 'bmp', 'webp'],
          video: ['mp4', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv'],
          audio: ['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac'],
          document: ['doc', 'txt', 'docx', 'pages', 'epub', 'pdf', 'numbers', 'csv', 'xls', 'xlsx', 'keynote', 'ppt', 'pptx']
        },
        // 额外的自定义查询参数
        query: (file, chunk) => {
            return {
                ...file.params,
                batchId: props.batchId || getBatchId(),
                bucketACL: props.bucketACL,
                name: file.name,
                directory: file.parent.path,
            }
        },
        // 服务器分片校验函数，秒传及断点续传基础
        checkChunkUploadedByResponse: (chunk, message)=> {
            // console.log('checkChunkUploadedByResponse',chunk, message);
            let objMessage = 'string' === getVarType(message)? JSON.parse(message): message ;
            if (objMessage && objMessage.data && objMessage.data.skipUpload) {
                return true;
            }
            return ((objMessage && objMessage.data && objMessage.data.uploaded) || []).indexOf(chunk.offset + 1) >= 0;
        },
        parseTimeRemaining: function (timeRemaining, parsedTimeRemaining) { //格式化时间
            return parsedTimeRemaining
                .replace(/\syears?/, '年')
                .replace(/\days?/, '天')
                .replace(/\shours?/, '小时')
                .replace(/\sminutes?/, '分钟')
                .replace(/\sseconds?/, '秒')
        }
      }
      
      
      const imgAttrs = {
        accept: 'image/*'
      }
      const statusText = {
        success: '成功',
        error: '失败',
        uploading: '上传中',
        paused: '暂停中',
        waiting: '等待中'
      }
      const complete = (...args: any[]) => {
        console.log('complete', args)
      }
      
      const fileComplete = (...args: any[]) => {
        console.log('file complete', args)
      }
      const change =(event)=>{
        console.log("change():", event)
      }
      const dragover =(event)=>{
        console.log("dragover():", event)
      }
      const dragenter =(event)=>{
        console.log("dragenter():", event)
      }
      const dragleave =(event)=>{
        console.log("dragleave():", event)
      }
      const fileSuccess =(rootFile, file, message, chunk)=>{
        // console.log("fileSuccess():", rootFile, file, message, chunk)
        let resp = JSON.parse(message);
        if (resp && resp.code == 200 && resp.data.fileId) {
            if(props.uploadSuccessCallback) 
              props.uploadSuccessCallback(resp.data, file)
        }else{
          console.error("没有返回附件路径")
        }
      }
      const fileProgress =(rootFile, file, chunk)=>{
        // console.log("fileProgress():", rootFile, file, chunk)
        console.log(`上传中 ${file.name}，chunk：${chunk.startByte / 1024 / 1024} ~ ${chunk.endByte / 1024 / 1024}`)
      }
      const fileAdded =(file, event)=>{
        console.log("fileAdded():", file, event)
      
        if(props.beforeUploadCallback){
            let checkRes = props.beforeUploadCallback(file, event);
            console.log("checkRes", checkRes)
            if(!checkRes){
                file.cancel(); 
                return false
            }
        }
        // 计算MD5  
        setFileMD5(file, props.uploaderOption.chunkSize)
      }
      const filesSubmitted =(files, fileList, event)=>{
        console.log("filesSubmitted():", files, fileList, event)
      }
      const fileRemoved =(file)=>{
        console.log("fileRemoved():", file)
      }
      const fileRetry =(rootFile, file, chunk)=>{
        console.log("fileRetry():", rootFile, file, chunk)
      }
      const fileError =(rootFile, file, message, chunk)=>{
        // console.log("fileError():", rootFile, file, message, chunk)
          file.pause();

          let msg = "上传失败，请重试！"
          ElMessage.error(msg)
          console.error(message)
      }
      const uploadStart =()=>{
        console.log("uploadStart():" )
      }


      defineOptions({
        name: 'SimpleUploader'
      })
      onMounted(() => {
        nextTick(() => {
          window["uploader"] = uploaderRef.value.uploader
        })
      })
      
      return {
        uploaderRef,
        options,
        imgAttrs,
        statusText,
        complete,
        fileComplete,
        change,
        dragover,
        dragenter,
        dragleave,
        fileSuccess,
        fileProgress,
        fileAdded,
        filesSubmitted,
        fileRemoved,
        fileRetry,
        fileError,
        uploadStart,
      }
    }
  }
</script>

<style lang="scss" scoped>
  .uploader-example {
    width: 100%;
    .uploader-drop {
      border-radius: 6px;
      .uploader-btn{
        font-family: inherit  ;
        margin-right: 6px;
        box-sizing: border-box;
        border-radius: 4px;
        color: #fff;
        background-color: var(--el-color-primary);
        border-color: var(--el-color-primary);
      }
      .uploader-btn:hover{
        background-color: var(--el-color-primary-light-2);
        border-color: var(--el-color-primary-light-2);
      }
      .uploader-drop-inner{
        text-align: left;
      }
    }
  }
</style>