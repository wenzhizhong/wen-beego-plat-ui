import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  logo: [{ required: true, message: "组织单位logo为必填项", trigger: "blur" }],
  name: [{ required: true, message: "组织单位名称为必填项", trigger: "blur" }],
  code: [{ required: true, message: "组织机构代码为必填项", trigger: "blur" }],
  license: [{ required: true, message: "营业执照为必填项", trigger: "blur" }],
  address: [{ required: true, message: "组织单位地址必填项", trigger: "blur" }],
  corporation: [{ required: true, message: "法人为必填项", trigger: "blur" }],
});
