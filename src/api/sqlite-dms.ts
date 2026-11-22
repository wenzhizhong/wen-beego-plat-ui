import { http } from "@/utils/http";
import type { Result, ResultTable } from "@/utils/http/types.api";

import {
  SQLITE_DMS_DATA_SOURCE_LIST,
  SQLITE_DMS_DATA_SOURCE_ALL,
  SQLITE_DMS_DATA_SOURCE_TEST,
  SQLITE_DMS_DATA_SOURCE_SAVE,
  SQLITE_DMS_DATA_SOURCE_DEL,
  SQLITE_DMS_TABLE_LIST,
  SQLITE_DMS_TABLE_SCHEMA,
  SQLITE_DMS_TABLE_DATA,
  SQLITE_DMS_EXECUTE
} from "./api.js";

/** 获取 SQLite 数据源列表 */
export const getSqliteDataSourceList = (params?: object) => {
  return http.request<ResultTable>("get", SQLITE_DMS_DATA_SOURCE_LIST, {
    params
  });
};

/** 获取全部 SQLite 数据源（下拉选择） */
export const getAllSqliteDataSource = () => {
  return http.request<Result>("get", SQLITE_DMS_DATA_SOURCE_ALL);
};

/** 测试 SQLite 连接 */
export const testSqliteConnection = (data?: object) => {
  return http.request<Result>("post", SQLITE_DMS_DATA_SOURCE_TEST, { data });
};

/** 保存 SQLite 数据源 */
export const saveSqliteDataSource = (data?: object) => {
  return http.request<Result>("post", SQLITE_DMS_DATA_SOURCE_SAVE, { data });
};

/** 删除 SQLite 数据源 */
export const delSqliteDataSource = (data?: object) => {
  return http.request<Result>("post", SQLITE_DMS_DATA_SOURCE_DEL, { data });
};

/** 获取数据源下的数据表 */
export const getSqliteTables = (data?: object) => {
  return http.request<Result>("post", SQLITE_DMS_TABLE_LIST, { data });
};

/** 获取表结构 */
export const getSqliteTableSchema = (data?: object) => {
  return http.request<Result>("post", SQLITE_DMS_TABLE_SCHEMA, { data });
};

/** 获取表数据 */
export const getSqliteTableData = (data?: object) => {
  return http.request<Result>("post", SQLITE_DMS_TABLE_DATA, { data });
};

/** 执行 DML/DDL */
export const executeSqliteSql = (data?: object) => {
  return http.request<Result>("post", SQLITE_DMS_EXECUTE, { data });
};
