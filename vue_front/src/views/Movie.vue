<template>
  <div>
    <!-- 头部搜索框 -->
    <div class="card">
      <el-input
          style="width: 240px; margin-right: 10px"
          v-model="data.search"
          placeholder="请输入电影名称"
          prefix-icon="Search"
      >
      </el-input>
      <el-button type="primary" @click="searchMovies">查 询</el-button>

<!--      <el-button type="primary">排 序</el-button>-->
      <el-button type="primary" @click="viewLikes">喜欢列表</el-button>
<!--      排序-->
      <el-select
          v-model="data.order"
          placeholder="Select"
          style="width: 240px; margin-left: 20px"
          @change="changeOrder"
      >
        <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select>

    </div>

    <!-- 数据展示 -->
    <div class="card">
      <el-row :gutter="20">
        <el-col
            :span="4"
            v-for="(movie, index) in data.moviesPage"
            :key="movie.id"
            class="movie-col"
        >
<!--          展示单个数据-->
          <div class="movie_card" @click="showDetail(movie.avId)">
            <el-image
                :src="movie.avPoster"
                :alt="movie.avId"
                fit="cover"
                class="movie-image"
            />

            <div style="margin-top: 10px">
<!--              番号-->
              <div style="margin-bottom: 5px; text-align: center">
                <el-text tag="b">
                  {{ movie.avId }}
              </el-text>
              </div>
<!--              标题-->
              <div style="margin-right: 10px; margin-left: 10px; height: 80px">
                <el-text class="mx-1" line-clamp="3" >
                  {{ movie.avTitle }}
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


<!--  详情展示页面，对话框的形式-->
  <el-dialog v-model="openDetail" width="900" top="0vh">
<!--    按钮-->
    <div>
      <span>
<!--        播放-->
        <el-button :icon="VideoPlay" type="primary" @click="playMovie" circle />
<!--        打开文件夹-->
        <el-button :icon="Folder" type="primary" @click="openFolder" circle/>
<!--        喜欢-->
        <el-button type="primary" @click="add2like" circle>
          <el-icon size="20" :color="data.oneDetail.like === true ? 'blue' : 'white'"><StarFilled /></el-icon>
        </el-button>
      </span>
      <el-divider />
    </div>

<!--    图片-->
    <div>
      <el-image
          :src="data.oneFanart"
          fit="cover"
          class="movie-fanart"
      />
    </div>
