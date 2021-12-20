<template>
  <div>
    <n-space vertical>
      <n-tabs default-value="name" justify-content="space-evenly" size="large" @update:value="reviseSearchTabs">
        <n-tab-pane name="name" tab="音乐名称">
          <n-space vertical>
            <n-input v-model:value="state.searchText" allowClear autocomplete="off" placeholder="例如:折子戏"/>
            <n-radio-group v-model:value="state.appSelect" name="radiogroup">
              <n-space :size="[50, 10]" justify="center">
                <n-radio v-for="list in state.appList" :key="list.value" :value="list.value">
                  {{ list.label }}
                </n-radio>
              </n-space>
            </n-radio-group>
          </n-space>
        </n-tab-pane>
        <n-tab-pane name="id" tab="音乐id">
          <n-space vertical>
            <n-input v-model:value="state.searchText" allowClear autocomplete="off" placeholder="例如:395749"/>
            <n-radio-group v-model:value="state.appSelect" name="radiogroup">
              <n-space :size="[50, 10]" justify="center">
                <n-radio v-for="list in state.appList" :key="list.value" :value="list.value">
                  {{ list.label }}
                </n-radio>
              </n-space>
            </n-radio-group>
          </n-space>
        </n-tab-pane>
        <n-tab-pane name="url" tab="音乐地址">
          <n-input v-model:value="state.searchText" allowClear autocomplete="off"
                   placeholder="例如:https://music.163.com/#/song?id=25906124"/>
        </n-tab-pane>
      </n-tabs>
      <n-button :disabled="state.isSearch" attr-type="button" block type="primary" @click="searchMusic">搜索</n-button>
      <div style="text-align: initial">
        <n-gradient-text :size="18" type="warning">帮助：</n-gradient-text>
        <n-gradient-text :size="18" type="error">标红</n-gradient-text>
        <n-gradient-text :size="18" type="warning">为音乐ID，</n-gradient-text>
        <n-gradient-text :size="18" type="info">蓝色</n-gradient-text>
        <n-gradient-text :size="18" type="warning">+</n-gradient-text>
        <n-gradient-text :size="18" type="error">红色</n-gradient-text>
        <n-gradient-text :size="18" type="warning">表示音乐地址</n-gradient-text>
        <br/>
        <n-gradient-text :size="18" type="primary">蜻蜓FM的音乐ID需要使用</n-gradient-text>
        <n-gradient-text :size="18" type="error">|(管道符)</n-gradient-text>
        <n-gradient-text :size="18" type="primary">组合，例如</n-gradient-text>
        <n-gradient-text :size="18" type="error">158696|5266259</n-gradient-text>
        <br/>
        <n-gradient-text :size="18" type="warning">网易：</n-gradient-text>
        <n-gradient-text :size="18" type="info">https://music.163.com/#/song?id=</n-gradient-text>
        <n-gradient-text :size="18" type="error">25906124</n-gradient-text>
        <br/>
        <n-gradient-text :size="18" type="warning">ＱＱ：</n-gradient-text>
        <n-gradient-text :size="18" type="info">https://y.qq.com/n/yqq/song/</n-gradient-text>
        <n-gradient-text :size="18" type="error">002B2EAA3brD5b</n-gradient-text>
        <n-gradient-text :size="18" type="info">.html</n-gradient-text>
        <br/>
        <n-gradient-text :size="18" type="warning">酷狗：</n-gradient-text>
        <n-gradient-text :size="18" type="info">http://www.kugou.com/song/#hash=</n-gradient-text>
        <n-gradient-text :size="18" type="error">08228af3cb404e8a4e7e9871bf543ff6</n-gradient-text>
        <br/>
        <n-gradient-text :size="18" type="warning">酷我：</n-gradient-text>
        <n-gradient-text :size="18" type="info">https://www.kuwo.cn/play_detail/</n-gradient-text>
        <n-gradient-text :size="18" type="error">175264544</n-gradient-text>
        <n-gradient-text :size="18" type="info">/</n-gradient-text>
        <br/>
        <n-gradient-text :size="18" type="warning">千千：</n-gradient-text>
        <n-gradient-text :size="18" type="info">https://music.taihe.com/song/</n-gradient-text>
        <n-gradient-text :size="18" type="error">266069</n-gradient-text>
        <br/>
        <n-gradient-text :size="18" type="warning">一听：</n-gradient-text>
        <n-gradient-text :size="18" type="info">https://www.1ting.com/player/b6/</n-gradient-text>
        <n-gradient-text :size="18" type="error">player_357838</n-gradient-text>
        <n-gradient-text :size="18" type="info">.html</n-gradient-text>
        <br/>
        <n-gradient-text :size="18" type="warning">咪咕：</n-gradient-text>
        <n-gradient-text :size="18" type="info">https://music.migu.cn/v3/music/song/</n-gradient-text>
        <n-gradient-text :size="18" type="error">477803</n-gradient-text>
        <br/>
        <n-gradient-text :size="18" type="warning">荔枝：</n-gradient-text>
        <n-gradient-text :size="18" type="info">https://www.lizhi.fm/1947925/</n-gradient-text>
        <n-gradient-text :size="18" type="error">2498707770886461446</n-gradient-text>
        <br/>
        <n-gradient-text :size="18" type="warning">蜻蜓：</n-gradient-text>
        <n-gradient-text :size="18" type="info">https://www.qingting.fm/channels/158696/programs/</n-gradient-text>
        <n-gradient-text :size="18" type="error">5266259</n-gradient-text>
        <br/>
        <n-gradient-text :size="18" type="warning">喜马拉雅：</n-gradient-text>
        <n-gradient-text :size="18" type="info">https://www.ximalaya.com/51701370/sound/</n-gradient-text>
        <n-gradient-text :size="18" type="error">24755731</n-gradient-text>
        <br/>
        <n-gradient-text :size="18" type="warning">5sing原创：</n-gradient-text>
        <n-gradient-text :size="18" type="info">http://5sing.kugou.com/yc/</n-gradient-text>
        <n-gradient-text :size="18" type="error">3082899</n-gradient-text>
        <n-gradient-text :size="18" type="info">.html</n-gradient-text>
        <br/>
        <n-gradient-text :size="18" type="warning">5sing翻唱：</n-gradient-text>
        <n-gradient-text :size="18" type="info">http://5sing.kugou.com/fc/</n-gradient-text>
        <n-gradient-text :size="18" type="error">14369766</n-gradient-text>
        <n-gradient-text :size="18" type="info">.html</n-gradient-text>
        <br/>
        <n-gradient-text :size="18" type="warning">全民K歌：</n-gradient-text>
        <n-gradient-text :size="18" type="primary">只支持根据ID或地址解析，不支持搜索名称</n-gradient-text>
      </div>
    </n-space>
    <n-button v-if="!state.showMusicDrawer && state.musicList.length > 0" round style="position: fixed; bottom: 10px; left: calc(50% - 32px);}"
              type="primary" @click="state.showMusicDrawer = true">展开
    </n-button>
    <n-drawer v-model:show="state.showMusicDrawer" height="587" placement="bottom"
              style="border: var(--header-border-bottom)">
      <n-drawer-content :native-scrollbar="false" body-style="height: 461px" closable title="搜索结果">
        <aplayer v-model:music="state.music" :list="state.musicList" preload="metadata" showLrc theme="#0e90d2"/>
        <template #footer>
          <n-space justify="center">
            <n-button :disabled="state.isLoading" size="large" type="info" @click="nextPage">加载更多</n-button>
            <n-button :disabled="state.isDownloaded" size="large" type="primary" @click="downMusic">下载当前</n-button>
          </n-space>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup>
