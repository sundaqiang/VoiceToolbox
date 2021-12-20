<template>
  <n-space vertical>
    <n-card hoverable title="阿里云智能语音交互参数设置">
      <n-form
        ref="AliFormRef"
        :label-width="140"
        :model="AliForm"
        :rules="AliFormRules"
        label-placement="left"
        size="large">
        <n-form-item label="AccessKeyId" path="AccessKeyId">
          <n-input v-model:value="AliForm.AccessKeyId" allowClear autocomplete="off" placeholder="请输入AccessKeyId"
                   style="text-align: initial">
          </n-input>
        </n-form-item>
        <n-form-item label="AccessKeySecret" path="AccessKeySecret">
          <n-input v-model:value="AliForm.AccessKeySecret" allowClear autocomplete="off"
                   placeholder="请输入AccessKeySecret"
                   style="text-align: initial">
          </n-input>
        </n-form-item>
        <n-form-item label="AppKey" path="AppKey">
          <n-input v-model:value="AliForm.AppKey" allowClear autocomplete="off" placeholder="请输入AppKey"
                   style="text-align: initial">
          </n-input>
        </n-form-item>
        <n-form-item label="语音识别" path="VTT">
          <n-radio-group v-model:value="AliForm.VTT" name="radiogroup">
            <n-space>
              <n-popover v-for="list in state.VTTList" placement="top-start" trigger="hover">
                <template #trigger>
                  <n-radio :key="list.value" :value="list.value">
                    {{ list.label }}
                  </n-radio>
                </template>
                <span>{{ list.message }}</span>
              </n-popover>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="一句话识别分段" path="ASRTime">
          <n-input-number v-model:value="AliForm.ASRTime" :max="60" :min="0" placeholder="一句话识别分段，单位秒"
                          style="text-align: initial">
            <template #suffix>秒</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="语音合成" path="TTS">
          <n-radio-group v-model:value="AliForm.TTS" name="radiogroup">
            <n-space>
              <n-popover v-for="list in state.TTSList" placement="top-start" trigger="hover">
                <template #trigger>
                  <n-radio :key="list.value" :value="list.value">
                    {{ list.label }}
                  </n-radio>
                </template>
                <span>{{ list.message }}</span>
              </n-popover>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item>
          <n-button attr-type="button" block type="primary" @click="saveAppKey">保存</n-button>
        </n-form-item>
      </n-form>
    </n-card>
    <n-card hoverable title="系统设置">
      <n-form
        :label-width="140"
        :model="GeneralForm"
        label-placement="left"
        size="large">
        <n-form-item label="工作目录" path="WorkDir">
          <n-input v-model:value="GeneralForm.WorkDir" allowClear autocomplete="off" placeholder="请双击选择工作路径，默认为软件根目录。"
                   style="text-align: initial" @dblclick="selectWorkDir">
          </n-input>
        </n-form-item>
        <n-form-item label="下载接口" path="WorkDir">
          <n-input v-model:value="GeneralForm.DownApi" allowClear autocomplete="off" placeholder="懒得翻译php源码了，可自行github找maicong/music下载搭建或百度多站合一音乐搜索解决方案找网站"
                   style="text-align: initial">
          </n-input>
        </n-form-item>
        <n-form-item>
          <n-button attr-type="button" block type="primary" @click="saveGeneral">保存</n-button>
        </n-form-item>
      </n-form>
    </n-card>
  </n-space>
</template>

<script setup>
import {
  NButton,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NRadio,
  NRadioGroup,
  NPopover,
  NSpace,
  useMessage
} from 'naive-ui'
import {reactive, ref} from "vue";
import {useIpc, useService} from '../composables'

const ipcRenderer = useIpc()
const message = useMessage()
const {
  dirIsAccess
} = useService('BaseService')
const AliKey = ipcRenderer.sendSync('store', {
  mode: 0,
  key: 'settings.AliKey',
}).return_msg
const General = ipcRenderer.sendSync('store', {
  mode: 0,
  key: 'settings.General',
}).return_msg
const state = reactive({
  VTTList: [
    {
      value: 'ASR',
      label: '一句话识别',
      message: '接口最长60秒，自动拆分音频多次识别，识别完无标点符号，试用版'
    },
    {
      value: 'FlashRecognizer',
      label: '录音文件识别极速版',
      message: '不限时长，识别完带标点符号，商业版'
    }
  ],
  TTSList: [
    {
      value: 'TTS',
      label: '语音合成',
      message: '接口最长150字，自动拆分文字多次合成，试用版'
    },
    {
      value: 'TTSAsync',
      label: '长文本语音合成',
      message: '不限时长，商业版'
    }
  ]
})
const AliFormRef = ref(null)
const AliForm = reactive({
  AccessKeyId: AliKey.AccessKeyId ?? '',
  AccessKeySecret: AliKey.AccessKeySecret ?? '',
  AppKey: AliKey.AppKey ?? '',
  VTT: AliKey.VTT ?? 'ASR',
  TTS: AliKey.TTS ?? 'TTS',
  ASRTime: AliKey.ASRTime ?? 10
})
const AliFormRules = reactive({
  AccessKeyId: {
    required: true,
    message: '请输入AccessKeyId',
    trigger: ['blur', 'input']
  },
  AccessKeySecret: {
    required: true,
    message: '请输入AccessKeySecret',
    trigger: ['blur', 'input']
  },
  AppKey: {
    required: true,
    message: '请输入AppKey',
    trigger: ['blur', 'input']
  },
  VTT: {
    required: true,
    trigger: 'change',
    message: '请选择VTT接口'
  },
  TTS: {
    required: true,
    trigger: 'change',
    message: '请选择TTS接口'
  },
  ASRTime: {
    type: 'number',
    required: true,
    message: '请输入ASR分段长度',
    trigger: ['blur', 'change']
  }
})
const GeneralForm = reactive({
  WorkDir: General.WorkDir ?? '',
  DownApi: General.DownApi ?? ''
})
const saveAppKey = () => {
  AliFormRef.value.validate((errors) => {
    if (!errors) {
      AliKey.AccessKeyId = AliForm.AccessKeyId
      AliKey.AccessKeySecret = AliForm.AccessKeySecret
      AliKey.AppKey = AliForm.AppKey
      AliKey.VTT = AliForm.VTT
      AliKey.TTS = AliForm.TTS
      AliKey.ASRTime = AliForm.ASRTime
      ipcRenderer.sendSync('store', {
        mode: 1,
        key: 'settings.AliKey',
        value: AliKey
      })
      message.success('保存成功！')
    }
  })
}
const selectWorkDir = async () => {
  const WorkDir = await ipcRenderer.invoke('dialog:showOpenDialog', {
    title: '请选择工作路径',
    properties: ['openDirectory']
  })
  if (!WorkDir.canceled) {
    GeneralForm.WorkDir = WorkDir.filePaths[0]
  }
}
const saveGeneral = async () => {
  if (!GeneralForm.WorkDir || await dirIsAccess(GeneralForm.WorkDir)) {
    General.WorkDir = GeneralForm.WorkDir
    General.DownApi = GeneralForm.DownApi
    ipcRenderer.sendSync('store', {
      mode: 1,
      key: 'settings.General',
      value: General
    })
    message.success('保存成功！')
  } else {
    message.error('目录不存在，请重新指定!')
  }
}
</script>

<style lang="less" scoped>

</style>
