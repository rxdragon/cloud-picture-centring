const ApiException = [
  [0xA11001001, 'Token过期'],
  [0xA11001002, '缺少Token'],
  [0xA11001003, '机构不存在'],
  [0xA11001004, '不匹配的流水'],
  [0xA11001005, '存在未认领流水'],
  [0xA11001006, '不匹配的产品'],
  [0xA11001007, '密钥错误'],
  [0xA11001008, '非拼接产品不可拼接']
]

const CardException = [
  [0xA11010001, '此类卡片已使用']
]

const CheckPoolException = [
  [0xA11006001, '还存在未抽片'],
  [0xA11006002, '抽取失败'],
  [0xA11006003, '参数错误'],
  [0xA11006004, '正在抽片中'],
  [0xA11006005, '暂无数据']
]

const CommonException = [
  [0xA11011001, '请登录']
]

const HourGlassException = [
  [0xA11008001, '修图标准或产品必须要有其一']
]

const ImpulseException = [
  [0xA11007001, '伙伴或机构号必须有其一']
]

const OrderException = [
  [0xA11009001, '订单存在已处理流水']
]

const OrgException = [
  [0xA11014001, '已存在机构账号'],
  [0xA11014002, '已存在机构名'],
  [0xA11014003, '已存在机构代号']
]

const ProductException = [
  [0xA11002001, '产品状态异常'],
  [0xA11002002, '海草收益数目不对'],
  [0xA11002003, '普通收益数目不对'],
  [0xA11002004, '拼接收益数目不对'],
]

const QueueException = [
  [0xA11012001, '需要对象']
]

const StaffException = [
  [0xA11003001, '修改角色组同步权限失败'],
  [0xA11003002, '伙伴未登录'],
  [0xA11003003, '角色组创建失败'],
  [0xA11003004, '账号已存在'],
  [0xA11003005, '账号创建失败'],
  [0xA11003006, '产品赋予失败'],
  [0xA11003007, '名称含非法字符'],
  [0xA11003008, '账号编辑失败'],
  [0xA11003009, '账号编辑失败'],
  [0xA11003010, '账号已在云端存在']
]

const StreamException = [
  [0xA11004001, '不匹配的产品'],
  [0xA11004002, '无法加急'],
  [0xA11004003, '存在在修流水'],
  [0xA11004004, '存在在审流水'],
  [0xA11004005, '没有匹配的照片'],
  [0xA11004006, '不匹配的伙伴'],
  [0xA11004007, '仅缦图单可挂起'],
  [0xA11004008, '无法重复加急']
]

const TagException = [
  [0xA11005001, '该字段不能查询'],
  [0xA11005002, '非允许字段表']
]

export const errText = [
  ...ApiException,
  ...CardException,
  ...CheckPoolException,
  ...CommonException,
  ...HourGlassException,
  ...ImpulseException,
  ...OrderException,
  ...OrgException,
  ...ProductException,
  ...QueueException,
  ...StaffException,
  ...StreamException,
  ...TagException
]
let errMap = new Map(errText)
export const errorCode = {
  getMsg: (err) => {
    let codeNum = Number(err.error_code)
    return errMap.get(codeNum) || JSON.stringify(err.error_msg)
  }
}