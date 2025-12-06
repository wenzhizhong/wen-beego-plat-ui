<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import {getFileSuffix, getFileName} from "@/utils/util.js"
  import  Uploader from 'simple-uploader.js/dist/uploader.min.js'
  import { getUploadToken, getVarType, getBatchId, setFileMD5 } from '../sliceUpload/common'
  import { VUE_SIMPLE_UPLOAD } from "@/api/api.js"
  // import AddLargeLine from "~icons/ri/add-large-line";
  import { ElMessage } from 'element-plus';
  import VideoPlayer from "@/components/VideoPlayer/index.vue"

  
  const showImagePreview = ref(false)
  const showVideoPreview = ref(false)
  const showAudioPreview = ref(false)
  const showDocPreview = ref(false)
  const previewUrlList = ref([])

  const categoryMap ={
    image: ['gif', 'jpg', 'jpeg', 'png', 'bmp', 'webp'],
    video: ['mp4', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv'],
    audio: ['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac'],
    document: ['doc', 'txt', 'docx', 'pages', 'epub', 'pdf', 'numbers', 'csv', 'xls', 'xlsx', 'keynote', 'ppt', 'pptx']
  }
  const props = defineProps ({
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
    beforeUploadCallback: {
        type: Function,
        required: false,
        default: null
    },
    uploadSuccessCallback:{
        type: Function,
        required: true
    },
    elementPlusUploader: {
      type: Object,
      default: {
        "headers":            {},       //			—		设置上传的请求头部	object
        "method":             "post",   //			post		设置上传请求方法	string
        "multiple":           false,    //			FALSE		是否支持多选文件	boolean
        "data":               {},       //			{}		上传时附带的额外参数 从 v2.3.13 支持 Awaitable 数据，和 Function	object / Function
        "name":               "file",   //			file		上传的文件字段名	string
        "with-credentials":   false,    //			FALSE		支持发送 cookie 凭证信息	boolean
        "show-file-list":     true,     //			TRUE		是否显示已上传文件列表	boolean
        "drag":               false,    //			FALSE		是否启用拖拽上传	boolean
        "accept":             "",       //			''		接受上传的文件类型（thumbnail-mode 模式下此参数无效）	string
        "crossorigin":        "",       //			—		原生属性 crossorigin	enum
        "on-preview":         ()=>{},   //			—		点击文件列表中已上传的文件时的钩子	Function
        "on-remove":          ()=>{},   //			—		文件列表移除文件时的钩子	Function
        "on-success":         ()=>{},   //			—		文件上传成功时的钩子	Function
        "on-error":           ()=>{},   //			—		文件上传失败时的钩子	Function
        "on-progress":        ()=>{},   //			—		文件上传时的钩子	Function
        "on-change":          ()=>{},   //			—		文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用	Function
        "on-exceed":          ()=>{},   //			—		当超出限制时，执行的钩子函数	Function
        "before-upload":      ()=>{},   //			—		上传文件之前的钩子，参数为上传的文件， 若返回false或者返回 Promise 且被 reject，则停止上传。	Function
        "before-remove":      ()=>{},   //			—		删除文件之前的钩子，参数为上传的文件和文件列表， 若返回 false 或者返回 Promise 且被 reject，则停止删除。	Function
        "file-list":          [],       //			[]		默认上传文件	object
        "list-type":          "text",   //			text		文件列表的类型	enum
        "auto-upload":        false,     //			TRUE		是否自动上传文件	boolean
        "http-request":       ()=>{},   //			请参考ajaxUpload		覆盖默认的 Xhr 行为，允许自行实现上传文件的请求	Function
        "disabled":           false,    //			FALSE		是否禁用上传	boolean
        "limit":              1,        //			—		允许上传文件的最大数量	number
      }
    }
  })
  const elementProps = computed(() => {
    if (props.elementPlusUploader['file-list']){
      for (const key in props.elementPlusUploader['file-list']) {
        let item = props.elementPlusUploader['file-list'][key]
        if (item && item.url) {
          previewUrlList.value.push(item.url)
        }
      }
    }
    return {
      headers: props.elementPlusUploader['headers'],
      method: props.elementPlusUploader['method'],
      multiple: props.elementPlusUploader['multiple'],
      data: props.elementPlusUploader['data'],
      name: props.elementPlusUploader['name'],
      'with-credentials': props.elementPlusUploader['with-credentials'],
      'show-file-list': props.elementPlusUploader['show-file-list'],
      drag: props.elementPlusUploader['drag'],
      accept: props.elementPlusUploader['accept'],
      crossorigin: props.elementPlusUploader['crossorigin'],
      'on-preview': props.elementPlusUploader['on-preview'],
      'on-remove': props.elementPlusUploader['on-remove'],
      'on-success': props.elementPlusUploader['on-success'],
      'on-error': props.elementPlusUploader['on-error'],
      'on-progress': props.elementPlusUploader['on-progress'],
      'on-change': props.elementPlusUploader['on-change'],
      'on-exceed': props.elementPlusUploader['on-exceed'],
      'before-upload': props.elementPlusUploader['before-upload'],
      'before-remove': props.elementPlusUploader['before-remove'],
      'file-list': props.elementPlusUploader['file-list'],
      'list-type': props.elementPlusUploader['list-type'],
      'http-request': props.elementPlusUploader['http-request'],
      disabled: props.elementPlusUploader['disabled'],
      limit: props.elementPlusUploader['limit']
    };
  });
  function doUpload(file) { 
    // el-upload 传递的 file 对象可能需要提取原生 File 对象
    let actualFile = file.raw || file; // 尝试获取原始文件对象

    let option = {...props.uploaderOption};
    option.target = VUE_SIMPLE_UPLOAD
    option.testChunks = true;
    option.forceChunkSize = true;
    option.chunkSize = option.chunkSize || 20 * 1024 * 1024; // 设置合适的分片大小
    option.headers = {
      'Authorization': getUploadToken() // 在添加added file的时候再设置Authorization
    }
    // 额外的自定义查询参数
    option.query= (file, chunk) => {
        return {
            ...file.params,
            batchId: props.batchId || getBatchId(),
            bucketACL: props.bucketACL,
            name: file.name,
            directory: file.parent.path,
        }
    },
    option.checkChunkUploadedByResponse = function (chunk, message) {
      let objMessage = 'string' === getVarType(message)? JSON.parse(message): message ;
      if (objMessage && objMessage.data && objMessage.data.skipUpload) {
          return true;
      }
      return ((objMessage && objMessage.data && objMessage.data.uploaded) || []).indexOf(chunk.offset + 1) >= 0;
    };

    let uploadObj = new Uploader(option)
    if (!uploadObj.support){
      ElMessage.error('当前浏览器不支持上传功能')
      return
    }
    uploadObj.on('start', function () { 
      console.log('开始上传')
    })
    uploadObj.on('fileAdded', function (file, event) {
      console.log(file, event)
      
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
    })
    uploadObj.on('fileSuccess', function (rootFile, file, message) {
      console.log(rootFile, file, message)
      let resp = JSON.parse(message);
      if (resp && resp.code == 200 && resp.data.fileId) {
          if(props.uploadSuccessCallback) 
            props.uploadSuccessCallback(resp.data, file)
      }else{
        console.error("没有返回附件路径")
      }
    })
    uploadObj.on('fileComplete', function (rootFile) {
      // console.log(rootFile)
    })
    uploadObj.on('fileError', function (rootFile, file, message) {
      console.log(rootFile, file, message)
    })
    
    uploadObj.addFile(actualFile)
    
    uploadObj.upload()
  }

  const elementOnPreview = (file)=>{
    let fileExt = getFileSuffix(file.name)
    let tmpPreviewType = "document"
    if (fileExt){
      for (let key in categoryMap) {
        if (!categoryMap[key]) continue
        for (let i = 0; i < categoryMap[key].length; i++) {
          if (fileExt === categoryMap[key][i]) {
            tmpPreviewType = key
            break
          }
        }
      }
    }
    showImagePreview.value = false
    showVideoPreview.value = false
    showAudioPreview.value = false
    showDocPreview.value = false
    switch (tmpPreviewType) {
      case "image":
        showImagePreview.value = true
        break
      case "video":
        showVideoPreview.value = true
        break
      case "audio":
        showAudioPreview.value = true
        break
      default:
        showDocPreview.value = true
        break
    }
    
  }
  defineExpose({ 
    doUpload,
    elementOnPreview,
    getFileName,
  })
</script>
<template>
  <div class="sliceUploadV2">
      <el-upload
        ref =               "uploadRef"
        action =            "#"
        :auto-upload =      "false"
        :on-change =        "doUpload"
        :headers =          "elementProps.headers"
        :method =           "elementProps.method"
        :multiple =         "elementProps.multiple"
        :data =             "elementProps.data"
        :name =             "elementProps.name"
        :with-credentials = "elementProps['with-credentials']"
        :show-file-list =   "elementProps['show-file-list']"
        :drag =             "elementProps.drag"
        :accept =           "elementProps.accept"
        :crossorigin =      "elementProps.crossorigin"
        :on-preview =       "elementOnPreview"
        :on-remove =        "elementProps['on-remove']"
        :on-success =       "elementProps['on-success']"
        :on-error =         "elementProps['on-error']"
        :on-progress =      "elementProps['on-progress']"
        :on-exceed =        "elementProps['on-exceed']"
        :before-upload =    "elementProps['before-upload']"
        :before-remove =    "elementProps['before-remove']"
        :list-type =        "elementProps['list-type']"
        :http-request =     "elementProps['http-request']"
        :disabled =         "elementProps.disabled"
        :limit =            "elementProps.limit"
        v-model:file-list = "elementProps['file-list']"

      >
        <slot name="default" />
        <slot name="trigger" />
        <slot name="tip" />
        <slot name="file" />
      </el-upload>


      <el-image-viewer
        v-if="showImagePreview"
        :url-list="previewUrlList"
        show-progress
        :initial-index="0"
        @close="showImagePreview = false"
      />
      <VideoPlayer 
        v-if="showVideoPreview"
        :url="previewUrlList[0]"
        :close="()=>{showVideoPreview = false}"
      ></VideoPlayer>
      <el-dialog
        v-model="showDocPreview"
        title="文件预览"
        width="50%"
        :show-close="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :destroy-on-close="true"
        :close-on-hash-change="false"
      
      >
        <a :href="previewUrlList[0]" target="_blank" >{{ getFileName(previewUrlList[0]) }}</a>
      </el-dialog>
  </div>
</template>