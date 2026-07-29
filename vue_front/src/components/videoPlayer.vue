<template>
  <div class="video-container">
    <video
        v-if="!loadError"
        controls
        preload="metadata"
        playsinline
        :src="videoSource"
        @play="handlePlay"
        @error="handleError"
    >
      您的浏览器不支持 video 标签
    </video>
    <div v-else class="video-error">视频加载失败</div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { baseURL } from "@/utils/request.js";

const props = defineProps({
  username: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  }
});

const loadError = ref(false);

// #t=0.001 强制浏览器 seek 到首帧作为封面（Safari/Firefox 仅凭 metadata 不渲染画面）
const videoSource = computed(
    () => `${baseURL}/stream/video/${props.username}/${props.filename}#t=0.001`
);

// 列表复用组件实例时（v-for 数据替换），换源需重置错误态
watch(videoSource, () => {
  loadError.value = false;
});

// 同一页面同时只播放一个视频
const handlePlay = (event) => {
  document.querySelectorAll("video").forEach((v) => {
    if (v !== event.target && !v.paused) v.pause();
  });
};

const handleError = () => {
  loadError.value = true;
};
</script>

<style scoped>
.video-container {
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
}

video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain; /* 保持原始比例 */
}

.video-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 14px;
}
</style>
