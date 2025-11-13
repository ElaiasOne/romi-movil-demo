import { createRouter, createWebHistory, createWebHashHistory } from '@ionic/vue-router'
import LoginPage from '@/pages/LoginPage.vue'
import TabsShell from '@/layouts/TabsShell.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginPage },
  {
    path: '/app',
    component: TabsShell,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/app/articulos' },
      { path: 'articulos', component: () => import('@/pages/ArticulosList.vue') },
      { path: 'articulo/:id', component: () => import('@/pages/ArticuloForm.vue') },
      { path: 'clientes', component: () => import('@/pages/ClientesList.vue') },
      { path: 'cliente/:id', component: () => import('@/pages/ClienteForm.vue') },
      { path: 'estadisticos', component: () => import('@/pages/EstadisticosPage.vue') },
      { path: 'stock', component: () => import('@/pages/StockPage.vue') },
      { path: 'ventas', component: () => import('@/pages/VentasList.vue') },
      { path: 'venta/new', component: () => import('@/pages/VentaForm.vue') },
      { path: 'venta/:id', component: () => import('@/pages/VentaForm.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/app' },
]

// 👇 clave: en producción usamos HASH router
const history = import.meta.env.PROD
  ? createWebHashHistory()                    // https://romi-movil-demo.vercel.app/#/app/...
  : createWebHistory(import.meta.env.BASE_URL)

const router = createRouter({
  history,
  routes,
})

router.beforeEach((to, _from, next) => {
  const isLogged = !!localStorage.getItem('romi_user')
  if (to.meta.requiresAuth && !isLogged) return next('/login')
  if (to.path === '/login' && isLogged) return next('/app')
  next()
})

export default router
