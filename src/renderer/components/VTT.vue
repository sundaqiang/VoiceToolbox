<template>
  <n-space vertical>
    <n-upload v-model:file-list="state.mediaList" :default-upload="false" :max="1" :show-file-list="false" accept=".mp3,.wav,.mp4"
              @change="UploadMedia">
      <n-upload-dragger>
        <div style="margin-bottom: 12px;">
          <n-icon :depth="3" size="48">
            <component :is="antd.UploadOutlined"/>
          </n-icon>
        </div>
        <n-text style="font-size: 16px;">点击或者拖动文件到该区域来上传</n-text>
        <n-p depth="3" style="margin: 8px 0 0 0;">
          请不要上传敏感数据，比如你的账号或密码等隐私信息！
        </n-p>
      </n-upload-dragger>
    </n-upload>
    <n-space justify="center">
      <n-button :disabled="state.isUpload" size="large" type="error"
                @click="state.mediaList = [];state.isUpload = true">清除
      </n-button>
      <n-button :disabled="state.isStart" size="large" type="info" @click="listenAudio(state.outputFile)">试听</n-button>
    </n-space>
    <n-button :block="true" :disabled="state.isStart" size="large" type="primary" @click="startConvert_getText">语音转文字
    </n-button>
    <n-card>
      <n-grid :cols="2" :x-gap="48">
        <n-grid-item>
          <n-log
            :font-size="18"
            :log="state.outputText"
            :rows="state.rows"
            style="text-align:initial"
          />
        </n-grid-item>
        <n-grid-item>
          <n-log
            :font-size="18"
            :log="state.outputTextTime"
            :rows="state.rows"
            style="text-align:initial"
          />
        </n-grid-item>
      </n-grid>
    </n-card>
  </n-space>
</template>

<script setup>
import {
  NButton,
  NCard,
  NGrid,
  NGridItem,
  NIcon,
  NLog,
  NSpace,
  NText,
  NP,
  NUpload,
  NUploadDragger,
  useMessage
} from 'naive-ui'
import {onDeactivated, reactive} from 'vue'
import {useIpc, antd, useService} from '../composables'
import {Howl} from "howler"

const message = useMessage()
const ipcRenderer = useIpc()
const {
  isMedia,
  getResolve,
  getVttLongText,
  transitionMedia
} = useService('BaseService')
const state = reactive({
  sound: null,
  rows: 15,
  outputText: "",
  outputTextTime: "",
  isUpload: true,
  isStart: true,
  mediaList: []
})

const UploadMedia = async ({fileList}) => {
  if (fileList.length) {
    state.duration = await isMedia(fileList[0].file.path)
    if (state.duration) {
      state.isUpload = false
      state.isStart = true
      state.sound ? state.sound.stop() : null
      const res = await transitionMedia(fileList[0].file.path)
      if (res.code) {
        state.outputFile = res.path
        state.isStart = false
      }
    } else {
      message.error('上传错误的文件，请重新上传')
      state.mediaList = []
    }
  }
}
const listenAudio = async (path) => {
  state.sound ? state.sound.stop() : null
  const musicFile = 'atom:\\\\' + await getResolve(path) + '?v=' + +new Date().getTime()
  state.sound = new Howl({src: [musicFile]})
  state.sound.play()
}
const startConvert_getText = async () => {
  state.isStart = true
  state.sound ? state.sound.stop() : null
  try {
    const result = await getVttLongText(state.duration)
    state.outputText = result.outputText
    state.outputTextTime = result.outputTextTime
    console.log(result)
    message.success('转换成功')
  } catch (error) {
    message.error('转换失败')
  }
  state.isStart = false
}
onDeactivated(() => state.sound ? state.sound.stop() : null)
</script>

<style lang="less" scoped>

</style>
