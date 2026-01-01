//跨域代理前缀
// const API_PROXY_PREFIX='/api'
// const BASE_URL = process.env.NODE_ENV === 'production' ? process.env.VUE_APP_API_BASE_URL : API_PROXY_PREFIX

// auth
export const LOGIN = `/api/admin_plat/auth/login`;
export const LOGOUT = `/api/ba/admin_plat/auth/logout`;
export const REFRESH_TOEKN = `/api/admin_plat/auth/refresh-token`;
export const CHANGE_UNIT = `/api/admin_plat/auth-plat/change-unit`;
export const GET_USER_UNIT_LIST = `/api/admin_plat/auth-plat/get-user-unit-list`;
export const GET_CAPTCHA = `/api/admin_plat/auth/get-captcha`;
export const GET_ASYNC_ROUTES = `/api/admin_plat/auth-menu/get-async-routes`;
export const GET_MODEL_PARAMS = `/api/admin_plat/auth-params/model-params`;
export const VUE_SIMPLE_UPLOAD = `/api/admin_plat/upload/vue-slice-upload`;
export const GET_UPLOAD_LINK_SIGN = `/api/admin_plat/upload/link-sign`;


// system
export const SYSTEM_UNIT_LIST = `/api/admin_plat/system-unit/get`;
export const SYSTEM_UNIT_ADD = `/api/admin_plat/system-unit/add`;
export const SYSTEM_UNIT_EDIT = `/api/admin_plat/system-unit/edit`;
export const SYSTEM_UNIT_DEL = `/api/admin_plat/system-unit/del`;

export const SYSTEM_DEPT_LIST = `/api/admin_plat/system-dept/get`;
export const SYSTEM_DEPT_ADD = `/api/admin_plat/system-dept/add`;
export const SYSTEM_DEPT_EDIT = `/api/admin_plat/system-dept/edit`;
export const SYSTEM_DEPT_DEL = `/api/admin_plat/system-dept/del`;
export const SYSTEM_DEPT_DEPT_TREE = `/api/admin_plat/system-dept/get-dept-tree`;
export const SYSTEM_DEPT_PRINCIPAL = `/api/admin_plat/system-dept/get-dept-principal`;

export const SYSTEM_ROLE_LIST = `/api/admin_plat/system-role/get`;
export const SYSTEM_ROLE_ADD = `/api/admin_plat/system-role/add`;
export const SYSTEM_ROLE_EDIT = `/api/admin_plat/system-role/edit`;
export const SYSTEM_ROLE_DEL = `/api/admin_plat/system-role/del`;
export const SYSTEM_ROLE_MENU = `/api/admin_plat/system-role/role-menu`;
export const SYSTEM_ROLE_MENU_IDS = `/api/admin_plat/system-role/role-menu-ids`;
export const SYSTEM_ROLE_MENU_SAVE = `/api/admin_plat/system-role/role-menu-save`;

export const SYSTEM_USER_LIST = `/api/admin_plat/system-user/get`;
export const SYSTEM_USER_ADD = `/api/admin_plat/system-user/add`;
export const SYSTEM_USER_EDIT = `/api/admin_plat/system-user/edit`;
export const SYSTEM_USER_DEL = `/api/admin_plat/system-user/del`;
export const SYSTEM_USER_ROLE_TREE = `/api/admin_plat/system-user/get-role-tree`;


// monitor
export const MONITOR_CRON_GET = `/api/admin_plat/monitor-cron/get`;
export const MONITOR_CRON_ADD = `/api/admin_plat/monitor-cron/add`;
export const MONITOR_CRON_EDIT = `/api/admin_plat/monitor-cron/edit`;
export const MONITOR_CRON_DEL = `/api/admin_plat/monitor-cron/del`;
export const MONITOR_CRON_AVAIBLE = `/api/admin_plat/monitor-cron/get-avaible`;
export const MONITOR_CRON_START = `/api/admin_plat/monitor-cron/start`;
export const MONITOR_CRON_STOP = `/api/admin_plat/monitor-cron/stop`;
export const MONITOR_CRON_CHANGE_STATUS = `/api/admin_plat/monitor-cron/change-status`;
export const MONITOR_CRON_LOG_GET = `/api/admin_plat/monitor-cron-log/get`;
