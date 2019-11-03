// enumerate

// 修图标准
export function RetouchStandard () {
  return {
    blue: '蓝标',
    master: '大师',
    kids: 'kids',
    mainto: '缦图'
  }
}

// 流水状态
export function StreamState () {
  return {
    wait_retouch: '待修图',
    retouching: '修图中',
    review_return_retouch: '审核退回修图中',
    wait_review: '等待审核',
    reviewing: '审核中',
    finish: '已经完成'
  }
}

// 照片状态
export const PhotoEnum = {
  OriginalPhoto: 'original_photo', // 原片
  FirstPhoto: 'first_photo', // 一次成片
  ReturnPhoto: 'return_photo', // 退回照片
  CompletePhoto: 'complete_photo', // 审核成片
  FinishPhoto: 'finish_photo' // 最终成片
}

// 没有重修返回字段
export const NoReturnPhotoEnum = {
  OriginalPhoto: 'original_photo', // 原片
  CompletePhoto: 'complete_photo', // 审核成片
  FinishPhoto: 'finish_photo' // 最终成片
}

// 有重修返回字段
export const ReturnOnePhotoEnum = {
  OriginalPhoto: 'original_photo', // 原片
  FirstPhoto: 'first_photo', // 一次成片
  CompletePhoto: 'complete_photo', // 审核成片
  FinishPhoto: 'finish_photo' // 最终成片
}

export const PhotoEnumName = {
  OriginalPhoto: '原片',
  FirstPhoto: '一次成片',
  ReturnPhoto: '退回照片',
  CompletePhoto: '审核成片',
  FinishPhoto: '最终成片',
  original_photo: '原片',
  first_photo: '一次成片',
  return_photo: '退回照片',
  complete_photo: '审核成片',
  finish_photo: '最终成片'
}

// 搜索类型
export const SearchType = {
  CheckPlant: 'checkPlant', // 审核种草
  CheckPull: 'checkPull', // 审核拔草
  SpotPlant: 'spotPlant', // 抽查种草
  SpotPull: 'spotPull', // 抽查拔草
  RectifyPlant: 'rectifyPlant', // 意见不同纠偏种草
  RectifyPull: 'rectifyPull', // 意见不同纠偏拔草
  RectifyNone: 'rectifyNone', // 不中不把
  RectifySame: 'rectifySame', // 意见相同
  RectifyDifferent: 'rectifyDifferent' // 意见不同
}

export const CardEnum = {
  unused: '未使用',
  using: '使用中',
  manual_end: '提前结束',
  auto_end: '已结束',
  expired: '已过期'
}

// 范围
export const HourGlassSettingEnum = {
  staffEntryTagOneMonth: '0-1个月新人伙伴',
  staffEntryTagTwoMonth: '1-2个月新人伙伴',
  staffEntryTagThreeMonth: '2-3个月新人伙伴',
  staffEntryTagFormal: '正式伙伴'
}

// 权重等级
export const WeightEnum = {
  weight_first: '一类产品',
  weight_second: '二类产品',
  weight_third: '三类产品',
  weight_fourth: '四类产品',
  weight_fifth: '五类产品'
}

// 修图师等级
export const StaffLevelEnum = {
  retouchingAssistant: '修图助理',
  juniorRetoucher: '初级修图师',
  retoucher: '修图师',
  seniorRetoucher: '资深修图师',
  superRetoucher: '高级修图师',
  retouchingExpert: '修图专家',
  seniorRetouchingExpert: '资深修图专家',
  superRetouchingExpert: '高级修图专家',
  chiefRetouchingExpert: '首席修图专家',
  masterCraftsman: '工匠大师',
  chiefCraftsmanMaster: '首席工匠大师'
}
