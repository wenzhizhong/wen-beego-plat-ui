<script setup lang="ts">
import { ref } from 'vue'
import { useBoolean } from "../../hooks/useBoolean";
import SearchModal from "./components/SearchModal.vue";
import Search2Line from "~icons/ri/search-2-line";

const { bool: show, toggle } = useBoolean();
const divElement = ref<HTMLDivElement | null>(null)
defineExpose({
  divElement
})

function handleSearch() {
  toggle();
}
</script>

<template>
  <div>
    <div
      ref="divElement"
      class="search-container w-[40px] h-[48px] flex-c cursor-pointer navbar-bg-hover"
      @click="handleSearch"
    >
      <IconifyIconOffline :icon="Search2Line" />
    </div>
    <SearchModal v-model:value="show" />
  </div>
</template>
