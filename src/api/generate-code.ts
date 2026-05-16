import { http } from "@/utils/http";
import type { Result, ResultTable } from "@/utils/http/types.api";

import {
  GENERATE_CODE_LIST,
  GENERATE_CODE_DB_TABLES,
  GENERATE_CODE_DB_TABLE_DETAIL,
  GENERATE_CODE_SAVE,
  GENERATE_CODE_DEL,
  GENERATE_CODE_GEN_PARAMS,
  GENERATE_CODE_RUN,
  GENERATE_CODE_DOWNLOAD
} from "./api.js";


/** 获取代码生成配置列表 */
export const getGenerateCodeList = (params?: object) => {
  return http.request<ResultTable>("get", GENERATE_CODE_LIST, { params });
};

/** 获取所有数据库表 */
export const getDbTableList = (data?: object) => {
  return http.request<Result>("post", GENERATE_CODE_DB_TABLES, { data: data || {} });
};

/** 获取数据库表详情 */
export const getDbTableDetail = (data?: object) => {
  return http.request<Result>("post", GENERATE_CODE_DB_TABLE_DETAIL, { data });
};

/** 保存/更新表单配置 */
export const saveFormDetail = (data?: object) => {
  return http.request<Result>("post", GENERATE_CODE_SAVE, { data });
};

/** 删除表单配置 */
export const delFormDetail = (data?: object) => {
  return http.request<Result>("post", GENERATE_CODE_DEL, { data });
};

/** 获取生成代码参数 */
export const getGenerateCodeParam = (data?: object) => {
  return http.request<Result>("get", GENERATE_CODE_GEN_PARAMS, { data: data || {} });
};

/** 执行代码生成 */
export const getGenerateCodeRun = (data?: object) => {
  return http.request<Result>("post", GENERATE_CODE_RUN, { data });
};

/** 下载生成的代码 */
export const downloadCode = (data?: object) => {
  return http.request<any>("post", GENERATE_CODE_DOWNLOAD, {
    data,
    responseType: "blob"
  });
};
