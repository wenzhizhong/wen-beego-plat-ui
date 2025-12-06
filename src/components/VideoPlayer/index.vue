<script setup lang="ts">
import Player from 'xgplayer'
import { ref, unref, onMounted, watch, onBeforeUnmount, nextTick, defineOptions } from 'vue'
import 'xgplayer/dist/index.min.css'

defineOptions({
  name: 'VideoPlayer'
})

const props = defineProps({
  url: {
    type: String,
    default: '',
    required: true
  },
  poster: {
    type: String,
    default: ''
  },
  close: {
    type: Function,
    default: ()=>{} // 关闭弹窗
  }
})

const vs = ref<HTMLDivElement>()
const videoPlayerRef = ref<Player>()

const intiVideoPlayer = () => {
  if (!unref(vs)) return
  videoPlayerRef.value = new Player({
    autoplay: false,
    ...props,
    el: unref(vs),
  })
}
const close_ = () => {
  console.log('close=========', props.close)
  props.close()
}
onMounted(() => {
  intiVideoPlayer()
})

watch(
  () => props,
  async (newProps) => {
    await nextTick()
    if (newProps) {
      unref(videoPlayerRef)?.setConfig(newProps)
      
    }
  },
  {
    deep: true,
    immediate: true 
  }
)

onBeforeUnmount(() => {
  unref(videoPlayerRef)?.destroy()
})

defineExpose({
  playerExpose: () => unref(videoPlayerRef),
  close_,
})
</script>

<template>
  <Teleport to="body">
    <span class="close" @click="close_">&times;</span>
    <div class="video-player-bg">
      <div ref="vs" class="video-player"></div>
    </div>
  </Teleport>
</template>
<style lang="scss" scoped>
.close {
  width: 50px;
  height: 50px;
  line-height: 50px;
  position: absolute;
  top: 10px;
  right: 10px;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.3);
  z-index: 9999;
  border-radius: 50%;
  text-align: center;
  font-size: 40px;
  transition: all 0.1s ease-in-out;
  user-select: none;
  &:hover {
    color: rgb(255, 96, 96);
    background: rgba(255, 255, 255, 0.5);
  }
}
.video-player-bg {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9997;
  
  display: flex;
  justify-content: center;
  align-items: center;

  .video-player {
    position: relative;
    z-index: 9998;
  }
}
</style>