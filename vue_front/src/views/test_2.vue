<template>
  <div>

    <div style="margin-bottom: 20px">
      <RouterLink to="/test">跳转到test.vue</RouterLink>
    </div>

    <div style="margin-bottom: 20px">
      <el-button type="primary" @click="router.push('/test')">push跳转到新的test</el-button>
      <el-button type="primary" @click="router.replace('/test')">replace跳转到新的test</el-button>
    </div>

    <div style="margin-bottom: 20px">
      <el-button type="primary" @click="">路由传参id=1</el-button>
    </div>

    <div>
      <el-input v-model="data.input" style="width: 240px" placeholder="Please input"  :prefix-icon="Search"/>{{data.input}}
      <el-input :suffix-icon="Calendar" style="width: 240px"/>
    </div>

    <div>
      <el-select
          v-model="data.value"
          placeholder="Select"
          size="large"
          style="width: 240px"
          clearable
      >
        <el-option
            v-for="item in data.options"
            :key="item"
            :label="item"
            :value="item"
        />
      </el-select>
      {{data.value}}
    </div>

    <div style="margin: 20px 0">
      <el-radio-group v-model="data.sex">
        <el-radio value="男">男</el-radio>
        <el-radio label="女">女</el-radio>
      </el-radio-group>

      <el-radio-group v-model="data.tag" size="large" style="margin-left: 100px">
        <el-radio-button label="发布" value="1" />
        <el-radio-button label="点赞" value="2" />
        <el-radio-button label="收藏" value="3" />
      </el-radio-group>

    </div>

    <div style="margin: 20px">
      <el-checkbox-group v-model="data.checkList">
        <el-checkbox v-for="item in data.options" :key="item.id" :value="item.id" />
      </el-checkbox-group>
    </div>

    <div>
      <el-image style="width: 100px; height: 100px" :src="img" />
    </div>
  </div>
</template>

<script setup>
import {reactive, ref} from 'vue'
import {Calendar, Search} from "@element-plus/icons-vue"
import img from '@/assets/logo.svg'
import router from "@/router/index.js";

const data = reactive({
  input: null,
  value: '',
  options: [1, 2, 3],
  sex: '男',
  tag: '2',
  checkList: [],
})
const input = ref('')
</script>
