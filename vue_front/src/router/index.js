import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',  redirect: '/home'},
    {
      path: '/home',
      name: 'home',
      meta: {title : '主页'},
      component: () => import('../views/Home.vue'),
      children: [
        { path: 'movie', name: 'movie', component: () => import('../views/Movie.vue') },
        { path: 'cartoon', name: 'cartoon', component: () => import('../views/Cartoon.vue') },
        { path: 'setting', name: 'setting', component: () => import('../views/Setting.vue') },
        { path: 'socialMedia', name: 'socialMedia', component: () => import('../views/SocialMedia.vue') },
      ]
    },
    {
      path: '/test',
      name: 'test',
      meta: {title : '测试页面'},
      component: () => import('../views/test.vue'),
    },
    {
      path: '/404',
      name: 'NotFound',
      meta: {title : '404页面'},
      component: () => import('../views/404.vue'),
    },
    { path: '/:pathMatch(.*)', redirect: '/404'}
  ],
})

// from 将要跳转的，当前的页面
// to 跳转之后
router.beforeEach((to, from, next) => {
  document.title = to.meta.title
  next()
})

export default router
