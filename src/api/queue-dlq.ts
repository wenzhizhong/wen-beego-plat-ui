import { http } from "@/utils/http/index.js";
import { QUEUE_DLQ_GET, QUEUE_DLQ_REQUEUE } from "./api.js";

type Result = {
  code: number;
  message: string;
  data?: any;
};
type ResultTable = {
  code: number;
  message: string;
  data?: {
    list: Array<any>;
    total?: number;
    pageSize?: number;
    currentPage?: number;
  };
};

export const getQueueDlqList = (params?: object) => {
  return http.request<ResultTable>("get", QUEUE_DLQ_GET, { params });
};

export const requeueDlq = (data?: object) => {
  return http.request<Result>("post", QUEUE_DLQ_REQUEUE, { data });
};
