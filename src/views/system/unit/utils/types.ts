interface FormItemProps {
  id: string;
  pid: string;
  logo: string;
  logoLink: string;
  name: string;
  code: string;
  corporation: string;
  license: string;
  licenseLink: string;
  address: string;
  status: number;
  deleted: number;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
  sort: number;
}
interface FormProps {
  formInline: FormItemProps;
  unitSelectList : Array<any>;
  onUoloadLogoChange: (e)=>{}
}

export type { FormItemProps, FormProps };
