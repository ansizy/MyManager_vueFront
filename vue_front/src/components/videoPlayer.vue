<template>
  <div class="video-container">
    <video
        ref="videoPlayer"
        controls
        :src="videoSource"
        type="video/mp4; codecs=avc1.42E01E,mp4a.40.2"
        crossorigin="anonymous"
        playsinline
        @loadeddata="handleLoadedData"
    >
      Your browser does not support the video tag.
    </video>
  </div>
</template>

<script>
export default {
  props: {
    username: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    }
  },
  computed: {
    videoSource() {
      return `http://localhost:8080/stream/video/${this.username}/${this.filename}`;
    }
  },
  methods: {
    handleVideoError(event) {
      console.error('Video playback error:', event);
      this.$emit('error', {
        type: 'video_error',
        message: 'Failed to play video'
      });
    },

    handleLoadedData(event) {
      const video = event.target;
      console.log('可用音轨:', video.audioTracks);
      if (video.audioTracks.length === 0) {
        console.error('检测到无音频轨道');
      }
    }
  }
};
</script>

<style scoped>
.video-container {
  position: relative;
  max-width: 1200px;  /* 最大显示宽度 */
  margin: 0 auto;
  /* 16:9比例 */
  padding-bottom: 56.25%;
  height: 0;
}

video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain; /* 保持原始比例 */
  background-color: #000;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .video-container {
    max-width: 100%;
    padding-bottom: 75%; /* 4:3比例 */
  }
}

@media (max-width: 480px) {
  .video-container {
    padding-bottom: 100%; /* 1:1比例 */
  }
}
</style>
