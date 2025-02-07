<template>
  <div>
    hello world
    哈哈哈
  </div>
  <div>
    <el-button>Default</el-button>
    <el-button type="primary" @click="click_test">Primary</el-button>
  </div>

  <div>
    <el-icon :size="20">
      <Edit />
    </el-icon>

    <span style="margin-left: 30px">
      <el-icon :size="20" style="top: 4px"><View /></el-icon>100
    </span>
  </div>
</template>

<script setup>
import {View} from "@element-plus/icons-vue";

const click_test = () => {
  alert("按钮绑定事件!")
}
</script>
