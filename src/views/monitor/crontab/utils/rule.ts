import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  name_en: [{ required: true, message: "名称为必填项", trigger: "blur" }],
  group: [{ required: true, message: "分组为必填项", trigger: "blur" }],
  cron_expr: [{ required: true, message: "表达式为必填项", trigger: "change" }],
});
