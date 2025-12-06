<script setup lang="ts">
import { defineComponent, ref, watch, computed, unref, shallowRef, reactive } from "vue";
import { storeToRefs } from "pinia";
import { storageLocal, storageSession } from "@pureadmin/utils";
import { initRouter } from "@/router/utils";
import { useUserStoreHook } from "@/store/modules/user";
import { useUnitStoreHook } from "@/store/modules/unit";
import { usePermissionStoreHook } from "@/store/modules/permission";
import {useDbModelParamsStoreHook } from "@/store/modules/globalParams";
import { getUserUnit } from "@/api/unit";
import { changeUnit } from "@/api/user";
import { ArrowRightBold, CircleCheckFilled } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { setToken, getToken, asyncRoutesKey, DataInfo } from "@/utils/auth";

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
});

const state = reactive({ 
  loading: false,
  curUnitId: "",
})
const unitList = shallowRef([]);
const show_ = ref(false);
const { id: unitId, name: unitName, logo: unitLogo } = storeToRefs(useUnitStoreHook());

const emit = defineEmits<{
  (e: 'closeCallback', data: null): void
  (e: 'selectUserUnitCallback', data: null): void
}>();

defineOptions({
  name: "SelectUserUnit",
  isLoad:"isLoad"
});

watch(() => props.show, (val) => {
  show_.value = val;
  if (val) {
    // 获取组织列表
    getUserUnit_();
  }
});
watch(() => state.curUnitId, async (val) => {
});


/** 获取组织列表 */
function getUserUnit_() { 
  state.loading = true;
  getUserUnit({data:{}}).then((res) => {
    unitList.value = res && res.data && res.data.list || [];
    state.loading = false;
  });
}
/**
 * 关闭
 */
function close() { 
  show_.value = false;
  emit("closeCallback", null);
}
/**
 * 选中组织
 * @param itemUnit 选中的组织
 */
function handelSelectUserUnit(itemUnit) {
  ElMessageBox({
    title: "提示",
    message: "确定要切换组织吗？",
    type: "warning",
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    showCancelButton: true,
  }).then(async () => { 
    let messageObj = null;
    try{
      messageObj =  ElMessage({
        message: "正在切换组织...",
        type: "primary",
        duration: 10000,
      })
      // 请求切换组织接口
      state.curUnitId = itemUnit.id;
      const changeUnitRes = await requestChangeUnit();
      if(changeUnitRes && changeUnitRes.code !== 200){
        ElMessage.error(changeUnitRes.message)
        return ;
      }
      // 更新用户store
      setToken(changeUnitRes.data.userInfo);
      // 更新用户store
      useUserStoreHook().SET_UNITID(itemUnit.id);
      useUserStoreHook().SET_ROLES(changeUnitRes.data && changeUnitRes.data.userInfo && changeUnitRes.data.userInfo.roles || []);
      useUserStoreHook().SET_PERMS(changeUnitRes.data && changeUnitRes.data.userInfo && changeUnitRes.data.userInfo.permissions || []);

      // 刷新路由
      storageSession().removeItem(asyncRoutesKey);
      usePermissionStoreHook().clearAllCachePage();
      // 刷新后台参数
      useDbModelParamsStoreHook().refresh()

      initRouter();
      
      // 更新组织store
      useUnitStoreHook().setUnitInfo(itemUnit);

      // 组件回调
      emit("selectUserUnitCallback", itemUnit);
      close();
    }catch(e){
      console.error(e);
    }finally{ 
      if(messageObj) 
        messageObj.close()
    }
  }).catch(() => {
    // canceled
  });

}

/**
 * 切换组织
 */
async function requestChangeUnit(){
  let tmpData = await getToken();
  let userInfo = tmpData && tmpData as DataInfo || {} as DataInfo;
  return await changeUnit({id:state.curUnitId, refreshToken: userInfo.refreshToken, accessToken: userInfo.accessToken}).then((res)=>{
    return res;
  })
}

</script>
<template>
  <el-dialog
    v-model="show_"
    title="切换组织"
    :close-on-click-modal="false"
    :width="'500px'"
    @close="close"
    append-to-body
  >
    <div v-if="state.loading">
      <el-icon><i class="el-icon-loading"></i></el-icon> 
      加载中......
    </div>
    <div v-else-if="unitList.length==0">
      <el-empty description="暂无组织可选" />
    </div>
    <ul id="unit-list" v-else>
      <li v-for="(item, index) in unitList" :key="index" @click="handelSelectUserUnit(item)" :class="item.id === unitId? 'selected-unit': ''">
        <div class="unit-item">
          <img class="unit-item-logo" :src="item.logoLink" />
          <div class="unit-item-name">{{ item.name }}</div>
          <el-icon :class="item.id === unitId ? 'selected-unit-icon' : ''">
            <CircleCheckFilled v-if="item.id === unitId" />
            <ArrowRightBold v-else />
          </el-icon>
        </div>
      </li>
    </ul>
    <br/><br/><br/>
  </el-dialog>
</template>

<style lang="scss" scoped>
  #unit-list{
    li:hover{
      cursor: pointer;
      color: #0077f2;
      border-bottom: solid 1px #0077f2;
      background-color: rgba(0, 119, 242, 0.2)!important;
    }
    li.selected-unit{
      background-color: rgba(0, 121, 242, 0.1);
    }
    li{
      padding: 6px ;
      box-sizing: border-box;
      transition: all .2s ease;
      border-bottom: solid 1px transparent;
      .unit-item{
        display: flex;
        height: 40px;
        line-height: 40px;
        .unit-item-logo{
          width: 40px;
          height: 40px;
          border-radius: 6px;
        }
        .unit-item-name{
          flex: 1;
          font-size: 18px;
          margin-left: 10px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .el-icon{
          height: inherit;
          font-size: 20px;
        }
        .el-icon.selected-unit-icon{
          color: #5a935a;
        }
      }
    }
  }

</style>