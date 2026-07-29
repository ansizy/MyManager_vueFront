<template>
  <div class="page">
    <!-- 头部搜索框 -->
    <div class="card">
      <el-input
          style="width: 240px"
          v-model="data.search"
          placeholder="请输入博主名称"
          prefix-icon="Search"
      ></el-input>
      <el-button type="primary" @click="searchTwitter">查 询</el-button>
<!--      <el-button type="primary" @click="viewLikesTwitter">喜欢的博主</el-button>-->
      <el-button type="primary" @click="viewLikeTweet">喜欢的推文</el-button>

      <el-select
          v-model="data.order"
          placeholder="博主排序"
          style="width: 180px"
          @change="changeOrder"
      >
        <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select>

      <span class="stat-text" style="margin-left: auto">
        博主总数：{{data.twitterPage.length}}
      </span>
    </div>

    <!-- 数据展示 -->
    <div class="content">
      <el-container style="height: 100%">
        <el-aside width="min(600px, 45%)" class="user-aside">
          <el-row :gutter="20" style="margin-right: 0;">
            <el-col
                v-for="(user, index) in data.twitterPage"
                :key="index"
                :span="12"
                style="margin-bottom: 20px; padding-right: 10px;"
            >
              <el-card
                  class="user-card"
                  @click="selectUser(user)"
              >
                <div class="card-content">
                  <el-avatar
                      :size="50"
                      :src="logo"
                      class="avatar"
                  />
                  <div class="user-info">
                    <div class="display-name">{{ user.displayName }}</div>
                    <div class="username">@{{ user.userName }}</div>
                    <div class="tweet-count">推文 {{ user.tweetCount ?? 0 }}</div>
                  </div>
                </div>

                <div class="action-section">
                  <el-button
                      type="primary"
                      @click.stop="updateTweet(user)"
                      class="update-btn"
                      size="medium">
                    更新
                  </el-button>
                </div>

              </el-card>

            </el-col>
          </el-row>
        </el-aside>

        <el-container>
          <el-header height="100px" class="profile-panel">
            <!-- 喜欢列表模式：明确状态标识，不渲染切换组（喜欢数据固定按推文聚合） -->
            <div v-if="data.likeMode" class="profile-header">
              <el-icon color="red" :size="28" style="margin-right: 12px;"><StarFilled /></el-icon>
              <div class="profile-info">
                <h2 style="margin: 0 0 8px 0;">我喜欢的推文</h2>
                <p style="margin: 0; color: #666;">点击左侧任意博主可返回其推文列表</p>
              </div>
            </div>

            <div v-else-if="data.twitterDetail.avatar" class="profile-header">
              <el-avatar
                  :size="50"
                  :src="data.twitterDetail.avatar"
                  style="margin-right: 20px;"
              ></el-avatar>
              <div class="profile-info">
                <h2 style="margin: 0 0 8px 0;">
                  {{ data.twitterDetail.displayName }}
                  <span style="color: #666; font-size: 16px;">@{{ data.twitterDetail.username }}</span>
                </h2>
                <p style="margin: 0; color: #666; max-width: 600px;">
                  {{ data.twitterDetail.description || '暂无简介' }}
                </p>
              </div>

              <!-- 显示格式切换：按推文 / 按图片 / 按视频 -->
              <el-radio-group
                  v-model="data.viewMode"
                  class="view-mode-switch"
                  @change="changeViewMode"
              >
                <el-radio-button value="tweet">按推文</el-radio-button>
                <el-radio-button value="Image">按图片</el-radio-button>
                <el-radio-button value="Video">按视频</el-radio-button>
              </el-radio-group>
            </div>

            <div v-else class="empty-tip">
              请从左侧选择博主查看详情
            </div>
          </el-header>

          <el-main class="tweet-main">
            <div v-if="data.tweetList?.length" ref="scrollContainer" class="tweet-scroll">
              <!-- 按推文模式：推文列表 -->
              <template v-if="data.viewMode === 'tweet'">
                <div v-for="(tweet, index) in data.tweetList" :key="index" class="tweet-item">
                  <el-card shadow="never" style="margin-bottom: 16px; border-radius: 12px;">
                    <div class="tweet-header">
                      <el-avatar
                          :size="40"
                          :src="tweet.avatar || logo"
                          style="margin-right: 12px;"
                      ></el-avatar>
                      <div class="user-meta">
                        <span class="display-name">{{ tweet.displayName }}</span>
                        <span class="username">{{ tweet.userName }}</span>
                        <span class="tweet-date">{{ formatDate(tweet.tweetDate) }}</span>
                      </div>
                    </div>
                    <div class="tweet-content" style="margin: 12px 0;">
                      {{ tweet.tweetContent }}
                    </div>
                    <!-- 一条推文可包含多个媒体，宫格展示 -->
                    <div v-if="tweet.mediaList?.length" class="tweet-media">
                      <div
                          class="media-grid"
                          :class="{ 'single-media': tweet.mediaList.length === 1 }"
                      >
                        <template v-for="(media, mIndex) in tweet.mediaList" :key="mIndex">
                          <el-image
                              v-if="media.mediaType === 'Image'"
                              :src="media.mediaUrl"
                              :preview-src-list="getImageUrls(tweet)"
                              :initial-index="getImageIndex(tweet, media)"
                              fit="cover"
                              class="media-item"
                          />
                          <VideoPlayer
                              v-else-if="media.mediaType === 'Video'"
                              :username="tweet.userName"
                              :filename="media.savedFilename"
                              class="media-item"
                          />
                        </template>
                      </div>
                    </div>
                    <div class="tweet-stats">
                      <span class="stat-item">
                        <el-icon><chat-dot-round /></el-icon>
                        {{ tweet.replyCount || 0 }}
                      </span>
                      <span class="stat-item">
                        <el-icon><Share /></el-icon>
                        {{ tweet.retweetCount || 0 }}
                      </span>
                      <span class="stat-item">
                        <el-icon><Histogram /></el-icon>
                        {{ tweet.favoriteCount || 0 }}
                      </span>
                      <span class="stat-item">
                        <el-button @click="add2like(tweet)" link size="small">
                          <el-icon :color="tweet.isLike ? 'red' : 'gray'"><StarFilled /></el-icon>
                        </el-button>
                      </span>
                    </div>
                  </el-card>
                </div>
              </template>

              <!-- 按图片 / 按视频模式：沿用原有单媒体推文卡片样式 -->
              <template v-else>
                <div v-for="(item, index) in data.tweetList" :key="index" class="tweet-item">
                  <el-card shadow="never" style="margin-bottom: 16px; border-radius: 12px;">
                    <div class="tweet-header">
                      <el-avatar
                          :size="40"
                          :src="item.avatar || logo"
                          style="margin-right: 12px;"
                      ></el-avatar>
                      <div class="user-meta">
                        <span class="display-name">{{ item.displayName }}</span>
                        <span class="username">{{ item.userName }}</span>
                        <span class="tweet-date">{{ formatDate(item.tweetDate) }}</span>
                      </div>
                    </div>
                    <div class="tweet-content" style="margin: 12px 0;">
                      {{ item.tweetContent }}
                    </div>
                    <div v-if="item.mediaType" class="tweet-media">
                      <el-image
                          v-if="item.mediaType === 'Image'"
                          :src="item.mediaUrl"
                          :preview-src-list="wallImageUrls"
                          :initial-index="index"
                          style="max-width: 50%; border-radius: 8px;"
                      />
                      <VideoPlayer
                          v-else-if="item.mediaType === 'Video'"
                          :username="item.userName"
                          :filename="item.savedFilename"
                      />
                    </div>
                    <div class="tweet-stats">
                      <span class="stat-item">
                        <el-icon><chat-dot-round /></el-icon>
                        {{ item.replyCount || 0 }}
                      </span>
                      <span class="stat-item">
                        <el-icon><Share /></el-icon>
                        {{ item.retweetCount || 0 }}
                      </span>
                      <span class="stat-item">
                        <el-icon><Histogram /></el-icon>
                        {{ item.favoriteCount || 0 }}
                      </span>
                      <span class="stat-item">
                        <el-button @click="add2like(item)" link size="small">
                          <el-icon :color="item.isLike ? 'red' : 'gray'"><StarFilled /></el-icon>
                        </el-button>
                      </span>
                    </div>
                  </el-card>
                </div>
              </template>

              <div v-if="data.loading" class="loading-tip">加载中...</div>
              <div v-if="!data.hasMore && data.tweetList.length" class="no-more-tip">没有更多了</div>
              <div ref="loadMoreTrigger" style="height: 10px;"></div>
            </div>
            <div v-else class="empty-tip">
              {{ data.likeMode ? '暂无喜欢的推文' : '该用户暂无内容' }}
            </div>
          </el-main>

        </el-container>
      </el-container>
    </div>
  </div>
