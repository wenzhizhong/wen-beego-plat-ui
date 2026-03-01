import { http } from "@/utils/http";
import { GET_USER_UNIT_LIST } from "@/api/api.js"


export interface unitItf {
  id?: string;
  pid?: string;
  logo?: string;
  logoLink?: string;
  name?: string;
  code?: string;
  corporation?: string;
  license?: string;
  address?: string;
  status?: number;
  deleted?: number;
  create_time?: string;
  update_time?: string
}

export interface unitResult{
  code: number;
  message: string;
  data: {
    list: Array<unitItf>;
  }
};

export function getUserUnit (params){
  return http.request<unitResult>("get", GET_USER_UNIT_LIST, { params });
}