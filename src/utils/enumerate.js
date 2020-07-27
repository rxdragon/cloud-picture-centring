// enumerate

// 修图标准
export const RETOUCH_STANDARD = {
  BLUE: 'blue',
  MASTER: 'master',
  KIDS: 'kids',
  MAINTO: 'mainto'
}

// 修图标准映射中文
export const retouchStandardToCN = {
  [RETOUCH_STANDARD.BLUE]: '蓝标',
  [RETOUCH_STANDARD.MASTER]: '大师',
  [RETOUCH_STANDARD.KIDS]: 'kids',
  [RETOUCH_STANDARD.MAINTO]: '缦图'
}

// 流水状态
export const StreamState = {
  wait_retouch: '待修图',
  retouching: '修图中',
  review_return_retouch: '审核退回修图中',
  wait_review: '等待审核',
  reviewing: '审核中',
  finish: '审核完成',
  store_return_retouch: '门店退回',
  hanging: '挂起中'
}

export const StreamStateEnum = {
  WaitRetouch: 'wait_retouch',
  Retouching: 'retouching',
  ReviewReturnRetouch: 'review_return_retouch',
  WaitReview: 'wait_review',
  Reviewing: 'reviewing',
  Finish: 'finish',
  StoreReturnRetouch: 'store_return_retouch',
  Hanging: 'hanging'
}

// 流水静态状态资源
export const StreamStatics = {
  StoreReturn: 'store_rework',
  CheckReturn: 'rework'
}

// 照片静态状态资源
export const PhotoStatics = {
  StoreReturn: 'store_rework',
  CheckReturn: 'return_photo'
}

// 照片状态
export const PhotoEnum = [
  'original_photo', // 原片
  'first_photo', // 一次成片
  'return_photo', // 退回照片
  'complete_photo', // 审核成片
  'last_retouch_photo', // 最新修照片
  'finish_photo' // 最终成片
]

// 没有重修返回字段
export const NoReturnPhotoEnum = [
  'original_photo', // 原片
  'complete_photo', // 审核成片
  'last_retouch_photo', // 最新修照片
  'finish_photo' // 最终成片
]

// 有重修返回字段
export const ReturnOnePhotoEnum = [
  'original_photo',
  'first_photo',
  'complete_photo',
  'last_retouch_photo',
  'finish_photo'
]

export const StoreReturnPhoto = [
  'store_rework' // 门店退回
]

export const PhotoEnumName = {
  OriginalPhoto: '原片',
  FirstPhoto: '一次成片',
  ReturnPhoto: '退回照片',
  CompletePhoto: '云端成片',
  FinishPhoto: '顾客满意片',
  original_photo: '原片',
  first_photo: '一次成片',
  return_photo: '退回照片',
  complete_photo: '云端成片',
  finish_photo: '顾客满意片',
  store_rework: '门店退回',
  last_retouch_photo: '最新成片'
}

// 搜索类型
export const SearchType = {
  CheckPlant: 'checkPlant', // 审核种草
  CheckPull: 'checkPull', // 审核拔草
  SpotPlant: 'spotPlant', // 抽查种草
  SpotPull: 'spotPull', // 抽查拔草
  SpotNone: 'none', // 抽查不种不拔
  RectifyPlant: 'rectifyPlant', // 意见不同纠偏种草
  RectifyPull: 'rectifyPull', // 意见不同纠偏拔草
  RectifyNone: 'rectifyNone', // 不中不拔
  RectifySame: 'rectifySame', // 意见相同
  RectifyDifferent: 'rectifyDifferent', // 意见不同
  GoodEvaluation: 'goodEvaluation', // 点赞数
  BadEvaluation: 'badEvaluation', // 点赞数
  ReworkStream: 'reworkStream', // 退单量
  ReworkPhoto: 'reworkPhoto', // 退单张数
  QualityRework: 'qualityRework', // 质量退单
  NotQualityRework: 'notQualityRework', // 非质量退单

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

export const PLANT_ID_MAP = {
  PLANT_ID: '1', // 种草id
  PULL_ID: '2', // 拔草id
  NONE_ID: '3' // 一般id
}

// 云学院打分类型
export const GRADE_TYPE = {
  PLANT: 'plant',
  PULL: 'pull',
  NONE: 'none'
}
// 种拔草id对应type
export const PlantIdTypeEnum = {
  [PLANT_ID_MAP.PLANT_ID]: 'plant',
  [PLANT_ID_MAP.PULL_ID]: 'pull',
  [PLANT_ID_MAP.NONE_ID]: 'none'
}

// 种拔草type对应id
export const PlantTypeIdEnum = {
  'plant': PLANT_ID_MAP.PLANT_ID,
  'pull': PLANT_ID_MAP.PULL_ID,
  'none': PLANT_ID_MAP.NONE_ID
}

// 种拔草type对应name
export const PlantTypeNameEnum = {
  'plant': '种草',
  'pull': '拔草',
  'none': '一般'
}

/**
 * @description 搜索角色
 */
export const SEARCH_ROLE = {
  GROUP_LEADER: 'groupLeader', // 修图组长
  OPERATE: 'operate' // 运营
}

/**
 * @description 搜索角色
 */
export const CLOUD_ROLE = {
  CREW: 'crew', // 修图组员
  GROUP_LEADER: 'groupLeader', // 修图组长
  OPERATE: 'operate' // 运营
}

// 照片问题标记
export const QUALITY_TYPE = {
  QUALITY: 'quality',
  NOT_QUALITY: 'not_quality',
  BOTH: 'both'
}

// 照片问题标记映射中文
export const qualityTypeToCN = {
  [QUALITY_TYPE.QUALITY]: '质量问题',
  [QUALITY_TYPE.NOT_QUALITY]: '非质量问题',
  [QUALITY_TYPE.BOTH]: '质量&非质量问题'
}
