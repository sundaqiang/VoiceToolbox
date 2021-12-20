import {createMemoryHistory, createRouter} from 'vue-router'

const Home = () => import('/@/components/Home.vue')
const Login = () => import('/@/components/Login.vue')
const VTT = () => import('/@/components/VTT.vue')
const TTS = () => import('/@/components/TTS.vue')
const Download = () => import('/@/components/Download.vue')
const Synthesis = () => import('/@/components/Synthesis.vue')
const Setting = () => import('/@/components/Setting.vue')

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/',
      name: '/',
      component: Home,
      redirect: '/Login',
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: 'VTT',
          name: 'VTT',
          component: VTT,
          meta: {
            requiresAuth: true
          },
        },
        {
          path: 'TTS',
          name: 'TTS',
          component: TTS,
          meta: {
            requiresAuth: true
          },
        },
        {
          path: 'Download',
          name: 'Download',
          component: Download,
          meta: {
            requiresAuth: true
          },
        },
        {
          path: 'Synthesis',
          name: 'Synthesis',
          component: Synthesis,
          meta: {
            requiresAuth: true
          },
        },
        {
          path: 'Setting',
          name: 'Setting',
          component: Setting,
          meta: {
            requiresAuth: true
          },
        }
      ]
    },
    {
      path: '/Login',
      name: 'Login',
      component: Login
    }
  ]
})

export default router
