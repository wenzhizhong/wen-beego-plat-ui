import { reactive } from "vue";
import type { FormRules } from "element-plus";
import { isPhone, isEmail } from "@pureadmin/utils";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  unit_id: [{ required: true, message: "组织单位为必填项", trigger: "blur" }],
  dept_id: [{ required: true, message: "归属部门为必填项", trigger: "blur" }],
  role_id: [{ required: true, message: "用户角色为必填项", trigger: "blur" }],
  name:    [{ required: true, message: "用户名称为必填项", trigger: "blur" }],
  password: [{ required: true, message: "用户密码为必填项", trigger: "blur" }],
  phone: [
    { required: true, message: "手机号为必填项", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback();
        } else if (!isPhone(value)) {
          callback(new Error("请输入正确的手机号码格式"));
        } else {
          callback();
        }
      },
      trigger: "blur"
      // trigger: "click" // 如果想在点击确定按钮时触发这个校验，trigger 设置成 click 即可
    }
  ],
  email: [
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback();
        } else if (!isEmail(value)) {
          callback(new Error("请输入正确的邮箱格式"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
});
