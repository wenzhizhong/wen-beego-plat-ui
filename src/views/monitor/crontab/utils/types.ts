// 虽然字段很少 但是抽离出来 后续有扩展字段需求就很方便了

interface FormItemProps {
  /** ID */
  id: string;
  // 组织单位
  unit_id?: string;
  /** 定时任务名称 */
  name: string;
  /** 定时任务名称_英文 */
  name_en: string;
  /** 定时任务分组 */
  group: string;
  /** 定时任务表达式 */
  cron_expr: string;
  /** 定时任务状态 */
  status: number;
  /** 备注 */
  remark: string;

  // created_by?: string;
  // created_by_user?: string;
  // created_at?: string;
  updated_by?: string;
  updated_by_user?: string;
  updated_at?: string; 
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
