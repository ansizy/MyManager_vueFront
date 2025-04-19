<template>
  <div>
    <!--头部开始-->
    <div style="height: 60px; background-color: blue">

    </div>
    <!--头部结束-->
    <div>

    </div>
<!--    下面部分开始-->
    <div style="display: flex">
<!--      左侧导航菜单开始-->
      <div style="width: 200px; border-right: 1px solid #ddd; min-height: calc(100vh - 60px)">
        <el-menu router :default-active="router.currentRoute.value.path" style="border: 0">
          <el-menu-item index="/home/movie">电 影</el-menu-item>
          <el-menu-item index="/home/cartoon">漫 画</el-menu-item>
          <el-menu-item index="/home/socialMedia">社 交 媒 体</el-menu-item>
          <el-menu-item index="/home/other">其 他</el-menu-item>
          <el-menu-item index="/home/setting">设 置</el-menu-item>
        </el-menu>
      </div>
<!--      左侧导航菜单结束-->
<!--      右侧主题区域开始-->
      <div style="flex: 1; width: 0; padding: 10px">
        <RouterView />
      </div>
<!--      右侧主体区域结束-->
    </div>
  </div>
</template>

<script setup>

import router from "@/router/index.js";
</script>

<style>
.el-menu .is-active {
  background-color: #e6ecf7 !important;
}
</style>
