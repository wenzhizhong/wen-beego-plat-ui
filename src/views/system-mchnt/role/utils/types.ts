// 虽然字段很少 但是抽离出来 后续有扩展字段需求就很方便了

interface FormItemProps {
  /** ID */
  id: string;
  /** 角色名称 */
  role_name: string;
  // 组织单位
  unit_id: string;
  /** 排序 */
  role_sort: number;
  /** 角色状态 */
  status: number;
  /** 备注 */
  remark: string;
  // 角色分类
  role_classify_name: string;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
