import {Service} from './Service'
import fs from "fs"
import {promisify} from "util"
import stream from "stream"
import * as fse from "fs-extra"
import {store} from "../custom"
import {delay, getToken, getVideoInfo, pathResolve, splitLongText, timeInterceptMedia, transitionWav} from "./public"

const got = require("got")
const jsonfile = require("jsonfile")
const pipeline = promisify(stream.pipeline)

export class BaseService extends Service {
  //获取路径
  async getResolve(path: string) {
    return pathResolve(path)
  }

  //获取声音模型列表
  async getTtsModels() {
    if (fse.existsSync('resources/TtsModels.json')) {
      return jsonfile.readFileSync('resources/TtsModels.json')
    }
    return null
  }

  //判断目录是否存在
  async dirIsAccess(path: string) {
    return await fse.pathExists(path)
  }

  //判断是否为媒体文件
  async isMedia(path: string) {
    const res: any = await getVideoInfo(path)
    let duration = res.streams.slice(-1)[0].duration
    if (duration === 'N/A') duration = 0
    return duration
  }

  //媒体文件转换成wav
  async transitionMedia(path: string) {
    let workDir = store.get('settings.General.WorkDir')
    !workDir ? workDir = pathResolve('') : null
    const outputDir = workDir + "\\VTT\\transition\\"
    fse.emptyDirSync(outputDir)
    const fileName = "transition.wav"
    const outputFile = `${outputDir}${fileName}`
    fse.removeSync(outputFile)
    return {
      code: await transitionWav(path, outputFile),
      path: outputFile
    }
  }

  //文本转语音
  async getTtsLongText(params: { inputText: string, sampleRate: number, speaker: string, speakerId: string, speechType: string, sort: string, volume: number, speech: number, pitch: number, format: string }) {
    const {inputText, sampleRate, speaker, speakerId, speechType, sort, volume, speech, pitch, format} = params
    const AliKey = await getToken()
    let workDir = store.get('settings.General.WorkDir')
    !workDir ? workDir = pathResolve('') : null
    const outputDir = workDir + "\\TTS\\"
    fse.ensureDirSync(outputDir)
    const subText = inputText.trim().slice(0, 3)
    const timestamp = Math.round(new Date().getTime() / 1000)
    const outputFile = `${outputDir}${subText}${timestamp}.${format}`
    fse.removeSync(outputFile)
    if (AliKey.TTS === "TTS") {
      let url = "https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/tts"
      /**
       * 设置URL请求参数。
       */
      url = url + "?appkey=" + AliKey.AppKey
      url = url + "&token=" + AliKey.Token
      url = url + "&format=" + format
      url = url + "&sample_rate=" + sampleRate.toString()
      url = url + "&voice=" + speakerId
      url = url + "&volume=" + volume.toString()
      url = url + "&speech_rate=" + speech.toString()
      url = url + "&pitch_rate=" + pitch.toString()
      let textArr = splitLongText(inputText, 150)
      for (let index = 0; index < textArr.length; index++) {
        const text = textArr[index]
        const textUrlEncode = encodeURIComponent(text).replace(/[!'()*]/g, function (c) {
          return "%" + c.charCodeAt(0).toString(16)
        })
        const rqURL = url + "&text=" + textUrlEncode
        await pipeline(got.stream(rqURL), fs.createWriteStream(outputFile, {'flags': 'a'}))
      }
    } else {
      let url = "https://nls-gateway.cn-shanghai.aliyuncs.com/rest/v1/tts/async"
      const tts_body = {
        context: {
          device_id: "device_id"
        },
        header: {
          appkey: AliKey.AppKey,
          token: AliKey.Token
        },
        payload: {
          tts_request: {
            text: inputText,
            voice: speakerId,
            format: format,
            sample_rate: sampleRate.toString(),
            volume: volume.toString(),
            speech_rate: speech.toString(),
            pitch_rate: pitch.toString()
          },
          enable_notify: false
        }
      }
      const bodyContent = JSON.stringify(tts_body)
      const result = await got.post(url, {
        headers: {
          "Content-type": "application/json"
        },
        body: bodyContent,
        responseType: 'json'
      })
      if (result.body.status === 200) {
        const request_id = result.body.request_id
        const task_id = result.body.data.task_id
        url = url + "?appkey=" + AliKey.AppKey + "&task_id=" + task_id + "&token=" + AliKey.Token + "&request_id=" + request_id
        const downAudio = async () => {
          const result = await got.get(url, {
            headers: {},
            responseType: 'json'
          })
          if (result.body.status === 200 && result.body.error_code === 20000000 && result.body.data.audio_address !== null && result.body.data.audio_address !== "") {
            await pipeline(got.stream(result.body.data.audio_address), fs.createWriteStream(outputFile, {'flags': 'a'}))
          } else {
            await delay(3000)
            await downAudio()
          }
        }
        await downAudio()
      }
    }
    return outputFile
  }

