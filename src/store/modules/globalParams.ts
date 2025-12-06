import { defineStore } from "pinia";
import {
  store,
  storageLocal,
  storageSession
} from "../utils";
// import { /*ElMessage,*/ ElMessageBox } from "element-plus";

import { dbModelParamItf } from "@/api/dbModelParams";
import { dbModelParamKey } from "@/utils/auth";
import { getdbModelParam } from "@/api/dbModelParams";


export const useDbModelParamsStore = defineStore({
  id: "dbModelParams",
  state: (): dbModelParamItf => ({
    unit_status_map: storageSession().getItem<dbModelParamItf>(dbModelParamKey)?.unit_status_map ?? {},
    unit_role_status_map: storageSession().getItem<dbModelParamItf>(dbModelParamKey)?.unit_role_status_map ?? {},
    unit_user_profile_map: storageSession().getItem<dbModelParamItf>(dbModelParamKey)?.unit_user_profile_map ?? {},
    unit_user_default_map: storageSession().getItem<dbModelParamItf>(dbModelParamKey)?.unit_user_default_map ?? {},
    unit_gender_map: storageSession().getItem<dbModelParamItf>(dbModelParamKey)?.unit_gender_map ?? {},
    unit_card_type_map: storageSession().getItem<dbModelParamItf>(dbModelParamKey)?.unit_card_type_map ?? {},
    unit_user_source_map: storageSession().getItem<dbModelParamItf>(dbModelParamKey)?.unit_user_source_map ?? {},

  }),
  actions: {
    setData(newInfo: dbModelParamItf) {
      let dataInfo = storageSession().getItem<dbModelParamItf>(dbModelParamKey);
      dataInfo = { ...dataInfo, ...newInfo };
      storageSession().setItem(dbModelParamKey, dataInfo)

      this.$patch(dataInfo)
    },
    getData() {
      return storageSession().getItem<dbModelParamItf>(dbModelParamKey);
    },
    refresh(){
      getdbModelParam ().then(res => { 
        if (res.code === 200 && res.data && res.data.modelParam && Object.keys(res.data.modelParam).length > 0) { 
          this.setData(res.data.modelParam)
        }else{
          console.error("获取数据库参数异常", res)
        }
      })
    },
  }
});

export function useDbModelParamsStoreHook() {
  return useDbModelParamsStore(store);
}
