import uuidv4 from 'uuid'

/**
 * @description 添加产品分类
 * @param {*} params 
 */
export function addClassification (params) {
  return uuidv4()
}

/**
 * @description 编辑产品分类
 * @param {*} params 
 */
export function editClassification (params) {
  return uuidv4()
}

/**
 * @description 获取父类数据
 * @param {*} params 
 */
export function getParentClassificationList (params) {
  return [
    {
      name: '海马体',
      id: '1',
    },
    {
      name: '修修兽',
      id: '2',
    },
    {
      name: '其他',
      id: '3',
    }
  ]
}

/**
 * @description 获取编辑接口列表
 * @param {*} params 
 */
export function getClassificationList (params) {
  return [
    {
      date: '2016-05-02',
      name: '王小虎',
      address: '上海市普陀区金沙江路 1518 弄'
    }, {
      date: '2016-05-04',
      name: '王小虎',
      address: '上海市普陀区金沙江路 1517 弄'
    }, {
      date: '2016-05-01',
      name: '王小虎',
      address: '上海市普陀区金沙江路 1519 弄'
    }, {
      date: '2016-05-03',
      name: '王小虎',
      address: '上海市普陀区金沙江路 1516 弄'
    }
  ]
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
export function getClassificationProductTree (params) {
  // TODO 添加接口
  const mockData = [
    {
      "id": 1,
      "name": "海马体",
      "parent_id": 0,
      "children": [
        {
          "id": 2,
          "name": "限时产品",
          "parent_id": 1,
          "product_list": [
            {
              "id": 65,
              "name": "圣诞照-女生独照-精灵",
              "retouch_standard": "blue"
            },
            {
              "id": 66,
              "name": "圣诞照-女生独照-精灵",
              "retouch_standard": "master"
            },
            {
              "id": 68,
              "name": "圣诞照-女生独照-精灵",
              "retouch_standard": "mainto"
            },
            {
              "id": 69,
              "name": "圣诞照-亲子-精灵",
              "retouch_standard": "kids"
            }
          ]
        },
        {
          "id": 3,
          "name": "功能照",
          "parent_id": 1,
          "product_list": [
            {
              "id": 7,
              "name": "精致证件照 - 正面",
              "retouch_standard": "blue"
            }
          ]
        }
      ]
    },
    {
      "id": 100,
      "name": "修修兽",
      "parent_id": 0,
      "children": [
        {
          "id": 101,
          "name": "限时产品",
          "parent_id": 100,
          "product_list": [
            {
              "id": 65,
              "name": "圣诞照-女生独照-精灵",
              "retouch_standard": "blue"
            },
            {
              "id": 66,
              "name": "圣诞照-女生独照-精灵",
              "retouch_standard": "master"
            },
            {
              "id": 68,
              "name": "圣诞照-女生独照-精灵",
              "retouch_standard": "mainto"
            },
            {
              "id": 69,
              "name": "圣诞照-亲子-精灵",
              "retouch_standard": "kids"
            }
          ]
        },
        {
          "id": 3,
          "name": "功能照",
          "parent_id": 100,
          "product_list": [
            {
              "id": 7,
              "name": "精致证件照 - 正面",
              "retouch_standard": "blue"
            }
          ]
        }
      ]
    }
  ]

  const createData = mockData.map(parentItem => {
    const children1Data = parentItem.children.map(childrenItem => {
      const productList = childrenItem.product_list || []
      const filterProductList = filterRetouchStandard(productList)

      const childrenData = {
        label: childrenItem.name,
        value: childrenItem.id,
        parentId: childrenItem.parent_id,
        children: filterProductList
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

/**
 * @description 获取产品树结构
 * @param {*} params 
 */
export function getClassificationTree (params) {
  // TODO 添加接口
  const mockData = [
    {
      "id": 1,
      "name": "海马体",
      "parent_id": 0,
      "children": [
        {
          "id": 2,
          "name": "限时产品",
          "parent_id": 1
        },
        {
          "id": 3,
          "name": "功能照",
          "parent_id": 1
        }
      ]
    },
    {
      "id": 100,
      "name": "修修兽",
      "parent_id": 0,
      "children": [
        {
          "id": 101,
          "name": "限时产品",
          "parent_id": 100
        },
        {
          "id": 3,
          "name": "功能照",
          "parent_id": 100
        }
      ]
    }
  ]

  // 优化成递归
  const createData = mockData.map(parentItem => {
    const children1Data = parentItem.children.map(childrenItem => {
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
