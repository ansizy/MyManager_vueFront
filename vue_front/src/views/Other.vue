<template>

 <div>
   <el-tabs
       v-model="activeName"
       class="demo-tabs"
       @tab-click="handleClick"
   >
     <el-tab-pane label="User" name="first">User</el-tab-pane>
     <el-tab-pane label="Config" name="second">Config</el-tab-pane>
     <el-tab-pane label="Role" name="third">Role</el-tab-pane>
     <el-tab-pane label="Task" name="fourth">Task</el-tab-pane>
   </el-tabs>
 </div>

</template>

<script setup>
import { ref } from 'vue'

const activeName = ref('first')

const handleClick = (tab, event) => {
  console.log(tab, event)
}
</script>
<style>
.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}
</style>
