import axios from '@/plugins/axios.js'

/**
 * @description 添加权重分类
 * @param {*} params
 */
export async function addQueueWeightType (params) {
  const res = await axios({
    url: '/project_cloud/product/addQueueWeightType',
    method: 'POST',
    data: params
  })
  // 返回添加成功id
  return res.msg
}

/**
 * @description 编辑权重分类
 * @param {*} params
 */
export async function editQueueWeightType (params) {
  const res = await axios({
    url: '/project_cloud/product/editQueueWeightType',
    method: 'POST',
    data: params
  })
  // 返回添加成功id
  return res.msg
}

/**
 * @description 获取队列权重列表, 分页
 */
export async function getQueueWeightTypeList (params) {
  const urgentNameMap = {
    urgent_weight: '普通加急',
    customer_urgent_v1: 'V1会员加急',
    customer_urgent_v2: 'V2会员加急',
    customer_urgent_v3: 'V3会员加急',
    customer_urgent_v4: 'V4会员加急',
  }

  return axios({
    url: '/project_cloud/product/getQueueWeightTypeList',
    method: 'POST',
    data: params
  }).then(res => {
    res.items.forEach(data => {
      data.operatorName = _.get(data, 'operatorInfo.name') || '-'
      data.customer_urgent_weight.urgent_weight = data.urgent_weight
      data.customerUrgentWeight = Object.entries(urgentNameMap)
        .map(([key, value]) => {
          return {
            title: value,
            value: data.customer_urgent_weight[key]
          }
        })
      data.take_photo_time = {
        value: _.get(data, 'take_photo_time_set.value') || 0,
        unit: _.get(data, 'take_photo_time_set.unit') || ''
      }
      data.critical_take_photo_time = {
        value: _.get(data, 'critical_take_photo_time.value') || 0,
        unit: _.get(data, 'critical_take_photo_time.unit') || '',
      }
    })

    return res
  })
}


/**
 * @description 获取队列权重列表, 不分页的
 */
export async function getAllQueueWeightType () {
  return axios({
    url: '/project_cloud/product/getAllQueueWeightType',
    method: 'GET'
  })
}


/**
 * @description 检查是否可以刷新队列
 */
export async function canRefreshQueue () {
  return axios({
    url: '/project_cloud/product/canRefreshQueue',
    method: 'GET'
  })
}

/**
 * @description 刷新队列
 */
export async function refreshQueue () {
  return axios({
    url: '/project_cloud/product/refreshQueue',
    method: 'POST'
  })
}
