import axios from '@/plugins/axios.js'

/**
 * @description 获取全部产品
 */
export function getAllProduct () {
  return axios({
    url: '/project_cloud/common/getAllProduct',
    method: 'get'
  }).then(msg => {
    const createData = [
      {
        value: 'blue',
        label: '蓝标',
        children: []
      }, {
        value: 'master',
        label: '大师',
        children: []
      }, {
        value: 'kids',
        label: 'kids',
        children: []
      }, {
        value: 'mainto',
        label: '缦图',
        children: []
      }
    ]
    msg.forEach(productItem => {
      const findType = createData.find(typeItem => typeItem.value === productItem.retouch_standard)
      if (findType) {
        findType.children.push({
          label: productItem.name,
          value: productItem.id
        })
      }
    })
    return createData
  })
}

/**
 * @description 获取产品面板数据
 * @param {Array} disabledId 禁止移动
 */
export function getAllProductPanel (disabledId = []) {
  return axios({
    url: '/project_cloud/common/getAllProduct',
    method: 'get'
  }).then(msg => {
    let createData = [
      {
        id: -1,
        pid: 0,
        name: 'blue',
        label: '蓝标',
        children: []
      }, {
        id: -2,
        pid: 0,
        name: 'master',
        label: '大师',
        children: []
      }, {
        id: -3,
        pid: 0,
        name: 'kids',
        label: 'kids',
        children: []
      }, {
        id: -4,
        pid: 0,
        name: 'mainto',
        label: '缦图',
        children: []
      }
    ]
    msg.forEach(productItem => {
      const findType = createData.find(typeItem => typeItem.name === productItem.retouch_standard)
      if (findType) {
        const productInfo = {
          children: [],
          id: productItem.id,
          pid: findTypeId(findType.name),
          label: productItem.name
        }
        productInfo.disabled = disabledId.includes(productItem.id)
        findType.children = [...findType.children, productInfo]
      }
    })
    createData = createData.filter(listItem => listItem.children.length)
    return createData
  })
}

/**
 * @description 获取全部产品选择框数据
 */
export function getAllProductSelect (retouchStandard) {
  return axios({
    url: '/project_cloud/common/getAllProduct',
    method: 'get'
  }).then(msg => {
    const products = msg.filter(productItem => productItem.retouch_standard === retouchStandard)
    const productsList = products.map(productItem => {
      return {
        name: productItem.name,
        id: productItem.id,
        retouchStandard
      }
    })
    return productsList
  })
}

function findTypeId (value) {
  switch (value) {
    case 'blue':
      return -1
    case 'master':
      return -2
    case 'kids':
      return -3
    case 'mainto':
      return -4
    default:
      return -1
  }
}
