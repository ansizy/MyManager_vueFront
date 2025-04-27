<template>
  <div>
    <VideoPlayer
        username="@BJCW777"
        filename="2025-02-02 00-20-vid_1.mp4"
        @error="handleError"
    />
  </div>
</template>

<script setup>
import VideoPlayer from "@/components/videoPlayer.vue";
import {handleError} from "vue";
</script>
