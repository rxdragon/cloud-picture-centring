import axios from '@/plugins/axios.js'
import uuidv4 from 'uuid'

/**
 * @description 获取云学院评分权重
 * @method GET
 * @returns {Number} 权重值
 * @author cf 2020/04/13
 * @version @version 2.4.0
 */
export function getWeightsScore () {
  return axios({
    url: '/project_cloud/checkPool/getWeightsScore',
    method: 'GET'
  }).then(msg => {
    return msg
  })
}

/**
 * @description 获取云学院评分权重
 * @method POST
 * @returns {Number} 权重值
 * @author cf 2020/04/13
 * @version @version 2.4.0
 */
export function setWeightsScore (params) {
  return axios({
    url: '/project_cloud/checkPool/setWeightsScore',
    method: 'POST',
    data: params
  })
}

/**
 * @description 获取云学院评分配置
 * @method GET
 * @returns {Number} 权重值
 * @author cf 2020/04/13
 * @version @version 2.4.0
 */
export function getScoreConfigList () {
  return axios({
    url: '/project_cloud/checkPool/getScoreConfigList',
    method: 'GET'
  }).then(msg => {
    msg.forEach(issueClass => {
      issueClass.isEdit = false
      issueClass.key = uuidv4()
      issueClass.child.forEach(issueItem => {
        issueItem.isEdit = false
      })
    })
    return msg
  })
}

/**
 * @description 修改评分单项
 * @method PUT
 * @returns {Number} 权重值
 * @author cf 2020/04/13
 * @version @version 2.4.0
 */
export function editChildScoreConfig (params) {
  return axios({
    url: '/project_cloud/checkPool/editChildScoreConfig',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 修改评分大项
 * @method PUT
 * @returns {Number} 权重值
 * @author cf 2020/04/13
 * @version @version 2.4.0
 */
export function editScoreConfig (params) {
  return axios({
    url: '/project_cloud/checkPool/editScoreConfig',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 添加新评分大项
 * @method POST
 * @returns {Number} 权重值
 * @author cf 2020/04/13
 * @version @version 2.4.0
 */
export function addScoreConfig (params) {
  return axios({
    url: '/project_cloud/checkPool/addScoreConfig',
    method: 'POST',
    data: params
  })
}

/**
 * @description 删除问题标签
 * @method PUT
 * @returns {Array} 标记数据
 * @author cf 2020/04/13
 * @version @version 2.4.0
 */
export function delScoreConfig (params) {
  return axios({
    url: '/project_cloud/checkPool/delScoreConfig',
    method: 'PUT',
    data: params
  })
}
