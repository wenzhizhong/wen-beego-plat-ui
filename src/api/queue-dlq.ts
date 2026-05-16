import { http } from "@/utils/http/index.js";
import type { Result, ResultTable } from "@/utils/http/types.api";
import { QUEUE_DLQ_GET, QUEUE_DLQ_REQUEUE } from "./api.js";


export const getQueueDlqList = (params?: object) => {
  return http.request<ResultTable>("get", QUEUE_DLQ_GET, { params });
};

export const requeueDlq = (data?: object) => {
  return http.request<Result>("post", QUEUE_DLQ_REQUEUE, { data });
};
