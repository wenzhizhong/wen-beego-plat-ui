import { http } from "@/utils/http";
import { GET_UPLOAD_LINK_SIGN } from "@/api/api.js"

type Result = {
  code : number;
  message: string;
  data?: any;
};
export const get_link_sign = async (params: any) => { 
  return http.request<Result>("get", GET_UPLOAD_LINK_SIGN, { params });
};