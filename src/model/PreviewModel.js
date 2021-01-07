import { PHOTO_VERSION } from '@/utils/enumerate'
const completePhoto = [PHOTO_VERSION.FIRST_PHOTO]

export default class PreviewModel {
  id = ''
  version = 'original_photo'
  path = ''
  mode = 'original'
  storePartReworkReason = [] // 局部问题标签对象
  storeReworkReason = []
  storeReworkReasonManage = [] // 整体问题标签对象
  storeReworkNote = []
  hasStoreReturnTag = false
  commitInfo = {}
  hasCommitInfo = false
  versionCache = null

  constructor (photoItem) {
    this.id = photoItem.id
    this.version = photoItem.version
    this.path = photoItem.path
    this.getStoreReaseon(photoItem)
    this.getHasStoreReturnTag()
    this.getCommitInfo(photoItem)
    this.getMode()
    this.getVersionCache(photoItem)
  }

  // 获取门店退单信息
  getStoreReaseon (photoItem) {
    if (!photoItem.tags) return
    const newStorePartReworkReason = _.get(photoItem, 'tags.values.origin_return_labels.store_part_rework_reason')
    const oldStorePartReworkReason = _.get(photoItem, 'tags.values.store_part_rework_reason')
    let storePartReworkReason = newStorePartReworkReason || oldStorePartReworkReason || []
    storePartReworkReason = storePartReworkReason.map(labelItem => {
      const createData = labelItem
      const labelTop = createData.location[0]
      const labelLeft = createData.location[1]
      // 判断标记在哪个象限
      if (labelTop <= 50) createData.labelClass = labelLeft <= 50 ? 'top-left' : 'top-right'
      if (labelTop > 50) createData.labelClass = labelLeft <= 50 ? 'bottom-left' : 'bottom-right'

      // 2.12之后新的局部标签在在labels下面
      if (createData.labels) {
        createData.reason = createData.labels.map(labelItem => labelItem.name)
        createData.reasonManage = [] // 可以进行操作的reason
        createData.labels.forEach(label => {
          const reasonObj = {
            id: label.id,
            name: label.name,
            cancel: false,
            isDel: label.is_del
          }
          if (label.is_del) {
            reasonObj.cancel = true
          }
          createData.reasonManage.push(reasonObj)
        })
      } else {
        createData.reasonManage = [] // 可以进行操作的reason
        createData.reason = typeof labelItem.reason === 'string' ? labelItem.reason.split('+') : labelItem.reason
        createData.reason.forEach(reasonItem => {
          const reasonObj = {
            name: reasonItem,
            cancel: false
          }
          createData.reasonManage.push(reasonObj)
        })
      }
      createData.isNeedDownIndex = false // 用于处理问题标记重叠的情况
      return createData
    })
    this.storePartReworkReason = storePartReworkReason

    const originReturnLabels = _.get(photoItem, 'tags.values.origin_return_labels')
    if (originReturnLabels) {
      // 整体备注
      this.storeReworkNote = _.get(photoItem, 'tags.values.origin_return_labels.store_rework_note') || '-'

      // 整体退单标记
      const originReturnLabelsLabels = originReturnLabels.labels
      if (!originReturnLabelsLabels) {
        const storeReworkReason = originReturnLabels.store_rework_reason
        this.storeReworkReason = storeReworkReason ? storeReworkReason.split('+') : []
        this.storeReworkReason.forEach(storeReworkReasonItem => {
          const reasonObj = {
            name: storeReworkReasonItem,
            cancel: false
          }
          this.storeReworkReasonManage.push(reasonObj)
        })
      } else {
        const storeReworkReason = originReturnLabels || ''
        this.storeReworkReason = storeReworkReason.map(reasonItem => reasonItem.name)
        storeReworkReason.forEach(reasonItem => {
          const reasonObj = {
            id: reasonItem.id,
            name: reasonItem.name,
            cancel: false,
            isDel: reasonItem.is_del
          }
          if (reasonItem.is_del) {
            reasonObj.cancel = true
          }
          this.storeReworkReasonManage.push(reasonObj)
        })
      }
    } else {
      const storeReworkReason = _.get(photoItem, 'tags.values.store_rework_reason') || ''
      this.storeReworkReason = storeReworkReason ? storeReworkReason.split('+') : []
      this.storeReworkReason.forEach(storeReworkReasonItem => {
        const reasonObj = {
          name: storeReworkReasonItem,
          cancel: false
        }
        this.storeReworkReasonManage.push(reasonObj)
      })
      // 整体备注
      this.storeReworkNote = _.get(photoItem, 'tags.values.store_rework_note') || '-'
    }
  }

  // 判断是否显示退单标签
  getHasStoreReturnTag () {
    const hasStorePartReworkReason = Boolean(this.storePartReworkReason.length)
    const hasStoreReworkReason = Boolean(this.storeReworkReason.length)
    this.hasStoreReturnTag = hasStorePartReworkReason || hasStoreReworkReason
  }

  // 获取云学院评价 
  getCommitInfo (photoItem) {
    if (completePhoto.includes(this.version)) {
      this.commitInfo = photoItem.commitInfo || {}
    }
    this.hasCommitInfo = Boolean(Object.keys(this.commitInfo).length)
  }

  // 获取模式
  getMode () {
    if (this.version === 'store_rework' && this.hasStoreReturnTag) {
      this.mode = 'complete'
    } else if (completePhoto.includes(this.version) && this.hasCommitInfo) {
      this.mode = 'cloudLabel'
    }
  }

  getVersionCache (photoItem) {
    if (this.hasStoreReturnTag || this.hasCommitInfo) {
      this.versionCache = photoItem.versionCache
    }
  }
}
