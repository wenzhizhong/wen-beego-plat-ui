import { getToken, formatToken, DataInfo } from "@/utils/auth";
import { ElMessage } from "element-plus";
import SparkMD5 from "spark-md5";

let uploadTokenKey = "uploadToken"
async function setUploadToken() {
  try{
    let tmpData = await getToken();
    let userInfo = tmpData && tmpData as DataInfo || {} as DataInfo;
    if (userInfo.accessToken) 
      window[uploadTokenKey] = formatToken(userInfo.accessToken);
  }catch(e) {
    console.error(e)
  }
}
setUploadToken()
setInterval(async () => {
  setUploadToken()
}, 1000 * 60 )


export function getUploadToken() {
  return window[uploadTokenKey];
}

export function getVarType(varParam){
    return Object.prototype.toString.call(varParam).toLowerCase().replace(/(\[object )|\]/g, '');
}
export function getBatchId(){
  return (Date.now().toString()+(parseInt(performance.now()).toString()) + Math.floor(Math.random()*100000) )
}


export function setFileMD5(file, chunkSize) {
    let spark = new SparkMD5.ArrayBuffer();
    let fileReader = new FileReader();
    //获取文件分片对象（注意它的兼容性，在不同浏览器的写法不同）
    let blobSlice = File.prototype.slice || (File.prototype && File.prototype['mozSlice']) || (File.prototype && File.prototype['webkitSlice']);
    // 当前分片下标
    let currentChunk = 0;
    // 分片总数(向上取整)
    let chunks = Math.ceil(file.size / chunkSize);
    // MD5加密开始时间
    let startTime = new Date().getTime();
    // 暂停上传
    file.pause();
    loadNext();
    // fileReader.readAsArrayBuffer操作会触发onload事件
    console.log("chunks=", chunks, "file.size=", file.size, "chunkSize=", chunkSize)
    fileReader.onload = function (e) {
        // console.log("currentChunk :>> ", currentChunk);
        spark.append(e.target.result);
        if (currentChunk < chunks) {
            currentChunk++;
            loadNext();
        } else {
            // 该文件的md5值
            let md5 = spark.end();
            console.log(
                `MD5计算完毕：${md5}，耗时：${new Date().getTime() - startTime} ms.`
            );
            file.uniqueIdentifier = md5
            file.resume()
        }
    };
    fileReader.onerror = function () {
      ElMessage.error('文件读取出错！');
    };
    // 加载下一个分片
    function loadNext() {
        const start = currentChunk * chunkSize;
        const end = start + chunkSize >= file.size ? file.size : start + chunkSize;
        // 文件分片操作，读取下一分片(fileReader.readAsArrayBuffer操作会触发onload事件)
        fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end));
    }
}