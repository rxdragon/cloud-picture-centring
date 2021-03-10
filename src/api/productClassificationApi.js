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
