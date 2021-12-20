<template>
  <n-element class="home-main">
    <n-layout has-sider style="height: 100%">
      <n-layout-sider
        :collapsed="state.collapsed"
        :collapsed-width="60"
        :width="200"
        bordered
        collapse-mode="width"
        show-trigger="bar"
        @collapse="state.collapsed = true"
        @expand="state.collapsed = false"
      >
        <img src="../assets/login-logo2.png">
        <n-divider class="memu-main-divider"/>
        <n-menu
          v-model:value="state.activeKey"
          :collapsed="state.collapsed"
          :collapsed-icon-size="32"
          :collapsed-width="60"
          :icon-size="32"
          :options="state.menuOptions"
          style="-webkit-app-region: no-drag;"
          @update:value="handleUpdateValue"
        />
      </n-layout-sider>
      <n-layout>
        <div class="home-control">
          <n-button #icon class="control-button" quaternary @click="ipcRenderer.send('windows', {mode: 'min'})">
            <n-icon>
              <component :is="antd.LineOutlined"/>
            </n-icon>
          </n-button>
          <n-button #icon class="control-button" quaternary
                    @click="ipcRenderer.send('windows', {mode: 'max'});state.isMax = !state.isMax">
            <n-icon>
              <component :is="antd.CompressOutlined" v-if="state.isMax"/>
              <component :is="antd.ExpandOutlined" v-else/>
            </n-icon>
          </n-button>
          <n-button #icon class="control-button-close" quaternary @click="ipcRenderer.send('windows', {mode: 'close'})">
            <n-icon>
              <component :is="antd.CloseOutlined"/>
            </n-icon>
          </n-button>
        </div>
        <div class="home-content">
          <n-scrollbar>
            <router-view v-slot="{ Component }" style="padding: 10px 22px 22px 10px">
              <transition
                enter-active-class="animate__animated animate__fadeIn"
                leave-active-class="animate__animated animate__fadeOut"
                mode="out-in"
              >
                <keep-alive>
                  <component :is="Component"/>
                </keep-alive>
              </transition>
            </router-view>
          </n-scrollbar>
        </div>
      </n-layout>
    </n-layout>
  </n-element>
</template>
<script setup>
import {
  NButton,
  NDivider,
  NIcon,
  NLayout,
  NLayoutSider,
  NMenu,
  NElement,
  NScrollbar,
  useMessage
} from 'naive-ui'
import {onActivated, reactive} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {menuOptions, useIpc, antd} from '../composables'

const ipcRenderer = useIpc()
const router = useRouter()
const route = useRoute()
const message = useMessage()
const state = reactive({
  menuOptions: menuOptions,
  collapsed: true,
  activeKey: route.path,
  isMax: false
})
const users = ipcRenderer.sendSync('store', {
  mode: 0,
  key: 'users',
}).return_msg
onActivated(() => {
  state.activeKey = route.path
})
const handleUpdateValue = (key, item) => {
  if (key === 0) {
    setTimeout(() => {
      state.activeKey = route.path
    }, 1)
    users.token = ""
    ipcRenderer.sendSync('store', {
      mode: 1,
      key: 'users',
      value: users
    })
    router.push('/Login')
  } else if (key === 1) {
    const Theme = ipcRenderer.sendSync('store', {
      mode: 0,
      key: 'settings.Theme',
    }).return_msg
    if (Theme) {
      ipcRenderer.sendSync('store', {
        mode: 1,
        key: 'settings.Theme',
        value: 0
      })
    } else {
      ipcRenderer.sendSync('store', {
        mode: 1,
        key: 'settings.Theme',
        value: 1
      })
    }
    setTimeout(() => {
      state.activeKey = route.path
    }, 1)
  } else {
    router.push(key)
  }
}
</script>

<style lang="less">
.n-layout-sider-scroll-container {
  opacity: 1;
  overflow: hidden !important;
}

.n-layout-toggle-bar {
  -webkit-app-region: no-drag;
}
</style>

<style lang="less" scoped>
//body
.home-main {
  width: 100vw;
  height: 100vh;
  background-color: var(--body-color);
  border: 1px solid var(--avatar-color);
  box-sizing: border-box;
  -webkit-app-region: drag;
}

//menu
.memu-main-divider {
  margin: 0
}

.home-control {
  -webkit-app-region: no-drag;
  position: absolute;
  right: 1px;
  top: 1px;
}

.control-button:focus {
  background-color: unset !important;
}

.control-button:hover {
  background-color: var(--n-color-focus) !important;
}

.control-button-close:hover {
  color: var(--base-color);
  background-color: var(--error-color-suppl) !important;
}

.home-content {
  align-items: center;
  justify-content: center;
  height: calc(100VH - 36px);
  margin: 34px 0 0 12px;
  -webkit-app-region: no-drag;
}

.n-layout-sider-scroll-container > img {
  margin: 10px 0;
}
</style>
