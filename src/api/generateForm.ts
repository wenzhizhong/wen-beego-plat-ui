import { http } from "@/utils/http";
import type { Result, ResultTable } from "@/utils/http/types.api";

const BASE_API = "/api/admin_plat/system-generate-form";

export const getGenerateFormList = (params?: object) => {
  return http.request<ResultTable>("get", BASE_API + "/get", { params });
};

export const getGenerateFormDetail = (params?: object) => {
  return http.request<Result>("get", BASE_API + "/detail", { params });
};

export const addGenerateForm = (data?: object) => {
  return http.request<Result>("post", BASE_API + "/add", { data });
};

export const editGenerateForm = (data?: object) => {
  return http.request<Result>("post", BASE_API + "/edit", { data });
};

export const delGenerateForm = (data?: object) => {
  return http.request<Result>("post", BASE_API + "/del", { data });
};