</template>

<script setup>
import {reactive, onMounted, ref, onUnmounted, computed} from "vue";
import { ElMessage } from "element-plus";
import request from "@/utils/request.js";
import logo from "@/assets/twitterLogo.png";
import {ChatDotRound, Histogram, Share, StarFilled} from "@element-plus/icons-vue";
import VideoPlayer from "@/components/videoPlayer.vue";

onMounted(() => {
  console.log('Component mounted');
  loadTwitters();
});

onUnmounted(() => {
  observer.value?.disconnect();
  console.log('IntersectionObserver disconnected');
});
const options = [
  {value: '0', label: '按加入时间排序',},
  {value: '1', label: '按推文数量排序',},
]

const data = reactive({
  search: "",
  order: "",
  twitterPage: [],
  twitterDetail: {
    avatar: "",
    username: "",
    displayName: "",
    description: "",
  },
  tweetList: [],
  currentPage: 1,
  pageSize: 20,
  hasMore: true,
  loading: false,
  // 显示格式：tweet 按推文 / Image 按图片 / Video 按视频
  viewMode: "tweet",
  // 是否正在浏览喜欢列表（无限滚动需走喜欢接口）
  likeMode: false,
  // searchList: [],
});

// 媒体墙模式下全部图片地址，用于大图预览左右切换
const wallImageUrls = computed(() => {
  if (data.viewMode !== "Image") return [];
  return data.tweetList.map((item) => item.mediaUrl);
});

