import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/FrontLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('@/views/front/HomeView.vue') },
      { path: 'about', name: 'about', component: () => import('@/views/front/AboutView.vue') },
      { path: 'projects', name: 'projects', component: () => import('@/views/front/ProjectsView.vue') },
      { path: 'projects/:id', name: 'project-detail', component: () => import('@/views/front/ProjectDetailView.vue') },
      { path: 'resources', name: 'resources', component: () => import('@/views/front/ResourcesView.vue') },
    ],
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    children: [
      { path: 'login', name: 'admin-login', component: () => import('@/views/admin/LoginView.vue') },
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
        beforeEnter: (to, from, next) => {
          const userStore = useUserStore()
          if (!userStore.isAdmin) {
            next({ name: 'admin-login' })
          } else {
            next()
          }
        },
      },
      {
        path: 'profile',
        name: 'admin-profile',
        component: () => import('@/views/admin/ProfileView.vue'),
        beforeEnter: (to, from, next) => {
          const userStore = useUserStore()
          if (!userStore.isAdmin) next({ name: 'admin-login' })
          else next()
        },
      },
      {
        path: 'projects',
        name: 'admin-projects',
        component: () => import('@/views/admin/ProjectsManageView.vue'),
        beforeEnter: (to, from, next) => {
          const userStore = useUserStore()
          if (!userStore.isAdmin) next({ name: 'admin-login' })
          else next()
        },
      },
      {
        path: 'resources',
        name: 'admin-resources',
        component: () => import('@/views/admin/ResourcesManageView.vue'),
        beforeEnter: (to, from, next) => {
          const userStore = useUserStore()
          if (!userStore.isAdmin) next({ name: 'admin-login' })
          else next()
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// 全局前置守卫 - 仅用于确保认证状态加载
router.beforeEach(async (to, from, next) => {
  next()
})

export default router
