<template>
  <div>
    <!-- 头部搜索框 -->
    <div class="card">
      <el-input
          style="width: 240px; margin-right: 10px"
          v-model="data.search"
          placeholder="请输入漫画名称"
          prefix-icon="Search"
      >
      </el-input>
      <el-button type="primary" @click="searchCartoon">查 询</el-button>

      <!--      <el-button type="primary">排 序</el-button>-->
      <el-button type="primary" @click="viewLikes">喜欢列表</el-button>
      <!--      排序-->
<!--      <el-select-->
<!--          v-model="data.order"-->
<!--          placeholder="Select"-->
<!--          style="width: 240px; margin-left: 20px"-->
<!--          @change="changeOrder"-->
<!--      >-->
<!--        <el-option-->
<!--            v-for="item in options"-->
<!--            :key="item.value"-->
<!--            :label="item.label"-->
<!--            :value="item.value"-->
<!--        />-->
<!--      </el-select>-->

    </div>

    <!-- 数据展示 -->
    <div class="card">
      <el-row :gutter="20">
        <el-col
            :span="4"
            v-for="(cartoon, index) in data.cartoonPage"
            :key="cartoon.id"
            class="movie-col"
        >
          <!--          展示单个数据-->
          <div class="movie_card" @click="previewCartoon(cartoon.autoId)">
            <el-image
                :src="cartoon.path"
                :alt="cartoon.autoId"
                fit="cover"
                class="movie-image"
                :preview-src-list="data.srcList"
            />

            <div style="margin-top: 10px">
              <!--              标题-->
              <div style="margin-right: 10px; margin-left: 10px; height: 80px">
                <el-text class="mx-1" line-clamp="3" >
                  {{ cartoon.name }}
                </el-text>
              </div>

            </div>

          </div>
        </el-col>
      </el-row>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
            background
            layout="total, sizes, prev, pager, next"
            :total="data.total"
            v-model:page-size="data.pageSize"
            v-model:current-page="data.currentPage"
            :page-sizes="[6, 12, 18, 24]"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import {reactive, computed, ref, onMounted} from "vue";
import request from "@/utils/request.js";
import {ElMessage} from "element-plus";

onMounted(() => {
  loadPage()
  getTotal()
})

const data = reactive({
  search: "",
  currentPage: 1,
  pageSize: 6,
  cartoonPage: [],
  total: 0,
  order: 0,
  srcList: [],
});

const loadPage = () => {
  request.get('/cartoon/page', {
    params: {
      currentPage: data.currentPage,
      pageSize: data.pageSize,
      orderBy: data.order,
    }
  }).then(res => {
    data.cartoonPage = res.data
  })
}

const getTotal = () => {
  request.get('/cartoon/total').then(res => {
    data.total = res.data
  })
}

const searchCartoon = () => {

};

const searchCartoonById = (autoId) => {
  request.get('/cartoon/searchId', {
    params: {
      id: autoId
    }
  }).then(res => {
    data.srcList = res.data
  })
};

const viewLikes = () => {

}

const handleSizeChange = () => {
  loadPage()
}

const handleCurrentChange = () => {
  loadPage()
}
const previewCartoon = (autoId) => {
  console.log("haha")
  searchCartoonById(autoId)
}
</script>
<style scoped>
.card {
  background-color: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.12);
  margin-bottom: 20px;
}
.movie_card {
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.3);
  margin-bottom: 10px;
}

.movie-image {
  width: 100%;
  height: auto;
  aspect-ratio: 378 / 538; /* 等比例缩放 */
  border-radius: 5px;
  object-fit: cover;
}
.movie-fanart {
  width: 100%;
  height: auto;
  aspect-ratio: 800 / 538; /* 等比例缩放 */
  border-radius: 5px;
  object-fit: cover;
}
.movie-col {
  margin-bottom: 10px; /* 为每个卡片设置垂直间距 */
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

.actor-tag {
  margin-right: 10px; /* 设置标签之间的间距 */
  cursor: pointer; /* 使标签看起来可点击 */
}

.actor-tag-genre {
  margin-right: 10px; /* 设置标签之间的间距 */
  margin-top: 5px;
  margin-bottom: 5px;
  cursor: pointer; /* 使标签看起来可点击 */
}
</style>
