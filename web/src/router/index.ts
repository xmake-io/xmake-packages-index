import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// Clean URLs (no '#'). For each route, build.sh's prerender step emits a real
// static HTML file (e.g. dist/packages/zlib/index.html), so any host that
// serves static files — including GitHub Pages — resolves the URL natively.
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
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, saved) {
    return saved ?? { top: 0 }
  },
})
