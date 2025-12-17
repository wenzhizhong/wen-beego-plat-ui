<script setup lang="ts">
import { ref /*defineComponent, ref, watch, computed, unref*/ } from "vue";
import { storeToRefs } from "pinia";
import { ArrowRightBold } from "@element-plus/icons-vue";
import SelectUserUnit from "@/components/unit/SelectUserUnit.vue";
import UnitIcon from "@/assets/svg/UnitIcon.svg?component";

import { useUnitStoreHook } from "@/store/modules/unit";

defineOptions({
  name: "SelectedUnitTag"
});

const { id: unitId, name: unitName, logoLink: unitLogo } = storeToRefs(useUnitStoreHook());
const showSelectUserUnit = ref(false);

function selectUserUnitCallback(unitInfo) {
  
}


</script>
<template>
  <section id="selectedUnitTag" :class="!unitId? 'selected-unit-tag-none': 'selected-unit-tag'">
    <div class="selected-unit-tag-box" @click="showSelectUserUnit=true">
      <div class="change-user-unit change-user-unit-none" v-if="!unitId">
        <span class="change-user-unit-img">
          <UnitIcon class="change-user-unit-icon"/>
        </span>
        <span>选择组织</span>
      </div>
      <div class="change-user-unit" v-else>
        <span class="change-user-unit-img">
          <img :src="unitLogo" alt="logo">
        </span>
        <span class="change-user-unit-name">
          {{ unitName }}
        </span>
        <span class="goto-change-unit">切换 <el-icon><ArrowRightBold /></el-icon> </span>
      </div>
    </div>

    <SelectUserUnit :show="showSelectUserUnit" @closeCallback="showSelectUserUnit=false" @selectUserUnitCallback="selectUserUnitCallback"/>
  </section>
</template>


<style lang="scss" scoped>
  #selectedUnitTag.selected-unit-tag-none{
    color: red;
    background-color: #fff6f6;
  }
  #selectedUnitTag.selected-unit-tag-none:hover{
    background-color: #ffe8e8!important;
    cursor: pointer;
  }
  #selectedUnitTag.selected-unit-tag{
    color: rgb(0, 140, 255);
    background-color: #f6f6ff;
  }
  #selectedUnitTag.selected-unit-tag:hover{
    color: rgb(0, 113, 206);
    background-color: #e7e4fd!important;
    cursor: pointer;
    .goto-change-unit{
      color: #353535!important;
    }
  }
  #selectedUnitTag{
    font-size: 20px;
    // margin-right: auto;
    margin-left: 4px;
    padding: 6px;
    border-radius: 4px;
    transition: all 0.1s ease-in-out;
    .selected-unit-tag-box{
      .change-user-unit{
        display: flex;
        .change-user-unit-img{
          width: 30px;
          height: 30px;
          line-height: 30px;
          border-radius: 4px;
          background-color: #fff;
          display: flex; 
          justify-content: center;
          margin-right: 6px;
          overflow: hidden;
          .change-user-unit-icon{
            width: 22px; 
            height: 22px; 
            margin-top: 4px;
          }
          img{
            width: 100%; 
            height: 100%; 
          }
        }
        .change-user-unit-name{
          box-sizing: border-box;
          min-width: 200px;
          max-width: 360px;
          height: inherit;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--el-color-primary);
        }
        .goto-change-unit{
          font-size: 14px!important;
          color: #7e7e7e;
          margin-left: auto;
          display: flex;
          align-items: center;
        }
      }
    }
  }

  
  @media screen and (max-width: 768px) {
    
  }
  @media screen and (max-width: 576px) { 
  }
  @media screen and (max-width: 480px) {
    
    #selectedUnitTag{
      font-size: 16px;
      .selected-unit-tag-box{
        .change-user-unit{
          .change-user-unit-img{
            width: 26px;
            height: 26px;
            line-height: 26px;
            .change-user-unit-icon{
            }
            img{
            }
          }
          .change-user-unit-name{
            height: 26px;
            line-height: 26px;
            box-sizing: border-box;
            min-width: 100px;
            max-width: 150px;
          }
        }
      }
    }
  }
  @media screen and (max-width: 414px) {
    
  }
</style>