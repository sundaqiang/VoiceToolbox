<template>
  <n-space vertical>
    <n-input
      v-model:value="state.TTSOptions.inputText"
      :rows="21"
      clearable
      placeholder="请输入待转换的文本"
      round
      style="text-align:initial"
      type="textarea"
    />
    <n-space align="center" inline>
      <span>语音类型:</span>
      <n-button size="small" type="primary" @click="openAnchor">{{ state.anchor }}</n-button>
      <span>输出格式:</span>
      <n-radio-group v-model:value="state.TTSOptions.format" name="radiogroup">
        <n-space>
          <n-radio v-for="list in state.formatList" :key="list.value" :value="list.value">
            {{ list.label }}
          </n-radio>
        </n-space>
      </n-radio-group>
    </n-space>
    <n-space align="center" inline>
      <span>音量:</span>
      <n-slider v-model:value="state.TTSOptions.volume" :step="1" style="width: calc((100VW - 402px) / 3)"/>
      <span>语速:</span>
      <n-slider v-model:value="state.TTSOptions.speech" :max="500" :min="-500" :step="1"
                style="width: calc((100VW - 402px) / 3)"/>
      <span>语调:</span>
      <n-slider v-model:value="state.TTSOptions.pitch" :max="500" :min="-500" :step="1"
                style="width: calc((100VW - 402px) / 3)"/>
    </n-space>
    <n-button :block="true" :disabled="!state.outputFile || state.isStart" size="large" type="info"
              @click="listenAudio(state.outputFile)">试听
    </n-button>
    <n-button :block="true" :disabled="state.isStart" size="large" type="primary" @click="startConvert_getVoice">文字转语音
    </n-button>
    <n-modal
      v-model:show="state.showAnchor"
      :bordered="false"
      class="custom-card"
      preset="card"
      size="huge"
      style="width: 80%; min-height: 50VH"
      title="主播类型"
    >
      <n-tabs default-value="general" size="large" @update:value="reviseTtsTabs">
        <n-tab-pane v-for="(item, key) in state.TtsModel" :key="key" :name="key" :tab="item.label">
          <n-data-table
            :columns="state.TtsModelColumns"
            :data="item.speakers"
            :max-height="state.TtsModelHeight"
            :min-height="state.TtsModelHeight"
            :striped="true"
            virtual-scroll
          />
        </n-tab-pane>
      </n-tabs>
    </n-modal>
  </n-space>
</template>

<script setup>
import {
  NButton,
  NInput,
  NModal,
  NSlider,
  NRadio,
  NRadioGroup,
  NSpace,
  NTabs,
  NTabPane,
  NDataTable,
  useMessage
} from 'naive-ui'
import {h, onActivated, onDeactivated, onMounted, reactive, toRaw} from 'vue'
import {useIpc, useService} from '../composables'
import {Howl} from "howler"

const message = useMessage()
const ipcRenderer = useIpc()
const {
  getTtsModels,
  getResolve,
  getTtsLongText
} = useService('BaseService')

const state = reactive({
  sound: null,
  isStart: false,
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
  },
  formatList: [
    {
      value: "mp3",
      label: "mp3"
    },
    {
      value: 'wav',
      label: 'wav'
    }
  ],
  anchor: '语音类型',
  showAnchor: false,
  TtsModel: {},
  TtsModelHeight: 329,
  TtsModelColumns: [
    {
      title: '主播名',
      key: 'speaker',
      align: 'center',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '声音类型',
      key: 'speechType',
      align: 'center',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '采样率',
      key: 'sampleRate',
      align: 'center',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '操作',
      key: 'actions',
      align: 'center',
      render(row, index) {
        return h(
          NSpace,
          {},
          {
            default: () => [
              h(
                NButton,
                {
                  type: 'info',
                  size: 'tiny',
                  onClick: async () => {
                    await listenAudio('resources\\voicer\\' + row.speakerId + '.mp3')
                  }
                },
                {
                  default: () => '试听'
                }
              ),
              h(
                NButton,
                {
                  type: 'primary',
                  size: 'tiny',
                  onClick: () => {
                    state.TTSOptions.sampleRate = row.sampleRate
                    state.TTSOptions.speaker = row.speaker
                    state.TTSOptions.speakerId = row.speakerId
                    state.TTSOptions.speechType = row.speechType
                    ipcRenderer.sendSync('store', {
                      mode: 1,
                      key: 'settings.TTSOptions',
                      value: toRaw(state.TTSOptions)
                    })
                    state.anchor = state.TTSOptions.sort + '-' + state.TTSOptions.speechType + '-' + state.TTSOptions.speaker
                    state.sound ? state.sound.stop() : null
                    state.showAnchor = false
                  }
                },
                {
                  default: () => '启用'
                }
              ),
            ]
          }
        )
      }
    }
  ],
})
const openAnchor = async () => {
  state.showAnchor = true
  state.TtsModel = await getTtsModels()
  console.log(state.TtsModel)
}
const reviseTtsTabs = (value) => {
  state.TTSOptions.sort = state.TtsModel[value].label
}

const listenAudio = async (path) => {
  state.sound ? state.sound.stop() : null
  const musicFile = 'atom:\\\\' + await getResolve(path)
  state.sound = new Howl({src: [musicFile]})
  state.sound.play()
}

const startConvert_getVoice = async () => {
  state.isStart = true
  state.sound ? state.sound.stop() : null
  try {
    state.outputFile = await getTtsLongText(toRaw(state.TTSOptions))
    console.log(state.outputFile)
    message.success('转换成功')
    ipcRenderer.sendSync('store', {
      mode: 1,
      key: 'settings.TTSOptions',
      value: toRaw(state.TTSOptions)
    })
  } catch (error) {
    message.error('转换失败')
  }
  state.isStart = false
}

onMounted(() => {
  state.TtsModelHeight = Math.floor((document.documentElement.clientHeight - 393) / 47) * 47
  window.onresize = () => {
    const Height = Math.floor((document.documentElement.clientHeight - 393) / 47) * 47
    if (state.TtsModelHeight !== Height) state.TtsModelHeight = Height
  }
})

onActivated(() => {
  state.TTSOptions = ipcRenderer.sendSync('store', {
    mode: 0,
    key: 'settings.TTSOptions',
  }).return_msg
  if (state.TTSOptions.speaker) state.anchor = state.TTSOptions.sort + '-' + state.TTSOptions.speechType + '-' + state.TTSOptions.speaker
})

onDeactivated(() => state.sound ? state.sound.stop() : null)
</script>

<style lang="less" scoped>

</style>