import {
  NButton,
  NDrawer,
  NDrawerContent,
  NGradientText,
  NInput,
  NTabs,
  NTabPane,
  NSpace,
  NRadio,
  NRadioGroup,
  useMessage
} from 'naive-ui'
import Aplayer from 'vue3-aplayer'
import {reactive} from "vue";
import {useIpc, useService} from '../composables'

const ipcRenderer = useIpc()
const message = useMessage()
const {
  searchMusicBase,
  downMusicBase
} = useService('BaseService')

const state = reactive({
  searchText: '',
  appSelect: 'netease',
  searchTabs: 'name',
  showMusicDrawer: false,
  music: {},
  musicList: [],
  page: 1,
  isSearch: false,
  isDownloaded: false,
  isLoading: false,
  appList: [
    {
      value: 'netease',
      label: '网易',
    },
    {
      value: 'qq',
      label: 'QQ',
    },
    {
      value: 'kugou',
      label: '酷狗',
    },
    {
      value: 'kuwo',
      label: '酷我',
    },
    {
      value: 'baidu',
      label: '千千',
    },
    {
      value: '1ting',
      label: '一听',
    },
    {
      value: 'migu',
      label: '咪咕',
    },
    {
      value: 'lizhi',
      label: '荔枝',
    },
    {
      value: 'qingting',
      label: '蜻蜓',
    },
    {
      value: 'ximalaya',
      label: '喜马拉雅',
    },
    {
      value: '5singyc',
      label: '5sing原创',
    },
    {
      value: '5singfc',
      label: '5sing翻唱',
    },
    {
      value: 'kg',
      label: '全民K歌',
    }
  ]
})

const reviseSearchTabs = (value) => {
  state.searchTabs = value
}

const searchMusic = async () => {
  state.isSearch = true
  state.page = 1
  const res = await searchMusicBase({
    input: state.searchText,
    filter: state.searchTabs,
    type: state.appSelect,
    page: state.page
  })
  if (res.code === 200) {
    if (res.data.length > 0) {
      state.musicList = res.data
      state.music = res.data[0]
    }
    state.showMusicDrawer = true
  }
  state.isSearch = false
}

const nextPage = async () => {
  state.isLoading = true
  state.page++
  const res = await searchMusicBase({
    input: state.searchText,
    filter: state.searchTabs,
    type: state.appSelect,
    page: state.page
  })
  if (res.code === 200) {
    if (res.data.length > 0) {
      state.musicList.push(...res.data)
    }
  }
  state.isLoading = false
}

const downMusic = async () => {
  state.isDownloaded = true
  await downMusicBase(state.music.src, state.music.artist + "-" + state.music.title)
  state.isDownloaded = false
}
</script>

<style lang="less" scoped>

</style>
