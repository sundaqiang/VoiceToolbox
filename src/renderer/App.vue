<template>
  <n-config-provider :date-locale="dateZhCN" :locale="zhCN" :theme="settings.Theme ? darkTheme : null">
    <n-message-provider>
      <router-view v-slot="{ Component, route }">
        <transition
          enter-active-class="animate__animated animate__fadeIn"
          leave-active-class="animate__animated animate__fadeOut"
          mode="out-in"
        >
          <keep-alive>
            <component :is="Component" class="view"/>
          </keep-alive>
        </transition>
      </router-view>
    </n-message-provider>
  </n-config-provider>
</template>
<script setup>
document.documentElement.style.setProperty('--animate-duration', '1s')
import {zhCN, dateZhCN, NConfigProvider, NMessageProvider, darkTheme} from 'naive-ui'
import animated from 'animate.css'
import {useIpc} from './composables'
import {onMounted, reactive} from "vue";

const ipcRenderer = useIpc()
const settings = reactive({
  Theme: ipcRenderer.sendSync('store', {mode: 0, key: 'settings.Theme',}).return_msg
})
onMounted(() => {
  ipcRenderer.on('callback', (event, arg) => {
    if (arg.mode && arg.key === "settings.Theme") {
      settings.Theme = arg.value
    }
  })
})
</script>
<style>
body {
  margin: 0;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0);
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  height: 100VH;
}
</style>
