interface FormItemProps {
  t_input: string;
  t_textarea: string;
  t_select: string;
  t_switch: number;
  t_radio: string;
  t_checkbox: string;
  t_datetime: string;
  t_file: string;
  t_files: string;
  t_editor: string;
  unit_id: string;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
