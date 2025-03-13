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
            <div v-if="data.tweetList?.length" style="height: 70vh;">
              <!-- 推文列表 -->
              <div v-for="(tweet, index) in data.tweetList" :key="index" class="tweet-item">
                <el-card shadow="never" style="margin-bottom: 16px; border-radius: 12px;">
                  <!-- 用户信息 -->
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

                  <!-- 推文内容 -->
                  <div class="tweet-content" style="margin: 12px 0;">
                    {{ tweet.tweetContent }}
                  </div>

                  <!-- 媒体内容 -->
                  <div v-if="tweet.mediaType" class="tweet-media">
                    <img
                        v-if="tweet.mediaType === 'image'"
                        :src="tweet.mediaUrl"
                        style="max-width: 100%; border-radius: 8px;"
                    >
                    <video
                        v-else-if="tweet.mediaType === 'video'"
                        :src="tweet.mediaUrl"
                        controls
                        style="max-width: 100%; border-radius: 8px;"
                    ></video>
                  </div>

                  <!-- 互动数据 -->
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

              <!-- 空状态提示 -->
              <div v-if="!data.tweetList?.length" class="empty-tip">
                该用户暂无推文
              </div>
            </div>
          </el-main>

        </el-container>
      </el-container>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import request from "@/utils/request.js";
import logo from "@/assets/twitterLogo.png"
import {ChatDotRound, ChatLineRound, Share, StarFilled} from "@element-plus/icons-vue";

onMounted(() => {
  loadTwitters()
})

const data = reactive({
  search: "",
  twitterPage: [],
  twitterDetail: {
    avatar: "",
    username: "",
    displayName: "",
    description: ""
  },
  tweetList: [],
});

const loadTwitters = () => {
  request.get('/twitter/page/all').then(res => {
    data.twitterPage = res.data
  })
}

const selectUser = (user) => {
  data.twitterDetail = {
    avatar: logo,
    username: user.userName,
    displayName: user.displayName,
    description: user.description
  };
  selectTweetList(user)
};

const selectTweetList = (user) => {
  request.post('/twitter/getTweet', {
    userName: user.userName,
  }).then(res => {
    data.tweetList = res.data
    console.log(res.data)
  })
}

const searchCartoon = () => {
  // 搜索逻辑
};

const viewLikes = () => {
  // 喜欢列表逻辑
};

const formatDate = (dateString) => {
  if (!dateString) return ''; // 如果日期字符串为空，返回空字符串

  const date = new Date(dateString); // 将日期字符串转换为 Date 对象

  // 格式化年月日时分秒
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份补零
  const day = date.getDate().toString().padStart(2, '0'); // 日期补零
  const hours = date.getHours().toString().padStart(2, '0'); // 小时补零
  const minutes = date.getMinutes().toString().padStart(2, '0'); // 分钟补零
  const seconds = date.getSeconds().toString().padStart(2, '0'); // 秒数补零

  // 返回格式化后的日期时间字符串
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
</script>

<style scoped>
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

/* 用户信息区域 */
.tweet-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.4;

  .display-name {
    font-weight: 600;
    margin-right: 8px;
  }

  .username {
    color: #666;
    margin-right: 8px;
  }

  .tweet-date {
    color: #999;
    font-size: 0.9em;
  }
}

/* 互动数据 */
.tweet-stats {
  display: flex;
  gap: 24px;
  color: #666;
  margin-top: 12px;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 4px;

    i {
      font-size: 16px;
    }
  }
}

.empty-tip {
  text-align: center;
  color: #999;
  padding: 24px;
}
</style>
