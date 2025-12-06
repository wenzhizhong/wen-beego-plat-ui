import { defineStore } from "pinia";
import {
  store,
  storageLocal,
  storageSession
} from "../utils";
// import { /*ElMessage,*/ ElMessageBox } from "element-plus";

import { unitItf } from "@/api/unit";
import { unitKey } from "@/utils/auth";


export const useUnitStore = defineStore({
  id: "pure-unit",
  state: (): unitItf => ({
    // 组织机构id
    id: storageSession().getItem<unitItf>(unitKey)?.id ?? "",
    // 组织机构名称
    name: storageSession().getItem<unitItf>(unitKey)?.name ?? "",
    // 组织机构logo
    logo: storageSession().getItem<unitItf>(unitKey)?.logo ?? "",
    // 组织机构logo
    logoLink: storageSession().getItem<unitItf>(unitKey)?.logoLink ?? "",
    // 组织机构pid
    pid: storageSession().getItem<unitItf>(unitKey)?.pid ?? "",
    // 组织机构code
    code: storageSession().getItem<unitItf>(unitKey)?.code ?? "",
    // 组织机构 Corporation
    corporation: storageSession().getItem<unitItf>(unitKey)?.corporation ?? "",
    // 组织机构 License
    license: storageSession().getItem<unitItf>(unitKey)?.license ?? "",
    // 组织机构 Address
    address: storageSession().getItem<unitItf>(unitKey)?.address ?? "",
    // 状态
    status: storageSession().getItem<unitItf>(unitKey)?.status ?? 0,
    // 删除
    deleted: storageSession().getItem<unitItf>(unitKey)?.deleted ?? 0,
    // 创建时间
    create_time: storageSession().getItem<unitItf>(unitKey)?.create_time ?? "",
    // 更新时间
    update_time: storageSession().getItem<unitItf>(unitKey)?.update_time ?? "",

  }),
  actions: {
    /** 更新组织机构*/ 
    setUnitInfo(newUnitInfo: unitItf) {
      let dataInfo = storageSession().getItem<unitItf>(unitKey);
      dataInfo = { ...dataInfo, ...newUnitInfo };
      storageSession().setItem(unitKey, dataInfo)

      this.$patch(dataInfo)
    },
    /** 获取组织机构*/
    getUnitInfo() {
      return storageSession().getItem<unitItf>(unitKey);
    },
  }
});

export function useUnitStoreHook() {
  return useUnitStore(store);
}
