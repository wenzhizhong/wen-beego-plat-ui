import axios from "axios";
import { http } from "@/utils/http";
import { Result } from "@/utils/http/types.api";
import { DataInfo, formatToken, getAuthorizedToken, getToken } from "@/utils/auth";
import { UPLOAD, GET_UPLOAD_LINK_SIGN } from "@/api/api.js"
import Cookies from "js-cookie";
import { message } from "@/utils/message";
import { computeFileMD5 } from "@/utils/file";


export const upload = async (file : File, fileName : string ="", fileSize : number = 0, bucketACL :string = "private")=>{
  let formData = new FormData()
  formData.append('file', file)
 
  await computeFileMD5(file).then((md5Str: string) => {
    file["uniqueIdentifier"]  = md5Str
    formData.append('identifier', md5Str)
  })
  formData.append("relativePath", fileName)
  formData.append("totalChunks", "1")
  formData.append("chunkNumber", "1")
  formData.append("currentChunkSize", fileSize.toString())
  formData.append("chunkSize", fileSize.toString())
  formData.append("totalSize", fileSize.toString())
  formData.append("batchId", "")
  formData.append("bucketACL", bucketACL)

  let headers = { Authorization:"" };
  let accessToken = await getAuthorizedToken()
  if (!accessToken) message("请先登录！", { type: "error" })
  headers["Authorization"] = accessToken

  return axios.post(UPLOAD, formData, { headers }).then(res => {
    file["fileId"]  = res?.data?.data?.fileId || ""
    file["filePath"]  = res?.data?.data?.filePath || ""
    return res?.data || {}
  })
}
export const get_link_sign = async (params: any) => { 
  return http.request<Result>("get", GET_UPLOAD_LINK_SIGN, { params });
};