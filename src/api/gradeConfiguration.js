import axios from '@/plugins/axios.js'
import uuidv4 from 'uuid'
import { PlantIdTypeEnum } from '@/utils/enumerate'

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
    const finalMsg = msg.reduce((finalMsg, msgItem) => {
      const tempObj = {}
      msgItem.score_config.forEach(issueClass => {
        issueClass.isEdit = false
        issueClass.key = uuidv4()
        issueClass.child = issueClass.child || []
        issueClass.child.forEach(issueItem => {
          issueItem.isEdit = false
        })
      })
      tempObj.list = msgItem.score_config
      tempObj.maxScore = msgItem.max_score
      tempObj.minScore = msgItem.min_score
      finalMsg[PlantIdTypeEnum[msgItem.id]] = tempObj
      return finalMsg
    }, {})
    return finalMsg
  })
}


/**
 * @description 获取评分人列表
 * @method GET
 * @returns {Obeject} 结果
 * @author cl 2020/06/24
 * @version @version 2.8.0
 */
export function getTakeStaffList () {
  return axios({
    url: '/project_cloud/checkPool/getTakeStaffList',
    method: 'GET',
  }).then((res) => {
    const list = res.map((item) => {
      return {
        nickname: item.nickname,
        id: item.id,
      }
    })
    return list
  })
}
/**
 * @description 清空评分
 * @method POST
 * @params staffIds 员工id
 * @returns {Obeject} 结果
 * @author cl 2020/06/24
 * @version @version 2.8.0
 */
export function emptyCheckPoolByStaffId (params) {
  return axios({
    url: `/project_cloud/checkPool/emptyCheckPoolByStaffId?${params}`,
    method: 'POST',
    data: params,
  })
}


/**
 * @description 添加云学院类别
 * @method POST
 * @params name 大类名称
 * @returns {id} 大类id
 * @author cl 2021/03/11
 * @version @version 2.24
 */
export function addScoreType (params) {
  return axios({
    url: `/project_cloud/checkPool/addScoreType`,
    method: 'POST',
    data: params
  })
}

/**
 * @description 修改云学院类别
 * @method POST
 * @params name 大类名称， id
 * @returns {id} 小类id
 * @author nx 2021/03/11
 * @version @version 2.24.0
 */
export function editScoreTypeName (params) {
  return axios({
    url: '/project_cloud/checkPool/editScoreType',
    method: 'POST',
    data: params
  })
}

/**
 * @description 添加云学院评分配置
 * @method POST
 * @returns {id} 小类id
 * @author nx 2021/03/11
 * @version @version 2.24.0
 */
export function addScoreConfig (params) {
  return axios({
    url: '/project_cloud/checkPool/addScoreConfig',
    method: 'POST',
    data: params
  })
}

/**
 * @description 修改云学院评分配置
 * @method POST
 * @returns {id} 小类id
 * @author nx 2021/03/11
 * @version @version 2.24.0
 */
export function editScoreConfig (params) {
  return axios({
    url: '/project_cloud/checkPool/editScoreConfig',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 删除云学院评分组
 * @method PUT
 * @returns {id} 小类id
 * @author nx 2021/03/11
 * @version @version 2.24.0
 */
export function delScoreConfig (params) {
  return axios({
    url: '/project_cloud/checkPool/delScoreConfig',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 获取云学院评分配置列表
 * @method PUT
 * @author nx 2021/03/11
 * @version @version 2.24.0
 */
export function getScoreConfig () {
  return axios({
    url: '/project_cloud/checkPool/getScoreConfig',
    method: 'GET'
  })
}
