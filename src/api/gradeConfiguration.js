import axios from '@/plugins/axios.js'
import uuidv4 from 'uuid'
import { PlantIdTypeEnum } from '@/utils/enumerate'

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

/**
 * @description 添加激励词典
 * @method POST
 * @params name 激励词
 * @returns {Obeject} 结果
 * @author cl 2020/06/24
 * @version @version 2.8.0
 */
export function addExcitationDir (params) {
  return axios({
    url: '/project_cloud/checkPool/addExcitationDir',
    method: 'POST',
    data: params
  })
}
/**
 * @description 删除激励词典
 * @method DELETE
 * @params id id
 * @returns {Obeject} 结果
 * @author cl 2020/06/24
 * @version @version 2.8.0
 */
export function delExcitationDir (params) {
  return axios({
    url: `/project_cloud/checkPool/delExcitationDir?id=${params.id}`,
    method: 'DELETE',
  })
}
/**
 * @description 获取激励词列表
 * @method PUT
 * @returns {Obeject} 激励词列表
 * @author cl 2020/06/24
 * @version @version 2.8.0
 */
export function getExcitationDirList (params) {
  return axios({
    url: '/project_cloud/checkPool/getExcitationDirList',
    method: 'GET',
    data: params
  }).then((res) => {
    const list = res.reduce((itemSum, item) => {
      const { name, created_at: createdAt, staff_info: staffInfo, id } = item
      itemSum.push({
        name,
        staffName: staffInfo.nickname,
        createdAt,
        id
      })
      return itemSum
    }, [])
    return list
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
 * @description 分数限制
 * @method POST
 * @params scoreTypeId 大类名称
 * @params minScore 最低分数
 * @params maxScore 最高分数
 * @returns {Obeject} 结果
 * @author cl 2020/06/24
 * @version @version 2.8.0
 */
export function editScoreLimit (params) {
  return axios({
    url: `/project_cloud/checkPool/editScoreLimit`,
    method: 'POST',
    data: params
  })
}
