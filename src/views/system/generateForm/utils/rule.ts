import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  t_input: [{ required: true, message: "输入框为必填项", trigger: "blur" }],
  t_textarea: [{ required: true, message: "文本为必填项", trigger: "blur" }],
  t_select: [{ required: true, message: "下拉选择为必填项", trigger: "blur" }],
  t_radio: [{ required: true, message: "单选框为必填项", trigger: "blur" }],
  t_checkbox: [{ required: true, message: "多选为必填项", trigger: "blur" }],
  t_datetime: [{ required: true, message: "时间为必填项", trigger: "blur" }],
  t_file: [{ required: true, message: "文件为必填项", trigger: "blur" }],
  t_files: [{ required: true, message: "多文件为必填项", trigger: "blur" }],
  unit_id: [{ required: true, message: "组织单位id为必填项", trigger: "blur" }],

});
