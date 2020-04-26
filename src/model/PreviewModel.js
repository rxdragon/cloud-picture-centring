export default class PhotoModel {
  version = 'original_photo'
  path = ''
  storePartReworkReason = []
  storeReworkReason = []
  storeReworkNote = []
  hasStoreReturnTag = false
  commitInfo = {}
  hasCommitInfo = false

  constructor (photoItem) {
    this.version = photoItem.version
    this.path = photoItem.path
    this.getStoreReaseon(photoItem)
    this.getHasStoreReturnTag()
    this.getCommitInfo(photoItem)
  }

  // 获取门店退单信息
  getStoreReaseon (photoItem) {
    const storePartReworkReason = _.get(photoItem, 'tags.values.store_part_rework_reason') || []
    storePartReworkReason.forEach(labelItem => { labelItem.reason = labelItem.reason.split('+') })
    this.storePartReworkReason = storePartReworkReason
    // 整理标签
    this.storeReworkReason = _.get(photoItem, 'tags.values.store_rework_reason') || ''
    this.storeReworkReason = photoItem.storeReworkReason ? photoItem.storeReworkReason.split('+') : []
    // 整体备注
    this.storeReworkNote = _.get(photoItem, 'tags.values.store_rework_note') || '-'
  }

  // 判断是否显示退单标签
  getHasStoreReturnTag () {
    const hasStorePartReworkReason = Boolean(this.storePartReworkReason.length)
    const hasStoreReworkReason = Boolean(this.storeReworkReason.length)
    return (hasStorePartReworkReason || hasStoreReworkReason)
  }

  // 获取云学院评价 
  getCommitInfo (photoItem) {
    if (this.version === 'complete_photo') {
      this.commitInfo = photoItem.commitInfo
    }
    this.hasCommitInfo = Boolean(Object.keys(this.commitInfo).length)
  }
}
