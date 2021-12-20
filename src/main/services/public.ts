import {resolve} from "path"
import os from "os"
import crypto from "crypto"
import got from "got"
import {store} from "../custom"

const ffmpegPath = require('@ffmpeg-installer/ffmpeg')
const ffProbePath = require('@ffprobe-installer/ffprobe')
const ffmpeg = require('fluent-ffmpeg')

if (process.env.NODE_ENV === 'development') {
  ffmpeg.setFfmpegPath(ffmpegPath.path)
  ffmpeg.setFfprobePath(ffProbePath.path)
} else {
  ffmpeg.setFfmpegPath(ffmpegPath.path.replace('app.asar', 'app.asar.unpacked'))
  ffmpeg.setFfprobePath(ffProbePath.path.replace('app.asar', 'app.asar.unpacked'))
}

//获取运行目录
export const pathResolve = (dir: string) => {
  if (dir.indexOf(':') === -1) {
    if (process.env.NODE_ENV === 'development') {
      return resolve(__dirname, '.\\..\\', dir)
    } else {
      return resolve(__dirname, '..\\..\\', dir)
    }
  } else {
    return dir
  }
}

//同步延时
export const delay = (ms: number) => new Promise(resolve => setTimeout(() => {
  resolve('')
}, ms))

//获取视频详情
export const getVideoInfo = (path: string) => {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(path, function (err: any, data: any) {
      resolve(data)
    })
  })
}

//转换成wav
export const transitionWav = (path: string, output: string) => {
  return new Promise((resolve) => {
    ffmpeg(path)
      .noVideo()
      .withAudioCodec('copy')
      .audioCodec('pcm_s16le')
      .toFormat('wav')
      .on('error', function (err: { message: string; }) {
        console.log('转换成wav失败：' + err.message)
        resolve(0)
      })
      .on('end', function () {
        console.log('转换成wav成功')
        resolve(1)
      })
      .save(output)
  })
}

//按时长截取媒体
export const timeInterceptMedia = (path: string, output: string, ss: number, tt: number) => {
  return new Promise((resolve) => {
    ffmpeg(path)
      .seek(ss)//起始位置
      .duration(tt)//长度
      .withAudioCodec('copy')
      .on('error', function (err: { message: string; }) {
        console.log('分段媒体失败：' + err.message)
        resolve(0)
      })
      .on('end', function () {
        console.log('分段媒体成功')
        resolve(1)
      })
      .save(output)
  })
}

//补零
export const pad2 = (num: number) => {
  if (num < 10) {
    return '0' + num
  }
  return '' + num
};

//生成一个随机字符串
export const makeNonce = (function () {
  let counter = 0
  let last = 0
  const machine = os.hostname()
  const pid = process.pid
  return function () {
    let val = Math.floor(Math.random() * 1000000000000)
    if (val === last) {
      counter++
    } else {
      counter = 0;
    }
    last = val;
    const uid = `${machine}${pid}${val}${counter}`
    return crypto.createHash('md5').update(uid).digest('hex')
  };
}());

// 获取时间戳
export const timestamp = () => {
  const date = new Date()
  const YYYY = date.getUTCFullYear()
  const MM = pad2(date.getUTCMonth() + 1)
  const DD = pad2(date.getUTCDate())
  const HH = pad2(date.getUTCHours())
  const mm = pad2(date.getUTCMinutes())
  const ss = pad2(date.getUTCSeconds())
  return `${YYYY}-${MM}-${DD}T${HH}:${mm}:${ss}Z`
}

// url编码
export const encode = (str: string) => {
  const result = encodeURIComponent(str)
  return result
    .replace(/!/g, "%21")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/\*/g, "%2A")
}

// 获取Token
export const getToken = async (): Promise<{ AppKey: string, VTT: string, TTS: string, ASRTime: number, Token: string }> => {
  const AliKey = store.get('settings.AliKey')
  const nowTime = Math.round(new Date().getTime() / 1000); //十位时间戳（精确到秒）
  if (nowTime < AliKey.Token.ExpireTime) {
    console.log('---------本地返回token----------')
    return {
      AppKey: AliKey.AppKey,
      VTT: AliKey.VTT,
      TTS: AliKey.TTS,
      ASRTime: AliKey.ASRTime,
      Token: AliKey.Token.Id
    }
  }
  const Timestamp = encode(timestamp())
  const SignatureNonce = makeNonce()
  //规范化的请求字符串
  const query_string = `AccessKeyId=${AliKey.AccessKeyId}&Action=CreateToken&Format=JSON&RegionId=cn-shanghai&SignatureMethod=HMAC-SHA1&SignatureNonce=${SignatureNonce}&SignatureVersion=1.0&Timestamp=${Timestamp}&Version=2019-02-28`
  //构造待签名字符串
  const stringToSign = `GET&${encode("/")}&${encode(query_string)}`
  //计算签名
  const key = AliKey.AccessKeySecret + "&"
  const signature = crypto.createHmac('sha1', key).update(stringToSign).digest("base64")
  const Signature = encode(signature)
  //调用服务
  const full_url = `https://nls-meta.cn-shanghai.aliyuncs.com/?Signature=${Signature}&${query_string}`
  const res = await got(full_url)
  if (res.statusCode == 200) {
    const data = JSON.parse(res.body)
    store.set('settings.AliKey.Token', data.Token)
    console.log('---------网络获取token----------')
    return {
      AppKey: AliKey.AppKey,
      VTT: AliKey.VTT,
      TTS: AliKey.TTS,
      ASRTime: AliKey.ASRTime,
      Token: data.Token.Id
    }
  }
  return {
    AppKey: '',
    VTT: '',
    TTS: '',
    ASRTime: 0,
    Token: ''
  }
}

// 截取指定长度字符串，中文按2个长度计算
export const getSubString = (str: string, len: number) => {
  let strLen = 0
  let s = ""
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 128) {
      strLen += 2
    } else {
      strLen++
    }
    s += str.charAt(i);
    if (strLen >= len) {
      return s
    }
  }
  return s
}

// 根据指定长度均分文本
export const meanLongText = (longText: string, size: number) => {
  let strLen = 0
  for (let i = 0; i < longText.length; i++) {
    if (longText.charCodeAt(i) > 128) {
      strLen += 2
    } else {
      strLen++
    }
  }
  const intPart = parseInt(String(strLen / size))
  const rem = strLen % size
  let resArr = []
  for (let index = 0; index < intPart; index++) {
    const subStr = getSubString(longText, size)
    resArr.push(subStr)
    longText = longText.replace(subStr, '')
  }
  const subStr = getSubString(longText, rem)
  if (subStr != '') resArr.push(subStr)
  return resArr
}

// 按字数切分文本
export const splitLongText = (text: string, size: number) => {
  //先按标点符号切分
  let texts = text.split(/[、，。；？！,!\\?\s]/)
  let textPart = ""
  let result = []
  let len = 0
  //再按size merge,避免标点符号切分出来的太短
  for (let i = 0; i < texts.length; i++) {
    if (textPart.length + texts[i].length + 1 > size) {
      if (textPart != "") {
        result.push(textPart.toString())
      }
      textPart = ""
    }
    textPart = textPart + texts[i]
    len += texts[i].length
    if (len < text.length) {
      textPart = textPart + text.charAt(len)
      len += 1
    }
  }
  if (textPart.length > 0) {
    result.push(textPart.toString())
  }
  if (textPart.length > 0 && textPart.length > size) {
    let result: string[] = []
    result = result.concat(meanLongText(textPart, size))
    return result
  }
  return result
}