// 推文内的图片地址列表，用于宫格预览
const getImageUrls = (tweet) => {
  return tweet.mediaList
      .filter((m) => m.mediaType === 'Image')
      .map((m) => m.mediaUrl);
};

const getImageIndex = (tweet, media) => {
  return getImageUrls(tweet).indexOf(media.mediaUrl);
};

// 切换显示格式，重置分页后重新加载
const changeViewMode = () => {
  if (!data.twitterDetail.username) return;
  data.likeMode = false;
  data.tweetList = [];
  data.currentPage = 1;
  data.hasMore = true;
  data.loading = false;
  selectTweetList({ userName: data.twitterDetail.username });
};

// 博主排序
const changeOrder = () => {
  const list = [...data.twitterPage];
  if (data.order === '0') {
    // 按加入时间倒序
    list.sort((a, b) => new Date(b.joinTime) - new Date(a.joinTime));
  }
  else if (data.order === '1') {
    // 按推文数量倒序（tweetCount 为按 tweet_url 聚合的真实推文数）
    list.sort((a, b) => (b.tweetCount || 0) - (a.tweetCount || 0));
  }
  data.twitterPage = list;
};

const loadMoreTrigger = ref(null);
const scrollContainer = ref(null);
const observer = ref(null);

const loadTwitters = () => {
  console.log('Loading twitter users');
  request.get("/twitter/page/all").then((res) => {
    data.twitterPage = res.data;
    console.log('Twitter users loaded:', res.data);
  }).catch((err) => {
    console.error('Load twitters error:', err);
  });
};

const selectUser = (user) => {
  // console.log('Selecting user:', user);
  data.twitterDetail = {
    avatar: logo,
    username: user.userName,
    displayName: user.displayName,
    description: user.description,
  };
  data.likeMode = false;
  data.tweetList = [];
  data.currentPage = 1;
  data.hasMore = true;
  console.log('Reset pagination: currentPage=', data.currentPage, 'hasMore=', data.hasMore);
  selectTweetList(user);
};

