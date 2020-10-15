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

export const PHOTO_VERSION = {
  STORE_REWORK: 'store_rework', // 门店退回的照片version
  ORIGINAL_PHOTO: 'original_photo', // 原片
  FIRST_PHOTO: 'first_photo', // 一次成片
  RETURN_PHOTO: 'return_photo', // 审核退回照片
  COMPLETE_PHOTO: 'complete_photo', // 审核成片
  FINISH_PHOTO: 'finish_photo', // 最终成片
  LAST_RETOUCH_PHOTO: 'last_retouch_photo', // 最新修后成片
}

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

// 申诉审核类型
export const APPEAL_CHECK_STATUS = {
  FIRST: 'first', // 初审
  SECOND: 'second' // 复审
}

// 申诉问题类型
export const APPEAL_TYPE = {
  REWORK: 'rework'
}

// 申诉问题类型
export const AppealTypeNameEnum = {
  [APPEAL_TYPE.REWORK]: '门店退单问题'
}

// 申诉流水状态
export const APPEAL_STREAM_STATUS = {
  WAIT_FIRST: 'wait_first',
  FIRST_EXAMINE: 'first_examine',
  WAIT_SECOND: 'wait_second',
  SECOND_EXAMINE: 'second_examine',
  FINISH: 'finish',
  EXPIRE: 'expire'
}

// 申诉流水状态
export const AppealStreamStatusEnum = {
  [APPEAL_STREAM_STATUS.WAIT_FIRST]: '等待初审',
  [APPEAL_STREAM_STATUS.FIRST_EXAMINE]: '初审中',
  [APPEAL_STREAM_STATUS.WAIT_SECOND]: '等待复审',
  [APPEAL_STREAM_STATUS.SECOND_EXAMINE]: '复审中',
  [APPEAL_STREAM_STATUS.FINISH]: '处理完成',
  [APPEAL_STREAM_STATUS.EXPIRE]: '超时未处理'
}

// 申诉审核结果状态
export const APPEAL_RESULT_STATUS = {
  WAIT: 'wait',
  ACCEPT: 'accept',
  PART_ACCEPT: 'part_accept',
  REFUSE: 'refuse'
}

// 流水申诉审核结果状态枚举
export const AppealResultStatusEnum = {
  [APPEAL_RESULT_STATUS.WAIT]: '待审核',
  [APPEAL_RESULT_STATUS.ACCEPT]: '全部审核通过',
  [APPEAL_RESULT_STATUS.PART_ACCEPT]: '部分审核通过',
  [APPEAL_RESULT_STATUS.REFUSE]: '审核拒绝'
}

// 申诉审核结果状态
export const APPEAL_RESULT_STATUS_PHOTO = {
  PHOTO_RESULT_ACCEPT: 'accept',
  PHOTO_RESULT_REFUSE: 'refuse'
}
// 照片申诉审核结果状态枚举
export const AppealResultStatusPhotoEnum = {
  [APPEAL_RESULT_STATUS_PHOTO.PHOTO_RESULT_ACCEPT]: '审核通过',
  [APPEAL_RESULT_STATUS_PHOTO.PHOTO_RESULT_REFUSE]: '审核拒绝'
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

/**
 * @description 自动修图模式
 */
export const PHOTO_FLAG = {
  ORIGINAL: 'original',
  CROP: 'crop',
  WARP: "warp"
}

/**
 * @description 照片类型
 */
export const PHOTO_TYPE = {
  NORMAL_TYPE: 'normal', // 正常
  TEMPLATE_TYPE: 'template', // 模版
  SPLICE_TYPE: 'splice' // 拼接
}

// 通知功能授权状态
export const NOTIFY_STATUS = {
  DEFAULT: 'default', // 询问
  GRANTED: 'granted', // 已授权
  DENIED: 'denied' // 拒绝授权
}
