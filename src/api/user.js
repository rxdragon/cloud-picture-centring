import axios from '@/plugins/axios.js'
import * as SessionTool from '@/utils/sessionTool.js'

/**
 * @description 使用token进行登录
 */
export function login (params) {
  return axios({
    url: '/manage_auth/login/sso',
    method: 'GET',
    headers: { 'X-Expose-Headers': 'X-Stream-Id, x-stream-id' },
    params
  })
}

/**
 * @description 获取用户信息
 */
export function info () {
  return axios({
    url: '/project_cloud/common/getSelfInfo',
    method: 'GET'
  })
}

/**
 * @description 判断缓存是否过期
 */
export function userExpire () {
  return axios({
    url: '/user_auth/auth/expire',
    method: 'GET'
  }).then(msg => {
    SessionTool.setXStreamIdExpireTime(msg)
    return msg
  })
}

/**
 * @description 退出登入
 */
export function logout () {
  return axios({
    url: '/manage_auth/logout',
    method: 'GET'
  }).then(() => {
    localStorage.clear()
    SessionTool.removeSession()
  })
}
