import editForm from "../form.vue";
import { handleTree } from "@/utils/tree";
import { message } from "@/utils/message";
import { getUnitList, addUnit, editUnit, delUnit } from "@/api/system";
// import { transformI18n } from "@/plugins/i18n";
let transformI18n = (label: string) => label; // 不需要i18n,临时解决i18n报错
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h, toRaw } from "vue";
import type { FormItemProps } from "../utils/types";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { cloneDeep, isAllEmpty, deviceDetection } from "@pureadmin/utils";
import type  { PaginationProps } from "@pureadmin/table";
import { ElMessageBox } from "element-plus";
import { timestampToDatetime } from "@/utils/time";
// import { status } from "nprogress";
// import {useDbModelParamsStoreHook } from "@/store/modules/globalParams";

export function useHook() {
  const form = reactive({
    name: "",
    code: "",
    status: -1
  });

  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);

  
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true,
  });
  
  //状态： 0未审核，1审核通过，2审核不通过，3禁用
  const getStatusMap = {
    "0":{
      text: "未审核",
      color: "#ff9900",
      type : "warning"
    },
    "1":{
      text: "审核通过",
      color: "#67c23a",
      type : "success"
    },
    "2":{
      text: "审核不通过",
      color: "#f56c6c",
      type : "danger"
    },
    "3":{
      text: "禁用",
      color: "#909399",
      type : "info"
    }
  }

  const columns: TableColumnList = [
    {
      label: "组织单位名称",
      prop: "name",
      align: "left",
      cellRenderer: ({ row }) => (
        <>
          <span class="inline-block mr-1">
            {h(useRenderIcon(row.icon), {
              style: { paddingTop: "1px" }
            })}
          </span>
          <span>{transformI18n(row.name)}</span>
        </>
      )
    },
    {
      label: "Logo",
      prop: "icon",
      width: 60,
      cellRenderer: ({ row }) => (
        <>
          <span class="inline-block unit-logo">
            <img src={row.logoLink} alt="LOGO" />
          </span>
        </>
      )
    },
    {
      label: "机构代码",
      prop: "code"
    },
    {
      label: "状态",
      prop: "status",
      width: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={getStatusMap[row.status].type}
          effect="plain"
        >
          {getStatusMap[row.status].text}
        </el-tag>
      )
    },
    {
      label: "法人",
      width: 100,
      prop: "corporation"
    },
    {
      label: "地址",
      prop: "address"
    },
    // {
    //   label: "排序",
    //   prop: "sort",
    //   hide: false,
    // },
    {
      label: "创建时间",
      width: 120,
      prop: "updated_at",
      cellRenderer: ({row}) => (
        <>{timestampToDatetime(row.updated_at)}</>
      )
    },
    {
      label: "操作",
      fixed: "right",
      width: 210,
      slot: "operation"
    }
  ];

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  function resetForm(formEl) {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  }

  async function onSearch() {
    loading.value = true;
    let tmpForm = {...toRaw(form), ...toRaw(pagination)}
    
    const { data } = await getUnitList(tmpForm); // 这里是返回一维数组结构，前端自行处理成树结构，返回格式要求：唯一id加父节点parentId，parentId取父节点id
    let newData =  data && data.list || [];
    // if (!isAllEmpty(form.name)) {
    //   // 前端搜索组织单位名称
    //   newData = newData.filter(item =>
    //     transformI18n(item.title).includes(form.name)
    //   );
    // }
    dataList.value = handleTree(newData, "id", "pid", "children"); // 处理成树结构
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  function formatHigherMenuOptions(treeList) {
    if (!treeList || !treeList.length) return;
    const newTreeList = [];
    for (let i = 0; i < treeList.length; i++) {
      treeList[i].title = transformI18n(treeList[i].title);
      formatHigherMenuOptions(treeList[i].children);
      newTreeList.push(treeList[i]);
    }
    return newTreeList;
  }

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}组织单位`,
      props: {
        formInline: {
          id: row?.id ?? "",
          pid: row?.pid ?? "",
          logo: row?.logo ?? "",
          logoLink: row?.logoLink ?? "",
          name: row?.name ?? "",
          code: row?.code ?? "",
          corporation: row?.corporation ?? "",
          licenseLink: row?.licenseLink ?? "",
          license: row?.license ?? "",
          address: row?.address ?? "",
          status: row?.status ?? 0,
          deleted: row?.deleted ?? 0,
          sort: row?.sort ?? 0,
          createdAt: row?.createdAt ?? 0,
          updatedAt: row?.updatedAt ?? 0,
          deletedAt: row?.deletedAt ?? null,
        },
        unitSelectList:[],
        onUoloadLogoChange: onUoloadLogoChange
      },
      width: "45%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null, unitSelectList: [], onUoloadLogoChange:null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(valid => {
          if (valid) {
            console.log("curData", curData);
            
            curData.sort = Number(curData.sort);
            ElMessageBox({
              title: "提示",
              message: "是否保存数据？",
              type: "warning",
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              showCancelButton: true,
            }).then(async () => { 
              // 表单规则校验通过
              if (title === "新增") {
                // 实际开发先调用新增接口，再进行下面操作
                addUnit(curData).then(res => { 
                  if (res.code === 200) {
                    if(options.props.formInline && delete options.props.formInline.id){
                      options.props.formInline.id = res.data.id;
                    }
                    message(`新增成功`, {
                      type: "success"
                    });
                    chores();
                  } else {
                    message(`新增失败`, {
                      type: "error"
                    });
                  }
                });
              } else {
                // 实际开发先调用修改接口，再进行下面操作
                editUnit(curData).then(res => { 
                  if (res.code === 200) {
                    message(`修改成功`, {
                      type: "success"
                    });
                    chores();
                  } else {
                    message(`修改失败`, {
                      type: "error"
                    });
                  }
                });
              }
            })
            .catch((e) => { 
              console.error(e)
            });
          }
        });
      }
    });
  }

  function handleDelete(row) {
    delUnit({ id: row.id }).then((res) => { 
      if (res.code === 200) { 
        onSearch();
        message(`您删除了组织单位【${transformI18n(row.name)}】`, {
          type: "success"
        });
      }else {
        message(res.message || "删除失败" , { type: "error" });
      }
    });
  }
  function handleSizeChange(val: number) {
    console.log(`${val} items per page`);
  }

  function handleCurrentChange(val: number) {
    console.log(`current page: ${val}`);
  }

  /** form 表单页 开始 */ 
  function onUoloadLogoChange(e){
    console.log(e)
  }
  /** form 表单页 结束 */ 


  onMounted(() => {
    onSearch();
  });

  return {
    form,
    loading,
    pagination,
    columns,
    dataList,
    getStatusMap,
    /** 搜索 */
    onSearch,
    /** 重置 */
    resetForm,
    /** 新增、修改组织单位 */
    openDialog,
    /** 删除组织单位 */
    handleDelete,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange
  };
}
