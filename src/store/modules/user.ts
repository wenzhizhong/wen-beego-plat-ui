import { defineStore } from "pinia";
import {
  type userType,
  store,
  router,
  resetRouter,
  routerArrays,
  storageLocal,
  storageSession
} from "../utils";
import {
  type UserResult,
  type RefreshTokenResult,
  getLogin,
  refreshTokenApi
} from "@/api/user";
import { clearAllCookies } from "@/utils/cookie";
import { useMultiTagsStoreHook } from "./multiTags";
import { type DataInfo, setToken, removeToken, userKey } from "@/utils/auth";
import { /*ElMessage,*/ ElMessageBox } from "element-plus";

export const useUserStore = defineStore({
  id: "pure-user",
  state: (): userType => ({
    // 头像
    avatar: storageSession().getItem<DataInfo>(userKey)?.avatar ?? "",
    // 用户名
    username: storageSession().getItem<DataInfo>(userKey)?.username ?? "",
    // 昵称
    nickname: storageSession().getItem<DataInfo>(userKey)?.nickname ?? "",
    // 页面级别权限
    roles: storageSession().getItem<DataInfo>(userKey)?.roles ?? [],
    // 按钮级别权限
    permissions:
      storageSession().getItem<DataInfo>(userKey)?.permissions ?? [],
    // 是否勾选了登录页的免登录
    isRemembered: false,
    // 登录页的免登录存储几天，默认7天
    loginDay: 7,
    // 当前组织机构id
    default_unit_id: storageSession().getItem<DataInfo>(userKey)?.default_unit_id ?? "",
  }),
  actions: {
    /** 存储头像 */
    SET_AVATAR(avatar: string) {
      this.avatar = avatar;
    },
    /** 存储用户名 */
    SET_USERNAME(username: string) {
      this.username = username;
    },
    /** 存储昵称 */
    SET_NICKNAME(nickname: string) {
      this.nickname = nickname;
    },
    /** 存储角色 */
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
      this.setLocalstorage('roles', roles);
    },
    /** 存储按钮级别权限 */
    SET_PERMS(permissions: Array<string>) {
      this.permissions = permissions;
      this.setLocalstorage('permissions', permissions);
    },
    /** 存储是否勾选了登录页的免登录 */
    SET_ISREMEMBERED(bool: boolean) {
      this.isRemembered = bool;
    },
    /** 设置登录页的免登录存储几天 */
    SET_LOGINDAY(value: number) {
      this.loginDay = Number(value);
    },
    /** 存储组织机构id */ 
    SET_UNITID(value: string) {
      this.default_unit_id = value;
      this.setLocalstorage('default_unit_id', value);
    },
    /** 登入 */
    async loginByUsername(data) {
      return new Promise<UserResult>((resolve, reject) => {
        getLogin(data)
          .then(res => {
            if (res?.code == 200) {
              this.logoutAfter();
              setToken(res.data.userInfo);
            }
            resolve(res);
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    /** 前端登出（不调用接口） */
    logOut() {
      ElMessageBox.confirm("<font color='#ff0000' style='font-size:20px'>是否确认退出系统？</font>", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
      })
      .then(() => {
        this.logoutAfter();
      })
    },
    /** 刷新`token` */
    async handRefreshToken(data) {
      return new Promise<UserResult>((resolve, reject) => {
        refreshTokenApi(data)
          .then(res => {
            if (res && res?.code == 200) {
              setToken(res.data.userInfo);
              resolve(res);
            }else{
              let tmpMsg = (res && res.message && res.message+"," || "") +"重新登录？";
              ElMessageBox({
                title: "提示",
                message: tmpMsg,
                type: "warning",
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                showCancelButton: true,
              }).then(() => { 
                try{
                  this.logoutAfter();
                }catch(e){
                  console.error(e);
                }
              })
              // .catch(() => {
              //   // canceled
              // })
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    logoutAfter() {
      this.username = "";
      this.roles = [];
      this.permissions = [];
      removeToken();
      useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
      resetRouter();
      clearAllCookies();
      router.push("/login");
    },
    setLocalstorage(key: string, value: string) {
      let dataInfo = storageSession().getItem<DataInfo>(userKey) || {} as DataInfo;
      dataInfo[key] = value;
      storageSession().setItem<DataInfo>(userKey, dataInfo)
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
