import { http } from "@/utils/http";

import { SYSTEM_UNIT_LIST, 
  SYSTEM_UNIT_ADD, 
  SYSTEM_UNIT_EDIT, 
  SYSTEM_UNIT_DEL, 
  SYSTEM_DEPT_LIST,SYSTEM_DEPT_DEPT_TREE, 
  SYSTEM_DEPT_ADD, 
  SYSTEM_DEPT_DEL, 
  SYSTEM_DEPT_EDIT, 
  SYSTEM_DEPT_PRINCIPAL, 
  SYSTEM_ROLE_LIST, 
  SYSTEM_ROLE_ADD, 
  SYSTEM_ROLE_EDIT, 
  SYSTEM_ROLE_DEL,
  SYSTEM_ROLE_MENU,
  SYSTEM_ROLE_MENU_IDS,
  SYSTEM_ROLE_MENU_SAVE,
  SYSTEM_USER_LIST, 
  SYSTEM_USER_ADD, 
  SYSTEM_USER_EDIT, 
  SYSTEM_USER_DEL, 
  SYSTEM_USER_ROLE_TREE,
} from "./api"

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


/** 系统管理-组织单位管理列表 */
export const getUnitList = (params?: object) => {
  return http.request<ResultTable>("get", SYSTEM_UNIT_LIST, { params });
};

/** 系统管理-组织单位-新增 */
export const addUnit = (data?: object) => {
  return http.request<Result>("post", SYSTEM_UNIT_ADD, { data });
};

/** 系统管理-组织单位-新增 */
export const delUnit = (data?: object) => {
  return http.request<Result>("post", SYSTEM_UNIT_DEL, { data });
};

/** 系统管理-组织单位-编辑 */
export const editUnit = (data?: object) => {
  return http.request<Result>("post", SYSTEM_UNIT_EDIT, { data });
};

/** 系统管理-用户管理列表 */
export const getUserList = (params?: object) => {
  return http.request<ResultTable>("get", SYSTEM_USER_LIST, { params });
};

export const addUser = (data?: object) => {
  return http.request<Result>("post", SYSTEM_USER_ADD, { data });
};
export const editUser = (data?: object) => {
  return http.request<Result>("post", SYSTEM_USER_EDIT, { data });
};
export const delUser = (data?: object) => {
  return http.request<Result>("post", SYSTEM_USER_DEL, { data });
};

/** 系统管理-用户管理-获取所有角色列表 */
export const getRoleTree = (params?: object) => {
  return http.request<Result>("get", SYSTEM_USER_ROLE_TREE, { params });
};

/** 系统管理-用户管理-根据userId，获取对应角色id列表（userId：用户id） */
export const getRoleIds = (data?: object) => {
  return http.request<Result>("post", "/list-role-ids", { data });
};

/** 系统管理-角色管理列表 */
export const getRoleList = (params?: object) => {
  return http.request<ResultTable>("get", SYSTEM_ROLE_LIST, { params });
};

/** 系统管理-角色-新增 */
export const addRole = (data?: object) => {
  return http.request<Result>("post", SYSTEM_ROLE_ADD, { data });
};

/** 系统管理-角色-新增 */
export const delRole = (data?: object) => {
  return http.request<Result>("post", SYSTEM_ROLE_DEL, { data });
};


/** 系统管理-角色-编辑 */
export const editRole = (data?: object) => {
  return http.request<Result>("post", SYSTEM_ROLE_EDIT, { data });
};

/** 系统管理-菜单管理列表 */
export const getMenuList = (data?: object) => {
  return http.request<Result>("post", "/menu", { data });
};

/** 系统管理-部门管理列表 */
export const getDeptList = (params?: object) => {
  return http.request<Result>("get", SYSTEM_DEPT_LIST, { params });
};
export const getDeptTree = (params?: object) => {
  return http.request<Result>("get", SYSTEM_DEPT_DEPT_TREE, { params });
};

/** 系统管理-新增部门 */
export const addDept = async (data?: object) => {
  return http.request<Result>("post", SYSTEM_DEPT_ADD, { data });
};


/** 系统管理-编辑部门 */
export const editDept = async (data?: object) => {
  return http.request<Result>("post", SYSTEM_DEPT_EDIT, { data });
};

/** 系统管理-删除部门 */
export const delDept = async (data?: object) => {
  return http.request<Result>("post", SYSTEM_DEPT_DEL, { data });
};

export const getDeptPrincipal = async (params?: object) => {
  return http.request<Result>("get", SYSTEM_DEPT_PRINCIPAL, { params });
};



/** 获取系统监控-在线用户列表 */
export const getOnlineLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/online-logs", { data });
};

/** 获取系统监控-登录日志列表 */
export const getLoginLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/login-logs", { data });
};

/** 获取系统监控-操作日志列表 */
export const getOperationLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/operation-logs", { data });
};

/** 获取系统监控-系统日志列表 */
export const getSystemLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/system-logs", { data });
};

/** 获取系统监控-系统日志-根据 id 查日志详情 */
export const getSystemLogsDetail = (data?: object) => {
  return http.request<Result>("post", "/system-logs-detail", { data });
};

/** 获取角色管理-权限-菜单权限 */
export const getRoleMenu = (params?: object) => {
  return http.request<Result>("get", SYSTEM_ROLE_MENU, { params });
};

/** 获取角色管理-权限-菜单权限-根据角色 id 查对应菜单 */
export const getRoleMenuIds = (params?: object) => {
  return http.request<Result>("get", SYSTEM_ROLE_MENU_IDS, { params });
};

export const saveRoleMenu = (data?: object) => {
  return http.request<Result>("post", SYSTEM_ROLE_MENU_SAVE, { data });
};