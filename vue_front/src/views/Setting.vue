<template>
  <div>
    <el-card>
      <span style="margin-right: 10px">potplayer文件地址:</span>
      <el-input
          style="width: 240px"
          v-model="data.potplayer"
          placeholder="请输入potplayer地址"
      />
      <el-button style="margin-left: 10px; margin-right: 20px" type="primary" @click="addPotplayerPath">确 定</el-button>

<!--      <el-button style="margin-left: 20px" type="info" @click="dialogVisible = true">新增地址</el-button>-->
      <el-input
          v-model="data.newPath"
          style="max-width: 600px"
          placeholder="请输入地址"
          class="input-with-select"
      >
        <template #prepend>
          <el-select v-model="select" placeholder="Select" style="width: 115px">
            <el-option label="电影" value="电影" />
            <el-option label="漫画" value="漫画" />
            <el-option label="推特" value="推特" />
            <el-option label="其他" value="其他" />
          </el-select>
        </template>
        <template #append>
          <el-button :icon="FolderAdd" @click="addNewPath"/>
        </template>
      </el-input>

    </el-card>
  </div>

  <div>
    <el-table stripe border :data="data.allPath">
      <el-table-column
          prop="type"
          label="标 签"
          width="150"
          :filters="[
            { text: '电影', value: '电影' },
            { text: '漫画', value: '漫画' },
            { text: '推特', value: '推特' },
            { text: '其他', value: '其他' },
          ]"
          :filter-method="filterType"
          filter-placement="bottom-end"
      >
        <template #default="scope">
          <el-tag
              :type="scope.row.type === '电影' ? 'primary' : 'success'"
              disable-transitions
          >{{ scope.row.type }}</el-tag
          >
        </template>
      </el-table-column>

      <el-table-column prop="path" label="磁盘地址" />

      <el-table-column label="操 作">
        <template #default="scope">
          <el-button type="primary" @click="handleUpdate(scope.$index, scope.row)">
            更新
          </el-button>
          <el-button
              type="danger"
              @click="handleDelete(scope.$index, scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>

    </el-table>
  </div>

<!--  新增对话框-->
  <el-dialog v-model="dialogVisible" title="新增地址">
    <span>文件夹: </span>
    <el-input
        v-model="input1"
        style="width: 240px"
        placeholder="Pick a date"
    />
  </el-dialog>
</template>

<script setup>
import {onMounted, reactive, ref} from "vue";
import request from "@/utils/request.js";
import {FolderAdd} from "@element-plus/icons-vue";
import {ElMessage} from "element-plus";

onMounted(() => {
  load()
})
const data = reactive({
  potplayer: "",
  allPath: [],
  newPath: "",
});
const dialogVisible = ref(false)
const select = ref('')

const filterType = (value, row) => {
  return row.type === value
}

const load = () => {
  request.get('/setting/getAllPath').then(res => {
    data.allPath = res.data
    console.log(data.allPath)
  })
}

const handleUpdate = (index, row) => {
  console.log(index, row)
  request.post('/setting/update', {
    path: row.path,
    type: row.type,
  }).then(res => {
    if(res.code !== '200') {
      ElMessage.error('错误: ' + res.msg)
    }
    else {
      ElMessage.success('更新成功'+ res.data + '部影片')
    }
  })
}
const handleDelete = (index, row) => {
  console.log(index, row)
  request.post('/setting/delete', {
    path: row.path,
    type: row.type,
  }).then(res => {
    if(res.code !== '200') {
      ElMessage.error('错误: ' + res.msg)
    }
    else {
      ElMessage.success('删除成功')
      load()
    }
  })
}

const addNewPath = () => {
  let path = data.newPath
  let type = select.value
  if(path.length === 0){
    ElMessage.error('地址不可为空')
  }
  else if(type.length === 0){
    ElMessage.error('请选择地址类型')
  }
  else{
    request.post('/setting/add', {
      path: path,
      type: type
    }).then(res => {
      console.log(res)
      if(res.code !== '200'){
        ElMessage.error('错误: ' + res.msg)
      }
      else{
        ElMessage.success('添加成功')
        load()
      }
    })
  }

}

const addPotplayerPath = () => {
  request.post('/setting/potplayer/add', {
    path: data.potplayer,
    type: 'potplayer',
  }).then(res => {
    if(res.code !== '200') {
      ElMessage.error('错误: ' + res.msg)
    }
    else {
      ElMessage.success('设置成功')
      load()
    }
  })
}

</script>
