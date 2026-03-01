interface FormItemProps {
  id: string;
  pid: string;
  unit_id: string;
  name: string;
  principal_id: string;
  principal: string;
  sort: number;
  status: number;
  remark: string;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