const selectTweetList = (user, append = false) => {
  console.log('selectTweetList called:', { user, append, currentPage: data.currentPage });
  if (data.loading || !data.hasMore) {
    console.log('Request blocked: loading=', data.loading, 'hasMore=', data.hasMore);
    return;
  }
  data.loading = true;
  const isTweetMode = data.viewMode === "tweet";
  request
      .post(isTweetMode ? "/twitter/getTweet" : "/twitter/getMedia", {
        userName: user.userName,
        page: data.currentPage,
        pageSize: data.pageSize,
        mediaType: isTweetMode ? null : data.viewMode,
      })
      .then((res) => {
        console.log('Response received:', res);
        const newTweets = res.data || [];
        if (append) {
          data.tweetList.push(...newTweets);
        } else {
          data.tweetList = newTweets;
        }
        data.hasMore = newTweets.length === data.pageSize;
        data.currentPage += 1;
        data.loading = false;
        console.log('Tweets loaded:', newTweets.length, 'tweetList:', data.tweetList, 'hasMore:', data.hasMore);
        if (!append && newTweets.length > 0) {
          setupIntersectionObserver();
        }
      })
      .catch((err) => {
        data.loading = false;
        console.error('Tweet load error:', err);
        ElMessage.error("加载推文失败");
      });
};

const setupIntersectionObserver = () => {
  console.log('Setting up IntersectionObserver, loadMoreTrigger:', loadMoreTrigger.value);
  if (!loadMoreTrigger.value || !scrollContainer.value) {
    console.warn('loadMoreTrigger is null, retrying after 100ms');
    setTimeout(setupIntersectionObserver, 100);
    return;
  }
  // 避免重复挂载观察器
  observer.value?.disconnect();
  observer.value = new IntersectionObserver(
      (entries) => {
        console.log('Intersection Observer triggered:', {
          isIntersecting: entries[0].isIntersecting,
          hasMore: data.hasMore,
          loading: data.loading,
          currentPage: data.currentPage
        });
        if (entries[0].isIntersecting && data.hasMore && !data.loading) {
          // 喜欢列表与博主推文走不同接口，避免数据混流
          if (data.likeMode) {
            loadLikeTweets(true);
          }
          else {
            selectTweetList(
                { userName: data.twitterDetail.username },
                true
            );
          }
        }
      },
      {
        threshold: 0.1,
        root: scrollContainer.value,
      }
  );
  observer.value.observe(loadMoreTrigger.value);
  console.log('Observer is observing loadMoreTrigger');
};

// 搜索逻辑
const searchTwitter = () => {
  if(data.search === '') {
    loadTwitters();
  }
  else {
    request.get('/twitter/search', {
      params: {
        keyword: data.search,
      }
    }).then(res => {
      data.twitterPage = res.data
    })
  }
};

const viewLikesTwitter = () => {
  // 喜欢列表逻辑
};
const viewLikeTweet = () => {
  // 喜欢列表返回按推文聚合的数据，强制切回推文模式
  data.viewMode = "tweet"
  data.likeMode = true
  data.tweetList = []
  data.currentPage = 1
  data.hasMore = true
  data.loading = false
  loadLikeTweets(false)
};

const loadLikeTweets = (append = false) => {
  if (data.loading || !data.hasMore) {
    return;
  }
  data.loading = true;
  request
      .post("/twitter/like/getTweet", {
        userName: "like",
        page: data.currentPage,
        pageSize: data.pageSize,
      })
      .then((res) => {
        console.log('Response received:', res);
        const newTweets = res.data || [];
        if (append) {
          data.tweetList.push(...newTweets);
        } else {
          data.tweetList = newTweets;
        }
        data.hasMore = newTweets.length === data.pageSize;
        data.currentPage += 1;
        data.loading = false;
        console.log('Tweets loaded:', newTweets.length, 'tweetList:', data.tweetList, 'hasMore:', data.hasMore);
        if (!append && newTweets.length > 0) {
          setupIntersectionObserver();
        }
      })
      .catch((err) => {
        data.loading = false;
        console.error('Tweet load error:', err);
        ElMessage.error("加载推文失败");
      });
};

