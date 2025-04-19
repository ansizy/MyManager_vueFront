<template>
  <div>
    <!-- 头部搜索框 -->
    <div class="card">
      <el-input
          style="width: 240px; margin-right: 10px"
          v-model="data.search"
          placeholder="请输入博主名称"
          prefix-icon="Search"
      ></el-input>
      <el-button type="primary" @click="searchCartoon">查 询</el-button>
      <el-button type="primary" @click="viewLikes">喜欢列表</el-button>
    </div>

    <el-divider />

    <!-- 数据展示 -->
    <div>
      <el-container>
        <el-aside width="600px" style="height: 70vh; overflow-x: hidden; overflow-y: auto;">
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
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-aside>

        <el-container>
          <el-header style="height: 100px; border-bottom: 1px solid #eee;">
            <div v-if="data.twitterDetail.avatar" class="profile-header">
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
            </div>
            <div v-else class="empty-tip">
              请从左侧选择博主查看详情
            </div>
          </el-header>

          <el-main>
            <div v-if="data.tweetList?.length" style="height: 70vh; overflow-y: auto;">
              <!-- 推文列表 -->
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
                  <div v-if="tweet.mediaType" class="tweet-media">
                    <el-image
                        v-if="tweet.mediaType === 'Image'"
                        :src="tweet.mediaUrl"
                        :preview-src-list="[tweet.mediaUrl]"
                        style="max-width: 50%; border-radius: 8px;"
                    />
                    <video
                        v-else-if="tweet.mediaType === 'video'"
                        :src="tweet.mediaUrl"
                        controls
                        style="max-width: 100%; border-radius: 8px;"
                    ></video>
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
                      <el-icon><StarFilled /></el-icon>
                      {{ tweet.favoriteCount || 0 }}
                    </span>
                  </div>
                </el-card>
              </div>
              <div v-if="data.loading" class="loading-tip">加载中...</div>
              <div v-if="!data.hasMore && data.tweetList.length" class="no-more-tip">没有更多推文了</div>
              <div ref="loadMoreTrigger" style="height: 10px; background: red;"></div>
            </div>
            <div v-else class="empty-tip">
              该用户暂无推文
            </div>
          </el-main>
        </el-container>
      </el-container>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref, onUnmounted } from "vue";
import { ElMessage } from "element-plus";
import request from "@/utils/request.js";
import logo from "@/assets/twitterLogo.png";
import { ChatDotRound, Share, StarFilled } from "@element-plus/icons-vue";

onMounted(() => {
  console.log('Component mounted');
  loadTwitters();
});

onUnmounted(() => {
  observer.value?.disconnect();
  console.log('IntersectionObserver disconnected');
});

const data = reactive({
  search: "",
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
});

const loadMoreTrigger = ref(null);
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
  console.log('Selecting user:', user);
  data.twitterDetail = {
    avatar: logo,
    username: user.userName,
    displayName: user.displayName,
    description: user.description,
  };
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
  request
      .post("/twitter/getTweet", {
        userName: user.userName,
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

const setupIntersectionObserver = () => {
  console.log('Setting up IntersectionObserver, loadMoreTrigger:', loadMoreTrigger.value);
  if (!loadMoreTrigger.value) {
    console.warn('loadMoreTrigger is null, retrying after 100ms');
    setTimeout(setupIntersectionObserver, 100);
    return;
  }
  observer.value = new IntersectionObserver(
      (entries) => {
        console.log('Intersection Observer triggered:', {
          isIntersecting: entries[0].isIntersecting,
          hasMore: data.hasMore,
          loading: data.loading,
          currentPage: data.currentPage
        });
        if (entries[0].isIntersecting && data.hasMore && !data.loading) {
          console.log('Calling selectTweetList for user:', data.twitterDetail.username);
          selectTweetList(
              { userName: data.twitterDetail.username },
              true
          );
        }
      },
      {
        threshold: 0.1,
        root: document.querySelector('.el-main'),
      }
  );
  observer.value.observe(loadMoreTrigger.value);
  console.log('Observer is observing loadMoreTrigger');
};

const searchCartoon = () => {
  // 搜索逻辑
};

const viewLikes = () => {
  // 喜欢列表逻辑
};

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
}
.card-content {
  display: flex;
  align-items: center;
  gap: 15px;
}
.user-info {
  display: flex;
  flex-direction: column;
}
.display-name {
  font-weight: bold;
  font-size: 16px;
}
.username {
  color: #666;
  font-size: 14px;
}
.user-card {
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
}
.empty-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 16px;
}
.user-card {
  cursor: pointer;
  transition: transform 0.2s;
}
.user-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.el-header {
  background: white;
  border-bottom: 1px solid #ebeef5;
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
.empty-tip {
  text-align: center;
  color: #999;
  padding: 24px;
}
</style>
