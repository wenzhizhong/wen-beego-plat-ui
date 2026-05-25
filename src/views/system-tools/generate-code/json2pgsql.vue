<template>
  <div class="main">
    <el-card shadow="never">
      <h3 class="title">JSON 转 PostgreSQL 数据表</h3>
      <el-form :model="form" label-width="0">
        <el-form-item>
          <el-input v-model="form.tableName" placeholder="请输入表名（如：plat_user_address）" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.tableNameTxt" placeholder="请输入表中文备注" />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="jsonStr"
            type="textarea"
            :rows="12"
            placeholder="请输入 JSON 数据"
            @change="handleTextareaChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleConvert">转 换</el-button>
          <el-button type="success" @click="copyText">复 制</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="mt-4" v-if="sqlStr">
      <pre class="sql-output">{{ sqlStr }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { message } from "@/utils/message";

defineOptions({ name: "Json2pgsql" });

const form = reactive({
  tableName: "",
  tableNameTxt: "",
  columns: [] as any[],
  primaryKey: "id",
});

const sqlStr = ref("");
const jsonStr = ref("");

const pgDataType: Record<string, string> = {
  int: "int4",
  number: "int4",
  string: "varchar(255)",
  float: "numeric(10,2)",
  array: "jsonb",
  object: "jsonb",
  bool: "bool",
  boolean: "bool",
  datetime: "timestamptz(6)",
  date: "date",
};

function handleConvert() {
  handleTextareaChange();
}

function handleTextareaChange() {
  if (!jsonStr.value) {
    sqlStr.value = "";
    return;
  }
  if (!form.tableName) {
    message("请输入表名", { type: "warning" });
    return;
  }

  let json: any;
  try {
    json = JSON.parse(jsonStr.value);
  } catch {
    message("JSON 格式错误", { type: "error" });
    return;
  }
  if (!json || !Object.keys(json).length) {
    message("JSON 字段不能为空", { type: "error" });
    return;
  }

  const columns: any[] = [];
  let hasIdField = false;

  for (const key of Object.keys(json)) {
    let type = getVarType(json[key]);
    type = isDateType(json[key]) || type;
    type = isNumberType(json[key]) || type;

    let pgType = pgDataType[type];
    if (!pgType) {
      message(`字段 "${key}" 的类型 "${type}" 不支持`, { type: "error" });
      return;
    }

    let notNull = false;
    let defVal: string | null = null;

    if (key === "id") {
      hasIdField = true;
      form.primaryKey = "id";
      pgType = "bpchar(36)";
      notNull = true;
    } else if (["int", "number", "float"].includes(type)) {
      defVal = "0";
    } else if (type === "bool" || type === "boolean") {
      defVal = "false";
    } else if (["string", "array", "object"].includes(type)) {
      defVal = null;
    }

    columns.push({
      columnName: key,
      columnType: pgType,
      notNull,
      defVal,
      comment: snakeToComment(key),
    });
  }

  // auto-add id if not present
  if (!hasIdField) {
    columns.unshift({
      columnName: "id",
      columnType: "bpchar(36)",
      notNull: true,
      defVal: null,
      comment: "ID",
    });
    form.primaryKey = "id";
  }

  form.columns = columns;
  sqlStr.value = buildPgSql();
}

function buildPgSql(): string {
  const tableName = form.tableName;
  const comment = form.tableNameTxt || tableName;

  let sql = `-- DDL for table: ${tableName}\n`;
  sql += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;

  for (let i = 0; i < form.columns.length; i++) {
    const col = form.columns[i];
    let line = `  ${col.columnName} ${col.columnType}`;
    if (col.notNull) line += " NOT NULL";
    if (col.defVal !== null && col.columnType !== "jsonb") {
      line += ` DEFAULT ${col.defVal}`;
    }
    line += i < form.columns.length - 1 ? ",\n" : "\n";
    sql += line;
  }

  sql += `);\n\n`;

  // primary key
  sql += `ALTER TABLE ${tableName} ADD PRIMARY KEY (${form.primaryKey});\n\n`;

  // comments
  if (comment) {
    sql += `COMMENT ON TABLE ${tableName} IS '${comment}';\n`;
  }
  for (const col of form.columns) {
    if (col.comment) {
      sql += `COMMENT ON COLUMN ${tableName}.${col.columnName} IS '${col.comment}';\n`;
    }
  }

  // index on id
  sql += `\nCREATE INDEX IF NOT EXISTS idx_${tableName}_id ON ${tableName} (${form.primaryKey});\n`;

  return sql;
}

function getVarType(val: any): string {
  return Object.prototype.toString.call(val).toLowerCase().replace(/(\[object )|\]/g, "");
}

function isDateType(val: any): string {
  const s = String(val);
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s)) return "datetime";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return "date";
  return "";
}

function isNumberType(val: any): string {
  const t = getVarType(val);
  if (t === "number" && String(val).indexOf(".") !== -1) return "float";
  if (t === "number") return "int";
  if (t === "boolean") return "bool";
  return "";
}

function snakeToComment(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
}

function copyText() {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(sqlStr.value).then(() => {
      message("已复制到剪贴板", { type: "success" });
    }).catch(() => {
      message("复制失败", { type: "error" });
    });
  }
}
</script>

<style scoped>
.main {
  padding: 8px;
}
.title {
  font-size: 18px;
  margin-bottom: 12px;
}
.sql-output {
  white-space: pre-wrap;
  word-break: break-all;
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.6;
  max-height: 600px;
  overflow-y: auto;
}
</style>
