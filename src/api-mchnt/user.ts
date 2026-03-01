import { http } from "@/utils/http";
import { LOGIN, CHANGE_UNIT, REFRESH_TOEKN, GET_CAPTCHA } from "@/api/api.js"
import { unitItf } from "@/api/unit";

export type UserResult = {
  code: number;
  message: string;
  data: {
    /** 菜单 */
    userInfo: {
      id: string
      avatar: string;
      name: string;
      nickname: string;
      phone: string;
      role_type: number;
      default_unit_id: string;
      roles: Array<string>;
      /** 用户名 */
      username: string;
      /** 按钮级别权限 */
      permissions: Array<string>;
      /** `token` */
      accessToken: string;
      /** 用于调用刷新`accessToken`的接口时所需的`token` */
      refreshToken: string;
      /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
      expires: number;
    };
    unitInfo: unitItf;
  };
};

export type RefreshTokenResult = {
  code: number;
  message: string;
  data: {
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};


export type CatpchaResult = {
  code: number;
  message: string;
  data: {
    /** 验证码图片 */
    b64s: string;
    /** 验证码的key */
    id: string;
  };
};

/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<UserResult>("post", LOGIN, { data });
};

/** 切换组织 */
export const changeUnit = async (data?: object) => {
  return await http.request<UserResult>("post", CHANGE_UNIT, { data });
};

/** 刷新`token` */
export const refreshTokenApi = (data?: object) => {
  const headers = { "Authorization": null };
  return http.request<UserResult>("post", REFRESH_TOEKN, { data }, { headers });
};
/** 获取验证码 */ 
export const getCatpcha = async () => {
  return await http.request<CatpchaResult>("get", GET_CAPTCHA, {});
};