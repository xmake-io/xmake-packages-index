import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

// Hash history keeps the site fully static — no server rewrites required on
// gh-pages or any plain object-storage host.
const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
  { path: '/packages', name: 'packages', component: () => import('@/views/PackagesView.vue') },
  {
    path: '/packages/:name',
    name: 'package-detail',
    component: () => import('@/views/PackageDetailView.vue'),
    props: true,
  },
  { path: '/about', name: 'about', component: () => import('@/views/AboutView.vue') },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash }
    return { top: 0 }
  },
})
