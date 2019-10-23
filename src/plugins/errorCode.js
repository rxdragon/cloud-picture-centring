export const errText = [
  [
    [0xB10000022, '产品状态异常'],
    [0xB00101001, '修改角色组同步权限失败'],
    [0xB00101002, '伙伴未登录'],
    [0xB00101003, '角色组创建失败'],
    [0xB00101004, '账号已存在'],
    [0xB00101005, '账号创建失败'],
    [0xB00101006, '产品赋予失败'],
    [0xB00101007, '名称含非法字符'],
    [0xB00101008, '账号编辑失败'],
    [0xB10000010, '该字段不能查询'],
    [0xB10000011, '非允许字段表']
  ]
]
let errMap = new Map(errText)
export const errorCode = {
  getMsg: (err) => {
    let codeNum = Number(err.error_code)
    const hexCode = `0x${codeNum.toString(16).toUpperCase()}`
    return errMap.get(hexCode) || JSON.stringify(err.error_msg)
  }
}