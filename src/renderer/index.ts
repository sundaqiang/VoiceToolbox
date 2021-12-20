import {createApp} from 'vue'
import App from './App.vue'
import {useIpc} from './composables'
import router from './router'

const app = createApp(App)
app.use(router)
const ipcRenderer = useIpc()
let users = ipcRenderer.sendSync('store', {
  mode: 0,
  key: 'users',
}).return_msg
if (!users) {
  users = {
    username: '',
    password: '',
    authorization: '',
  }
  ipcRenderer.sendSync('store', {
    mode: 1,
    key: 'users',
    value: users
  })
}
let settings = ipcRenderer.sendSync('store', {
  mode: 0,
  key: 'settings',
}).return_msg
if (!settings) {
  settings = {
    Theme: 0,
    AliKey: {
      AccessKeyId: '',
      AccessKeySecret: '',
      AppKey: '',
      VTT: 'ASR',
      TTS: 'TTS',
      ASRTime: 10,
      Token: {
        ExpireTime: 0,
        Id: '',
        UserId: ''
      }
    },
    General: {
      WorkDir: '',
      DownApi: ''
    },
    TTSOptions: {
      inputText: '',
      sampleRate: 16000,
      speaker: '',
      speakerId: '',
      speechType: '',
      sort: '通用',
      volume: 50,
      speech: 0,
      pitch: 0,
      format: 'mp3'
    }
  }
  ipcRenderer.sendSync('store', {
    mode: 1,
    key: 'settings',
    value: settings
  })
}
app.mount('#app')
router.beforeEach(async (to:any, from:any, next:any) => {
  users = ipcRenderer.sendSync('store', {
    mode: 0,
    key: 'users',
  }).return_msg
  if (to.meta.requiresAuth && users.authorization === '') {
    next('/Login')
  } else {
    next()
  }
})
