import axios from '@/plugins/axios.js'


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
    url: `/project_cloud/showPicPool/addScoreType`,
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
    url: '/project_cloud/showPicPool/editScoreType',
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
    url: '/project_cloud/showPicPool/addScoreConfig',
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
    url: '/project_cloud/showPicPool/editScoreConfig',
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
    url: '/project_cloud/showPicPool/delScoreConfig',
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
    url: '/project_cloud/showPicPool/getScoreConfig',
    method: 'GET'
  })
}