<!--    详细数据-->
    <div>
      <el-descriptions :size="'large'" :column="3" border :label-width=65>

        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              标 题
            </div>
          </template>
          {{data.oneDetail.avTitle}}
        </el-descriptions-item>
      </el-descriptions>

      <el-descriptions :size="'large'" :column="3" border :label-width=65>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              情 节
            </div>
          </template>
          {{data.oneDetail.avPlot}}
        </el-descriptions-item>
      </el-descriptions>


      <el-descriptions :size="'large'" :column="3" border>
        <el-descriptions-item label="时 长" :label-width=65>
          {{ data.oneDetail.runTime }}分钟
        </el-descriptions-item>

        <el-descriptions-item label="出版时间" :label-width=120>
          {{data.oneDetail.publishTime}}
        </el-descriptions-item>

        <el-descriptions-item label="加入时间" :label-width=120>
          {{data.oneDetail.joinTime}}
        </el-descriptions-item>
      </el-descriptions>

      <el-descriptions :size="'large'" :column="3" border :label-width=65>
        <el-descriptions-item label="演员">

          <el-tag size="large"
                  v-for="(actor, index) in data.oneActors"
                  :key="index"
                  @click="selectMovieByActor(actor)"
                  class="actor-tag">
            {{ actor }}
          </el-tag>

        </el-descriptions-item>
      </el-descriptions>

      <el-descriptions :size="'large'" :column="3" border :label-width=65>
        <el-descriptions-item label="题材">
          <el-tag size="large"
                  v-for="(genre, index) in data.oneGenres"
                  :key="index"
                  class="actor-tag-genre">
            {{ genre }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <el-descriptions :size="'large'" :column="3" border :label-width=65>
        <el-descriptions-item label="标签">
          <el-tag size="large"
                  v-for="(tag, index) in data.oneTags"
                  :key="index"
                  class="actor-tag-genre">
            {{ tag }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

    </div>

  </el-dialog>

</template>

<script setup>
import {reactive, computed, ref, onMounted} from "vue";
import request from "@/utils/request.js";
import {Folder, Star, StarFilled, VideoPlay} from "@element-plus/icons-vue";
import {ElMessage} from "element-plus";

const openDetail = ref(false)

onMounted(() => {
  loadPage()
  getTotal()
})

const options = [
  {value: '0', label: '按出版时间排序',},
  {value: '1', label: '按加入时间排序',},
]

const data = reactive({
  search: "",
  currentPage: 1,
  pageSize: 6,
  moviesPage: [],
  total: 0,
  oneDetail: null,
  oneFanart: "",
  oneActors: [],
  oneGenres: [],
  oneTags: [],
  order: '1',
  like: 0,
  byActor: 0,
  actorName: '',
});

// 过滤搜索结果
const filteredMovies = computed(() => {
  if (!data.search) {
    return allMovies;
  }
  return allMovies.filter((movie) => movie.title.includes(data.search));
});

// 当前页显示的电影
const currentMovies = computed(() => {
  const start = (data.currentPage - 1) * data.pageSize;
  const end = start + data.pageSize;
  return filteredMovies.value.slice(start, end);
});

// 搜索功能
const searchMovies = () => {
  if(data.search.length === 0) {
    data.pageSize = 6
    data.like = 0
    data.byActor = 0
    loadPage()
    getTotal()

  }
  else {
    request.get('/movie/search', {
      params: {
        search: data.search,
      }
    }).then(res => {
      data.moviesPage = res.data
      data.total = data.moviesPage.length
      data.pageSize = data.total
    })
  }

  // data.currentPage = 1; // 搜索后重置到第一页
};

const getTotal = () => {
  request.get('/movie/total').then(res => {
    // console.log("total")
    // console.log(res)
    data.total = res.data
  })
};

const getLikeTotal = () => {
  request.get('/movie/total/like').then(res => {
    // console.log("total")
    // console.log(res)
    data.total = res.data
  })
}

const getTotalByActor = (actor) => {
  request.get('/movie/total/actor', {
    params: {
      name: actor,
    }
  }).then(res => {
    data.total = res.data
  })
}

// 分页查询
const loadPage = () => {
  request.get('/movie/page', {
    params: {
      currentPage: data.currentPage,
      pageSize: data.pageSize,
      orderBy: data.order,
    }
  }).then(res => {
    // console.log("分页数据")
    // console.log(res.data)
    data.moviesPage = res.data
  })
}

// 加载喜欢列表
const loadLikeMovies = () => {
  request.get('/movie/page/like', {
    params: {
      currentPage: data.currentPage,
      pageSize: data.pageSize,
    }
  }).then(res => {
    data.moviesPage = res.data
  })
}

// 加载根据演员分类列表
const loadPageByActor = (actor) => {
  request.get('/movie/page/actor', {
    params: {
      currentPage: data.currentPage,
      pageSize: data.pageSize,
      name: actor,
      orderBy: data.order,
    }
  }).then(res => {
    data.moviesPage = res.data
  })
}

const handleSizeChange = () => {
  if(data.like === 1){
    loadLikeMovies()
  }
  else if(data.byActor === 1) {
    loadPageByActor(data.actorName)
  }
  else {
    loadPage()
  }
}

const handleCurrentChange = () => {
  if(data.like === 1){
    loadLikeMovies()
  }
  else if(data.byActor === 1) {
    loadPageByActor(data.actorName)
  }
  else {
    loadPage()
  }
}

const showDetail = (avId) => {
  // console.log(avId)
  request.get('movie/getbyfanhao', {
    params: {
      fanhao: avId
    }
  }).then(res => {
    data.oneDetail = res.data
    // console.log(res.data)

    data.oneDetail.publishTime = new Date(data.oneDetail.publishTime)
    data.oneDetail.publishTime = data.oneDetail.publishTime.toLocaleDateString('zh-CN')

    data.oneDetail.joinTime = new Date(data.oneDetail.joinTime)
    data.oneDetail.joinTime = data.oneDetail.joinTime.toLocaleDateString('zh-CN')

    openDetail.value = true
  })

  // 获取fanart
  request.get('movie/getFanartByFanhao', {
    params: {
      fanhao: avId
    }
  }).then(res => {
    data.oneFanart = res.data
  })

  // 获取演员
  request.get('movie/getActorsByFanhao', {
    params: {
      fanhao: avId
    }
  }).then(res => {
    data.oneActors = res.data
    console.log(data.oneActors)
  })
  // 获取题材
  request.get('movie/getGenreByFanhao', {
    params: {
      fanhao: avId
    }
  }).then(res => {
    data.oneGenres = res.data
    console.log(data.oneGenres)
  })
  // 获取标签
  request.get('movie/getTagByFanhao', {
    params: {
      fanhao: avId
    }
  }).then(res => {
    data.oneTags = res.data
    console.log(data.oneTags)
  })
}

const selectMovieByActor = (actor) => {
  data.actorName = actor
  getTotalByActor(actor)
  loadPageByActor(actor)
  data.byActor = 1
  openDetail.value = false
}

// 排序 默认按加入时间排序
const changeOrder = () => {
  if(data.order === '0') {
    // console.log("按出版时间")
    data.order = '0'

  }
  else if(data.order === '1') {
    // console.log("加入时间")
    data.order = '1'
  }
  if(data.byActor === 1)
  {
    loadPageByActor(data.actorName)
  }
  else if(data.like === 1)
  {
    loadLikeMovies()
  }
  else {
    loadPage()
  }

}

const viewLikes = () => {
  loadLikeMovies()
  getLikeTotal()
  data.like = 1
}

const add2like = () => {
  if(data.oneDetail.like === true) {
    request.get('/movie/removeLike', {
      params: {
        fanhao: data.oneDetail.avId,
      }
    }).then(res => {
      if(res.code === '200') {
        ElMessage.info("成功移除喜欢列表")
        data.oneDetail.like = false
      }
      else {
        ElMessage.error(res.msg)
      }
    })
  }
  else{
    request.get('/movie/addLike', {
      params: {
        fanhao: data.oneDetail.avId,
      }
    }).then(res => {
      if(res.code === '200') {
        ElMessage.success("成功加入喜欢列表")
        data.oneDetail.like = true
      }
      else {
        ElMessage.error(res.msg)
      }
    })
  }
}

// 播放电影
const playMovie = () => {
  openDetail.value = false
  request.post('/movie/playMovie', {
    avLocal: data.oneDetail.avLocal,
  }).then(res => {
    if(res.code === '200') {
      ElMessage.success("成功加入播放列表")
    }
    else {
      ElMessage.error(res.msg)
    }
  })
}
// 打开文件夹
const openFolder = () => {
  request.post('/movie/openFolder', {
    avLocal: data.oneDetail.avLocal,
  }).then(res => {
    if(res.code === '200') {
      ElMessage.success("成功打开文件夹")
    }
    else {
      ElMessage.error(res.msg)
    }
  })
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
