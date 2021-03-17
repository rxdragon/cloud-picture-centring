import axios from '@/plugins/axios.js'
import { GRADE_LABEL_TYPE } from '@/utils/enumerate'

function getUrl (type) {
  return type === GRADE_LABEL_TYPE.CLOUD ? '/project_cloud/checkPool' : '/project_cloud/showPicPool'
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
  const url = getUrl(params.gradeType) + '/addScoreType'
  delete params.gradeType
  return axios({
    url,
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
  const url = getUrl(params.gradeType) + '/editScoreType'
  delete params.gradeType
  return axios({
    url,
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
  const url = getUrl(params.gradeType) + '/addScoreConfig'
  delete params.gradeType
  return axios({
    url,
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
  const url = getUrl(params.gradeType) + '/editScoreConfig'
  delete params.gradeType
  return axios({
    url,
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
  const url = getUrl(params.gradeType) + '/delScoreConfig'
  delete params.gradeType
  return axios({
    url,
    method: 'PUT',
    data: params
  })
}

/**
 * @description 获取云学院评分配置列表
 * @method GET
 * @author nx 2021/03/11
 * @version @version 2.24.0
 */
export function getScoreConfig (gradeType = GRADE_LABEL_TYPE.CLOUD) {
  const url = getUrl(gradeType) + '/getScoreConfig'
  return axios({
    url,
    method: 'GET'
  })
}

/**
 * @description 获取云学院老数据评分配置列表，假删除的那些
 * @method GET
 * @author nx 2021/03/11
 * @version @version 2.24.0
 */
export function getOldIssueList (gradeType = GRADE_LABEL_TYPE.CLOUD) {
  const url = getUrl(gradeType) + '/getOldScoreConfigList'
  return axios({
    url,
    method: 'GET'
  })
}


/**
 * @description 获取云学院评分配置列表, 用于编辑
 * @method PUT
 * @author nx 2021/03/11
 * @version @version 2.24.0
 */
export async function getScoreConfigByEdit (gradeType = GRADE_LABEL_TYPE.CLOUD) {
  const url = getUrl(gradeType) + '/getScoreConfig'
  const res = await axios({
    url,
    method: 'GET'
  })
  res.forEach(tab => {
    tab.isEdit = false
    tab.editName = tab.name
    if (!tab.children) tab.children = []
    tab.children.forEach(group => {
      group.isNew = false
      group.isEdit = false
      group.editName = group.name
      if (!group.children) group.children = []
      group.children.forEach(score => {
        score.editScore = score.score
      })
    })
  })

  return res
}
