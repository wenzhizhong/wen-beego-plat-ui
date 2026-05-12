<template>
  <el-dialog
    v-model="visible"
    title="生成代码"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form :model="form" label-width="110px">
      <el-form-item label="当前选择表：">
        <el-input :model-value="genData?.table_name ?? ''" disabled />
      </el-form-item>

      <el-form-item label="菜单名称：">
        <el-input v-model="form.menuName" placeholder="请输入中文菜单名称" />
      </el-form-item>

      <el-form-item label="应用模块：">
        <el-select v-model="form.appModules" multiple placeholder="请选择应用模块" style="width: 100%">
          <el-option label="admin_plat (平台端)" value="admin_plat" />
          <el-option label="admin_mchnt (商户端)" value="admin_mchnt" />
          <el-option label="api (对外API)" value="api" />
        </el-select>
      </el-form-item>

      <el-form-item label="菜单模块：">
        <el-input v-model="form.menuModule" placeholder="如：system、monitor" />
      </el-form-item>

      <el-form-item label="业务模块：">
        <el-input v-model="form.bizModule" placeholder="如：UserAddress（从表名自动生成，可手动修改）" />
      </el-form-item>

      <el-form-item label="配置ID：">
        <el-input :model-value="form.tableGenerateCodeId" disabled />
      </el-form-item>

      <el-form-item label="代码模块：">
        <el-checkbox-group v-model="form.codeType">
          <el-checkbox
            v-for="item in codeTypeOptions"
            :key="item.value"
            :label="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="视图UI：">
        <el-select v-model="form.viewType" style="width: 100%">
          <el-option
            v-for="item in viewTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item v-if="download.zipPath" label="下载代码：">
        <el-link type="primary" @click="handleDownload">{{ download.zipName }}</el-link>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="runLoading" @click="handleRun">生成代码</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import {
  getGenerateCodeParam,
  getGenerateCodeRun,
  downloadCode
} from "@/api/generate-code";

const props = defineProps<{
  modelValue: boolean;
  genData?: any;
}>();

const emit = defineEmits(["update:modelValue"]);

const visible = ref(false);
const runLoading = ref(false);

const viewTypeOptions = ref<{ label: string; value: string }[]>([]);
const codeTypeOptions = ref<{ label: string; value: string }[]>([]);

const form = reactive({
  menuName: "",
  appModules: ["admin_plat"] as string[],
  menuModule: "system",
  bizModule: "",
  tableGenerateCodeId: "",
  codeType: [] as string[],
  viewType: ""
});

const download = reactive({
  zipPath: "",
  zipName: ""
});

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val;
    if (val) {
      resetForm();
      fetchParams();
      if (props.genData) {
        form.tableGenerateCodeId = props.genData.id ?? "";
        form.bizModule = toPascalCase(props.genData.table_name ?? "");
      }
    }
  },
  { immediate: true }
);

function resetForm() {
  form.menuName = "";
  form.appModules = ["admin_plat"];
  form.menuModule = "system";
  form.bizModule = "";
  form.tableGenerateCodeId = "";
  form.codeType = ["all"];
  form.viewType = "";
  download.zipPath = "";
  download.zipName = "";
  runLoading.value = false;
}

function toPascalCase(snake: string): string {
  return snake
    .split("_")
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

async function fetchParams() {
  try {
    const res = await getGenerateCodeParam({});
    const data = res.data ?? {};
    viewTypeOptions.value = mapToOptions(data.viewTypes ?? {});
    codeTypeOptions.value = mapToOptions(data.generateCodeTypes ?? {});
    form.viewType = viewTypeOptions.value[0]?.value ?? "element-plus";
  } catch (e) {
    console.error(e);
  }
}

function mapToOptions(obj: Record<string, string>) {
  return Object.entries(obj).map(([value, label]) => ({ label, value }));
}

async function handleRun() {
  if (!form.tableGenerateCodeId) {
    message("未获取到配置ID", { type: "warning" });
    return;
  }
  if (!form.codeType.length) {
    message("请选择代码模块", { type: "warning" });
    return;
  }
  if (form.codeType.includes("view") && !form.viewType) {
    message("请选择视图UI", { type: "warning" });
    return;
  }
  try {
    await ElMessageBox.confirm("是否要生成代码？");
  } catch {
    return;
  }
  runLoading.value = true;
  message("正在生成代码...", { type: "success" });
  try {
    const res = await getGenerateCodeRun({
      tableGenerateCodeId: form.tableGenerateCodeId,
      menuName: form.menuName,
      appModules: form.appModules,
      menuModule: form.menuModule,
      bizModule: form.bizModule,
      codeType: form.codeType,
      viewType: form.viewType
    });
    if (res.code === 200) {
      message("代码生成成功！请在弹窗上查收下载链接", { type: "success", duration: 30000 });
      download.zipPath = res.data?.zipPath ?? "";
      download.zipName = res.data?.zipName ?? "";
    } else {
      message(res.message || "生成失败", { type: "error" });
    }
  } catch (e: any) {
    message(e?.message || "生成失败", { type: "error" });
  } finally {
    runLoading.value = false;
  }
}

async function handleDownload() {
  try {
    const response: any = await downloadCode({ zipPath: download.zipPath });
    const url = window.URL.createObjectURL(new Blob([response.data ?? response], { type: "application/zip" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = download.zipName;
    link.click();
    window.URL.revokeObjectURL(url);
    message("正在下载文件: " + download.zipName, { type: "success" });
  } catch (e) {
    console.error(e);
    message("下载失败", { type: "error" });
  }
}

function handleClose() {
  visible.value = false;
  emit("update:modelValue", false);
}
</script>
