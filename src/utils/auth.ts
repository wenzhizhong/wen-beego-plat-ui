import Cookies from "js-cookie";
import { useUserStoreHook } from "@/store/modules/user";
import { storageLocal, isString, isIncludeAllChildren, storageSession } from "@pureadmin/utils";

export const userKey = "user-info";
export const unitKey = "unit-info";
export const asyncRoutesKey = "async-routes";
export const tokenKey = "authorized-token";
export const dbModelParamKey = "db-model-param";

export interface DataInfo {
  /** token */
  accessToken: string;
  /** `accessToken`的过期时间（时间戳） */
  expires: number;
  /** 用于调用刷新accessToken的接口时所需的token */
  refreshToken: string;
  /** 头像 */
  avatar?: string;
  /** 用户名 */
  username?: string;
  /** 昵称 */
  nickname?: string;
  /** 当前登录用户的角色 */
  roles?: Array<string>;
  /** 当前登录用户的按钮级别权限 */
  permissions?: Array<string>;
  /** 当前组织机构id */
  default_unit_id?: string;
}

/**
 * 通过`multiple-tabs`是否在`cookie`中，判断用户是否已经登录系统，
 * 从而支持多标签页打开已经登录的系统后无需再登录。
 * 浏览器完全关闭后`multiple-tabs`将自动从`cookie`中销毁，
 * 再次打开浏览器需要重新登录系统
 * */
export const multipleTabsKey = "multiple-tabs";

export function getWhiteApiList(){
  return ["/refresh-token", "/login"];
}

/** 获取`token` */
export async function getToken() {
  // token过期刷新
  function doRefreshToken(data) { 
    return new Promise((resolve, reject)  => {
      useUserStoreHook()
        .handRefreshToken({ refreshToken: data.refreshToken, accessToken: data.accessToken })
        .then(res => {
          resolve(res && res?.code == 200 && res.data.userInfo);
        }).catch(err => {
          console.error(err);
          reject(err)
        })
        .finally(() => {
          window['isRefreshing'] = false;
        });
    });
  }

  // 此处与`tokenKey`相同，此写法解决初始化时`Cookies`中不存在`tokenKey`报错
  let cookieData = Cookies.get(tokenKey)
    ? JSON.parse(Cookies.get(tokenKey))
    : null;
  let data = cookieData? cookieData as DataInfo : null;
  
  const whiteList = getWhiteApiList();
  if (data && !whiteList.some(url => window.location.href.endsWith(url))) {
    const now = new Date().getTime();
    const expired = !data.expires ? true : parseInt(data.expires) - now <= 0;
    if (expired && !window['isRefreshing']) {
      window['isRefreshing'] = true;
      
      let newData = await doRefreshToken(data)|| {}
      newData = newData as DataInfo
      return newData
    }
  } 
  return data
}

/**
 * @description 设置`token`以及一些必要信息并采用无感刷新`token`方案
 * 无感刷新：后端返回`accessToken`（访问接口使用的`token`）、`refreshToken`（用于调用刷新`accessToken`的接口时所需的`token`，`refreshToken`的过期时间（比如30天）应大于`accessToken`的过期时间（比如2小时））、`expires`（`accessToken`的过期时间）
 * 将`accessToken`、`expires`、`refreshToken`这三条信息放在key值为authorized-token的cookie里（过期自动销毁）
 * 将`avatar`、`username`、`nickname`、`roles`、`permissions`、`refreshToken`、`expires`这七条信息放在key值为`user-info`的localStorage里（利用`multipleTabsKey`当浏览器完全关闭后自动销毁）
 */
export function setToken(data: DataInfo) {
  let expires = 0;
  const { accessToken, refreshToken } = data;
  const { isRemembered, loginDay } = useUserStoreHook();
  expires = new Date(data.expires).getTime(); // 如果后端直接设置时间戳，将此处代码改为expires = data.expires，然后把上面的DataInfo<Date>改成DataInfo<number>即可
  const cookieString = JSON.stringify({ accessToken, expires, refreshToken });

  // expires > 0
  //   ? Cookies.set(tokenKey, cookieString, {
  //     expires: (expires - Date.now()) / 86400000
  //   })
  //   : Cookies.set(tokenKey, cookieString);
  Cookies.set(tokenKey, cookieString);

  Cookies.set(
    multipleTabsKey,
    "true",
    isRemembered
      ? {
        expires: loginDay
      }
      : {}
  );

  function setUserKey({ avatar, username, nickname, roles, permissions }) {
    useUserStoreHook().SET_AVATAR(avatar);
    useUserStoreHook().SET_USERNAME(username);
    useUserStoreHook().SET_NICKNAME(nickname);
    useUserStoreHook().SET_ROLES(roles);
    useUserStoreHook().SET_PERMS(permissions);
    useUserStoreHook().SET_UNITID(data?.default_unit_id ?? "");
    roles = roles && roles.length > 0 ? roles : [];
    storageSession().setItem(userKey, {
      // refreshToken,
      expires,
      avatar,
      username,
      nickname,
      roles,
      permissions,
      default_unit_id: data?.default_unit_id ?? "",
    });
  }
  if (data.username && data.roles) {
    const { username, roles } = data;
    setUserKey({
      avatar: data?.avatar ?? "",
      username,
      nickname: data?.nickname ?? "",
      roles,
      permissions: data?.permissions ?? []
    });
  } else {
    const avatar = storageSession().getItem<DataInfo>(userKey)?.avatar ?? "";
    const username = storageSession().getItem<DataInfo>(userKey)?.username ?? "";
    const nickname = storageSession().getItem<DataInfo>(userKey)?.nickname ?? "";
    const roles = storageSession().getItem<DataInfo>(userKey)?.roles ?? [];
    const permissions = storageSession().getItem<DataInfo>(userKey)?.permissions ?? [];
    setUserKey({
      avatar,
      username,
      nickname,
      roles,
      permissions
    });
  }
}

/** 删除`token`以及key值为`user-info`的localStorage信息 */
export function removeToken() {
  Cookies.remove(tokenKey);
  Cookies.remove(multipleTabsKey);
  storageSession().removeItem(userKey);
  storageSession().removeItem(unitKey);
  storageSession().removeItem(asyncRoutesKey);
  storageSession().removeItem(dbModelParamKey);
}

/** 格式化token（jwt格式） */
export const formatToken = (token: string): string => {
  return "Bearer " + token;
};

/** 是否有按钮级别的权限（根据登录接口返回的`permissions`字段进行判断）*/
export const hasPerms = (value: string | Array<string>): boolean => {
  if(value == 'admin_plat:system-dept:del'){
    console.log('value', value)
  }
  if (!value) return false;
  const allPerms = "*:*:*";
  const { permissions } = useUserStoreHook();
  if (!permissions) return false;
  if (permissions.length === 1 && permissions[0] === allPerms) return true;
  const isAuths = isString(value)
    ? permissions.includes(value)
    : isIncludeAllChildren(value, permissions);
  return isAuths ? true : false;
};
