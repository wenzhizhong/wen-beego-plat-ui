<template>
  <div class="sqlite-dms main">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="数据源管理" name="datasource">
        <DataSource />
      </el-tab-pane>
      <el-tab-pane label="数据管理" name="data">
        <DataManager />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import DataSource from "./components/dataSource.vue";
import DataManager from "./components/dataManager.vue";

defineOptions({
  name: "SqliteDms"
});

const activeTab = ref("datasource");
</script>

<style scoped>
.sqlite-dms {
  margin: 0;
}
</style>
