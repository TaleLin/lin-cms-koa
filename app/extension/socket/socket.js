import http from 'http'
import Ws from 'ws'
import { config, jwt } from 'lin-mizar';
import { URLSearchParams } from 'url'
import { set, get } from 'lodash'
import { UserGroupModel } from '../../model/user-group';

const USER_KEY = Symbol('user')

const INTERCEPTORS = Symbol('WebSocket#interceptors')

const HANDLE_CLOSE = Symbol('WebSocket#close')

const HANDLE_ERROR = Symbol('WebSocket#error')

class WebSocket {
  constructor(app) {
    this.app = app
    this.wss = null
    this.sessions = new Set()
  }

  /**
   * 初始化，挂载 socket
   */
  init() {
    const server = http.createServer(this.app.callback())
    this.wss = new Ws.Server({
      path: config.getItem('socket.path', '/ws/message'),
      noServer: true
    })

    server.on('upgrade', this[INTERCEPTORS].bind(this));

    this.wss.on('connection', (socket) => {
      socket.on('close', this[HANDLE_CLOSE].bind(this))
      socket.on('error', this[HANDLE_ERROR].bind(this))
    })

    this.app.context.websocket = this
    return server
  }

  [INTERCEPTORS](request, socket, head) {
    // 是否开启 websocket 的鉴权拦截器
    if (config.getItem('socket.intercept')) {
      const params = new URLSearchParams(request.url.slice(request.url.indexOf('?')))
      const token = params.get('token')
      try {
        const { identity } = jwt.verifyToken(token)
        this.wss.handleUpgrade(request, socket, head, (ws) => {
          set(ws, USER_KEY, identity)
          this.sessions.add(ws)
          this.wss.emit('connection', ws, request);
        })
      } catch (error) {
        console.log(error.message)
        socket.destroy()
      }
      return
    }
    this.wss.handleUpgrade(request, socket, head, (ws) => {
      this.sessions.add(ws)
      this.wss.emit('connection', ws, request);
    })
  }

  [HANDLE_CLOSE]() {
    for (const session of this.sessions) {
      if (session.readyState === Ws.CLOSED) {
        this.sessions.delete(session)
      }
    }
  }

  [HANDLE_ERROR](session, error) {
    console.log(error)
  }

  /**
   * 发送消息
   *
   * @param {number} userId  用户id
   * @param {string} message 消息
   */
  sendMessage(userId, message) {
    for (const session of this.sessions) {
      if (session.readyState === Ws.OPEN) {
        continue
      }
      if (get(session, USER_KEY) === userId) {
        session.sendMessage(message)
        break
      }
    }
  }

  /**
   * 发送消息
   *
   * @param {WebSocket} session 当前会话
   * @param {string} message 消息
  */
  sendMessageToSession(session, message) {
    session.sendMessage(message)
  }

  /**
   * 广播
   * 
   * @param {string} message 消息 
   */
  broadCast(message) {
    this.sessions.forEach(session => {
      if (session.readyState === Ws.OPEN) {
        session.send(message)
      }
    })
  }

  /**
   * 对某个分组广播
   * 
   * @param {number} 分组id
   * @param {string} 消息
   */
  async broadCastToGroup(groupId, message) {
    const userGroup = await UserGroupModel.findAll({
      where: {
        group_id: groupId
      }
    })
    const userIds = userGroup.map(v => v.getDataValue('user_id'))
    console.log(userIds)
    for (const session of this.sessions) {
      if (session.readyState !== Ws.OPEN) {
        continue
      }
      const userId = get(session, USER_KEY)
      if (!userId) {
        continue
      }
      if (userIds.includes(userId)) {
        session.send(message)
      }
    }
  }

  /**
   * 获取所有会话
   */
  getSessions() {
    return this.sessions
  }

  /**
   * 获得当前连接数
   */
  getConnectionCount() {
    return this.sessions.size
  }
}

export default WebSocket