  //语音转文本
  async getVttLongText(duration: number) {
    const AliKey = await getToken()
    let workDir = store.get('settings.General.WorkDir')
    !workDir ? workDir = pathResolve('') : null
    const outputDir = workDir + "\\VTT\\transition\\"
    fse.ensureDirSync(outputDir)
    const fileName = "transition.wav"
    const inputFile = `${outputDir}${fileName}`
    let allResult: any
    if (AliKey.VTT === "ASR") {
      let i
      //判断长度后分段视频
      if (duration > 10) {
        i = Math.ceil(duration / AliKey.ASRTime)
        for (let j = 0; j < i; j++) {
          const ss = j * AliKey.ASRTime
          const fileName2 = "transition" + j + ".wav"
          await timeInterceptMedia(inputFile, `${outputDir}${fileName2}`, ss, AliKey.ASRTime)
        }
      } else {
        i = 1
        const fileName2 = "transition0.wav"
        await fse.moveSync(inputFile, `${outputDir}${fileName2}`)
      }
      //分段识别后集合返回数据
      let url = "https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/asr"
      url = url + "?appkey=" + AliKey.AppKey
      for (let j = 0; j < i; j++) {
        const fileName2 = "transition" + j + ".wav"
        const audioContent = fs.readFileSync(`${outputDir}${fileName2}`)
        const result = await got.post(url, {
          headers: {
            "X-NLS-Token": AliKey.Token,
            "Content-type": "application/octet-stream",
            "Content-Length": audioContent.length.toString(),
            "Host": "nls-gateway.cn-shanghai.aliyuncs.com"
          },
          body: audioContent,
          responseType: 'json'
        })
        //第一次赋值，之后合并sentences
        if (result.body.status === 20000000) {
          if (j === 0) {
            allResult = result.body
            allResult.flash_result = {
              sentences: []
            }
            allResult.flash_result.sentences[0] = {
              text: result.body.result,
              begin_time: j * AliKey.ASRTime * 1000,
              end_time: (j + 1) * AliKey.ASRTime * 1000
            }
          } else {
            allResult.flash_result.sentences.push({
              text: result.body.result,
              begin_time: j * AliKey.ASRTime * 1000,
              end_time: (j + 1) * AliKey.ASRTime * 1000
            })
          }
        }
      }
    } else {
      let url = "https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/FlashRecognizer"
      url = url + "?appkey=" + AliKey.AppKey
      url = url + "&token=" + AliKey.Token
      url = url + "&format=wav"
      const audioContent = fs.readFileSync(inputFile)
      const result = await got.post(url, {
        headers: {
          "Content-type": "application/octet-stream",
          "Content-Length": audioContent.length.toString(),
          "Host": "nls-gateway.cn-shanghai.aliyuncs.com"
        },
        body: audioContent,
        responseType: 'json'
      })
      allResult = result.body
    }
    //解析
    let outputText = '', outputTextTime = ''
    if (allResult.status === 20000000) {
      const sentences = allResult.flash_result.sentences
      for (let i = 0, len = sentences.length; i < len; i++) {
        outputText = outputText + sentences[i].text + '\n'
        outputTextTime = outputTextTime + sentences[i].begin_time + '>>>' + sentences[i].end_time + '\n'
      }
    }
    return {
      outputText: outputText,
      outputTextTime: outputTextTime
    }
  }

  //搜索音乐 懒得翻译php源码了 可自行去https://github.com/maicong/music下载搭建 或百度多站合一音乐搜索解决方案自己找个网站
  async searchMusicBase(form: { input: string, filter: string, type: string, page: number }) {
    const DownApi = store.get('settings.General.DownApi')
    const result = await got.post(DownApi, {
      headers: {
        "x-requested-with": "XMLHttpRequest"
      },
      form: {
        input: form.input,
        filter: form.filter,
        type: form.type,
        page: form.page
      },
      responseType: 'json'
    })
    for (let i = 0, len = result.body.data.length; i < len; i++) {
      if (!result.body.data[i].title) result.body.data[i].title = '暂无'
      if (!result.body.data[i].pic) result.body.data[i].pic = ''
      if (!result.body.data[i].lrc) result.body.data[i].lrc = '[00:00.00] 暂无歌词'
      if (!/\[00:(\d{2})\./.test(result.body.data[i].lrc)) {
        result.body.data[i].lrc = '[00:00.00] 无效歌词'
      }
      result.body.data[i].src = result.body.data[i].url
      if (!result.body.data[i].author) {
        result.body.data[i].artist = '暂无'
      } else {
        result.body.data[i].artist = result.body.data[i].author
      }
      delete result.body.data[i].url
      delete result.body.data[i].author
    }
    return result.body
  }

  //下载音乐
  async downMusicBase(url: string, name: string) {
    let workDir = store.get('settings.General.WorkDir')
    !workDir ? workDir = pathResolve('') : null
    const outputDir = workDir + "\\Download\\"
    fse.ensureDirSync(outputDir)
    name = name + ".mp3"
    const outputFile = `${outputDir}${name}`
    fse.removeSync(outputFile)
    await pipeline(got.stream(url), fs.createWriteStream(outputFile, {'flags': 'a'}))
  }
}
