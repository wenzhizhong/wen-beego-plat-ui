import { http } from "@/utils/http";
import { GET_MODEL_PARAMS } from "@/api/api.js"


export interface dbModelParamItf {
  unit_status_map : Object
  unit_role_status_map : Object
  unit_user_profile_map : Object
  unit_user_default_map : Object
  unit_gender_map : Object
  unit_card_type_map : Object
  unit_user_source_map : Object
}

export interface dbModelParamResult{
  code: number;
  message: string;
  data: {
    modelParam: dbModelParamItf;
  }
};

export function getdbModelParam (){
  return http.request<dbModelParamResult>("get", GET_MODEL_PARAMS, {});
}