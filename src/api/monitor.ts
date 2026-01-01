import { http } from "@/utils/http/index.js";
import {
  MONITOR_CRON_GET,
  MONITOR_CRON_ADD,
  MONITOR_CRON_EDIT,
  MONITOR_CRON_DEL,
  MONITOR_CRON_AVAIBLE,
  MONITOR_CRON_START, 
  MONITOR_CRON_STOP,
  MONITOR_CRON_CHANGE_STATUS,
  MONITOR_CRON_LOG_GET,
} from "./api.js";
type Result = {
  code : number;
  message: string;
  data?: any;
};
type ResultTable = {
  code : number;
  message: string;
  data?: {
    /** 列表数据 */
    list: Array<any>;
    /** 总条目数 */
    total?: number;
    /** 每页显示条目个数 */
    pageSize?: number;
    /** 当前页数 */
    currentPage?: number;
  };
};

// 获取定时任务列表
export const getCronList = (params?: object) => {
  return http.request<ResultTable>("get", MONITOR_CRON_GET, { params });
};
// 新增定时任务
export const addCron = (data?: object) => {
  return http.request<Result>("post", MONITOR_CRON_ADD, { data });
};
// 修改定时任务
export const editCron = (data?: object) => {
  return http.request<Result>("post", MONITOR_CRON_EDIT, { data });
};
// 删除定时任务
export const delCron = (data?: object) => {
  return http.request<Result>("post", MONITOR_CRON_DEL, { data });
};
// 获取定时任务可用状态
export const avaibleCron = async (params?: object) => {
  return http.request<Result>("get", MONITOR_CRON_AVAIBLE, { params });
};
// 开/关定时任务

export const changeStatusCron = (data?: object) => {
  return http.request<Result>("post", MONITOR_CRON_CHANGE_STATUS , { data });
};


// 启动定时任务
export const startCron = (data?: object) => {
  return http.request<Result>("post", MONITOR_CRON_START, { data });
}; 
// 关闭定时任务
export const stopCron = (data?: object) => {
  return http.request<Result>("post", MONITOR_CRON_STOP, { data });
};


// 获取定时任务日志列表
export const getCronLogList = (params?: object) => {
  return http.request<ResultTable>("get", MONITOR_CRON_LOG_GET, { params });
};