const add2like = (tweet) => {
  // isLike 统一按 0/1 数字维护，成功回调后才翻转，避免失败时状态错乱
  const liked = !!tweet.isLike;
  const url = liked ? "/twitter/like/remove/tweet" : "/twitter/like/add/tweet";
  request.get(url, {
    params: {
      tweetUrl: tweet.tweetUrl,
    }
  }).then(res => {
    if (res.code === '200') {
      tweet.isLike = liked ? 0 : 1;
      if (liked) {
        ElMessage.info("成功去除喜欢列表!")
        // 喜欢列表模式下，取消喜欢后直接移除该卡片
        if (data.likeMode) {
          const idx = data.tweetList.indexOf(tweet);
          if (idx !== -1) data.tweetList.splice(idx, 1);
        }
      }
      else {
        ElMessage.success("成功加入喜欢列表!")
      }
    }
    else {
      ElMessage.error(res.msg || "操作失败")
    }
  }).catch(() => {
    ElMessage.error(liked ? "取消喜欢失败" : "加入喜欢失败")
  })
}

const updateTweet = (user) => {
  // ElMessage.info(user.userName)
  request.post("/twitter/update", {
    userName: user.userName,
  }).then(res => {
    if(res.code === '200') {
      ElMessage.success("更新成功!" + res.data)
    }
    else {
      ElMessage.error("更新失败!" + res.data)
    }
  })
}

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
</script>

<style scoped>
/* 页面撑满视口（扣除父布局 60px 顶栏与 10px*2 内边距），内部各区自适应 */
.page {
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  min-height: 0;
}

.user-aside {
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  border-right: 1px solid #ebeef5;
}

.profile-panel {
  background: white;
  border-bottom: 1px solid #ebeef5;
  overflow: hidden;
}

.tweet-main {
  padding: 10px 20px 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.tweet-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.loading-tip {
  text-align: center;
  padding: 16px;
  color: #666;
  font-size: 14px;
}

.no-more-tip {
  text-align: center;
  padding: 16px;
  color: #999;
  font-size: 14px;
}

.card {
  background-color: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.12);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.stat-text {
  color: #666;
  font-size: 14px;
  white-space: nowrap;
}
.card-content {
  display: flex;
  align-items: center;
  gap: 15px;
}
/* 收窄时头像不被压缩，文字区可收缩以触发省略号 */
.card-content .avatar {
  flex-shrink: 0;
}
.user-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.display-name {
  font-weight: bold;
  font-size: 16px;
}
/* 长名字单行省略，避免折行导致卡片高度不一致 */
.user-info .display-name,
.user-info .username {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 1.4em; /* 字段为空时也占一行，保持卡片等高 */
}
.username {
  color: #666;
  font-size: 14px;
}
.user-info .tweet-count {
  color: #999;
  font-size: 13px;
  margin-top: 2px;
}
.user-card {
  cursor: pointer;
  transition: 0.3s;
}
.user-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.profile-header {
  display: flex;
  align-items: center;
  height: 100%;
}
.profile-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  min-width: 0;
}
.view-mode-switch {
  margin-left: 20px;
  flex-shrink: 0;
}
.empty-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 16px;
  padding: 24px;
}
.tweet-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
}
.user-meta .display-name {
  font-weight: 600;
  margin-right: 8px;
}
.user-meta .username {
  color: #666;
  margin-right: 8px;
}
.user-meta .tweet-date {
  color: #999;
  font-size: 0.9em;
}
.tweet-stats {
  display: flex;
  gap: 24px;
  color: #666;
  margin-top: 12px;
}
.tweet-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
.tweet-stats .stat-item i {
  font-size: 16px;
}

.action-section {
  width: 100%;
}

.update-btn {
  width: 50%;
  margin-top: 10px;
}

/* 推文内多媒体宫格 */
.media-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  max-width: 70%;
}
.media-grid.single-media {
  grid-template-columns: 1fr;
  max-width: 50%;
}
.media-item {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16 / 10;
}
/* VideoPlayer 默认 16:9，宫格内与图片统一为 16:10
   （与组件内同特异性规则冲突时，靠 3 个 class 的高特异性确保生效） */
.media-grid .media-item.video-container {
  aspect-ratio: 16 / 10;
}
</style>
