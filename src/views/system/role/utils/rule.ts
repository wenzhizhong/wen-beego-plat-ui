import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  unit_id: [{ required: true, message: "请选择组织单位", trigger: "change" }],
  role_name: [{ required: true, message: "角色名称为必填项", trigger: "blur" }],
  role_classify_name: [{ required: true, message: "角色分类为必填项", trigger: "blur" }]
});
