import MicroWebSocket from 'mainto-jssdk/socket/MicroWebsocket'
import handleMessage from './handleMessage'
import axios from '@/plugins/axios.js'
import store from '@/store'
import * as SessionTool from '@/utils/sessionTool.js'
import { readConfig } from '@/utils/electronConfig'

/**
 * @description 获取ws票据
 */
function getWebSocketSignature () {
  return axios({
    url: '/project_cloud/common/getWebSocketSignature',
    method: 'GET'
  }).then(msg => {
    return msg
  })
}

function getUrlHost (url) {
  return new URL(url).host
}

export class Ws {
  chat = null
  state = 'unConnect' // unconnect connecting connected
  sendList = [] // 需要发送的消息列表

  constructor () {
    this.connect()
  }
  // 创建websocket
  async createChat () {
    if (!this.chat) {
      await this.connect()
    }
  }

  // 获取chat
  async getChat () {
    if (!this.chat) { await this.createChat() }
    return this.chat
  }

  // 发送消息
  async sendMessage (msg) {
    if (!this.chat) { await this.createChat() }
    if (this.state === 'connected') {
      this.chat.send(msg)
    } else {
      this.sendList.push(msg)
    }
  }

  initializeSendMessage (isRetoucher) {
    if (!isRetoucher) return
    const firstSendType = ['StreamPhotographerOrgReturn', 'StreamReviewerReturn', 'StreamRetoucherReceive']
    for (const type of firstSendType) {
      this.sendMessage({ typeName: type })
    }
  }

  // 链接websocket
  connect (options) {
    return new Promise(async resolve => {
      if (this.state === 'connecting') return
      // 未登录
      const xstreamId = SessionTool.getXStreamId('xStreamId')
      const user = SessionTool.getUserInfo('userInfo')
      if (!xstreamId || !user) return
      try {
        const WebSocketSignature = await getWebSocketSignature()
        console.log(WebSocketSignature)
        // 初始化socket配置
        const chat = new MicroWebSocket()
        const url = getUrlHost(readConfig('microApi') || process.env.VUE_APP_BASE_API)
        chat.debugMode = false // 是否开启debug模式
        chat.autoReconnect = true // 断线后是否自动链接
        chat.useSafe = true // https 下必开启
        chat.domain = url // websocekt 域名
        chat.roomName = WebSocketSignature.room // 主房间名册
        chat.roomAlias = WebSocketSignature.alias // 子房间名称
        chat.checkStr = WebSocketSignature.check // 密钥
        chat.otherOptions = Object.assign({}, options, {
          expired: WebSocketSignature.expired, // 过期时间
          stream: xstreamId,
          // 后端网关服务兼容
          other: ''
        })
        // 消息到来时触发
        chat.onMessageCallback = data => {
          handleMessage(data)
        }
        // websocket第一次连接时调用
        chat.onFirstConnectCallback = () => {
          this.state = 'connected'
          console.log(store.state.permission.isRetoucher, 'connected')
          if (this.sendList.length) {
            this.sendList.map(item => this.sendMessage(item))
            this.sendList = []
          }
        }
        // 错误时触发
        chat.onErrorCallback = () => {
          this.state = 'unconnect'
        }
        // 断开连接时触发
        chat.onDisconnectCallback = () => {
          this.state = 'unconnect'
        }
        // 连接到远程服务器
        chat.start()
        this.state = 'connecting'
        this.chat = chat
        resolve()
      } catch (error) {
        console.error(error)
      }
    })
  }
}
