import {h} from 'vue'
import {NIcon} from 'naive-ui'
import * as antd from '@vicons/antd'

export {antd}

export const renderIcon = (icon: any) => {
  return () => h(NIcon, null, {default: () => h(icon)})
}

export const menuOptions = [
  {
    label: '语音转文字',
    key: "/VTT",
    icon: renderIcon(antd.FileTextOutlined)
  },
  {
    label: '文字转语音',
    key: "/TTS",
    icon: renderIcon(antd.AudioOutlined)
  },
  {
    label: '素材下载',
    key: "/Download",
    icon: renderIcon(antd.CloudDownloadOutlined)
  },
  {
    label: '素材合成',
    key: "/Synthesis",
    icon: renderIcon(antd.FileSyncOutlined)
  },
  {
    label: '系统设置',
    key: "/Setting",
    icon: renderIcon(antd.SettingOutlined)
  },
  {
    label: '切换主题',
    key: 1,
    icon: renderIcon(antd.BulbOutlined)
  },
  {
    label: '退出',
    key: 0,
    icon: renderIcon(antd.LogoutOutlined)
  }
]
