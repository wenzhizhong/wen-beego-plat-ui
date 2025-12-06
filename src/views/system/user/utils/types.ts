interface FormItemProps {
  /** 用于判断是`新增`还是`修改` */
  title:            string;
  
  id:               string;
  unit_id:          string;
  dept_id:          string;
  role_id:          Array<string>;
  is_default:       number;
  default_unit_id:  string;
  user_id:          string;
  phone:            string;
  password:         string;
  name:             string;
  avatar:           string;
  avatarLink:       string;
  card_type:        number;
  card_num:         string;
  card_images:      string;
  gender:           number;
  birth_date:       string | null;
  constellation:    string;
  occupation:       string;
  company:          string;
  emergency_name:   string;
  emergency_tel:    string;
  address:          string;
  email:            string;
  source:           number;
  valid_date_begin: string | null;
  valid_date_end:   string | null;
  graduated_from:   string;
  schooling:        string;
  degree_number:    string;
  professional:     string;
  status:           number;
  remark:           string;

  // 查询使用的字段
  dept_ids: string;
  dept_names: string;
  role_ids: string;
  role_names: string;
}
interface FormProps {
  formInline: FormItemProps;
}

interface RoleFormItemProps {
  name: string;
  /** 角色列表 */
  roleOptions: any[];
  /** 选中的角色列表 */
  ids: Record<number, unknown>[];
}
interface RoleFormProps {
  formInline: RoleFormItemProps;
}

export type { FormItemProps, FormProps, RoleFormItemProps, RoleFormProps };
