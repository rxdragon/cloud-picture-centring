import axios from '@/plugins/axios.js'
import ProductClassificationListModel from '@/model/ProductClassificationListModel.js'

/**
 * @description 添加产品分类
 * @param {*} params 
 */
export async function addClassification (params) {
  const res = await axios({
    url: '/project_cloud/product/category/add',
    method: 'POST',
    data: params
  })
  // 返回添加成功id
  return res.msg

}

/**
 * @description 编辑产品分类
 * @param {*} params 
 */
export async function editClassification (params) {
  const res = await axios({
    url: '/project_cloud/product/category/edit',
    method: 'POST',
    data: params
  })
  return res
}

/**
 * @description 根据父级id获取分类信息
 * @param {*} params 
 */
export async function getParentClassificationList (params) {
  const res = await axios({
    url: '/project_cloud/product/category/list',
    method: 'POST',
    data: params
  })

  const createData = res.map(item => {
    return new ProductClassificationListModel(item)
  })
  return createData
}

/**
 * @description 过滤修图信息
 * @param {*} data 
 * @returns 
 */
function filterRetouchStandard (data) {
  let createData = [
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
  data.forEach(productItem => {
    const findType = createData.find(typeItem => typeItem.value === productItem.retouch_standard)
    if (findType) {
      findType.children.push({
        label: productItem.name,
        value: productItem.id
      })
    }
  })
  createData = createData.filter(item => item.children.length)
  return createData
}

/**
 * @description 获取分类产品树
 * @param {*} params 
 * @returns 
 */
export async function getClassificationProductTree (params) {
  const res = await axios({
    url: '/project_cloud/common/getProductCategoryTree',
    method: 'GET',
    params
  })

  const createData = res.map(parentItem => {
    const children = _.get(parentItem, 'children') || []
    const children1Data = children.map(childrenItem => {
      const productList = childrenItem.products || []
      const filterProductList = filterRetouchStandard(productList)

      const childrenData = {
        label: childrenItem.name,
        value: childrenItem.id,
        parentId: childrenItem.parent_id,
        children: filterProductList,
        productCount: productList.length
      }
      return childrenData
    })
    const filterEmtpyProduct = children1Data.filter(item => item.children.length)

    const parentData = {
      label: parentItem.name,
      value: parentItem.id,
      parentId: parentItem.parent_id,
      children: filterEmtpyProduct
    }
    return parentData
  })
  let filterEmtpyClass = createData.filter(item => item.children.length)
  // 过滤修修兽类型
  if (!params.showPicProduct) {
    filterEmtpyClass = filterEmtpyClass.filter(item => item.label !== '修修兽')
  }
  if (!params.himoProduct) {
    filterEmtpyClass = filterEmtpyClass.filter(item => item.label !== '海马体')
  }
  return Object.freeze(filterEmtpyClass)
}

/**
 * @description 获取产品树结构
 * @param {*} params 
 */
export async function getClassificationTree (params) {
  const res = await axios({
    url: '/project_cloud/common/getProductCategoryTree',
    method: 'GET',
    params
  })

  // 优化成递归
  const createData = res.map(parentItem => {
    const children = _.get(parentItem, 'children') || []
    const children1Data = children.map(childrenItem => {
      const childrenData = {
        label: childrenItem.name,
        value: childrenItem.id,
        parentId: childrenItem.parent_id,
      }
      return childrenData
    })

    const parentData = {
      label: parentItem.name,
      value: parentItem.id,
      parentId: parentItem.parent_id,
      children: children1Data
    }
    return parentData
  })
  return createData
}
