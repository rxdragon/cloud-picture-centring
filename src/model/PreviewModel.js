export default class PhotoModel {
  version = 'original_photo'
  path = ''
  mode = 'original'
  storePartReworkReason = []
  storeReworkReason = []
  storeReworkNote = []
  hasStoreReturnTag = false
  commitInfo = {}
  hasCommitInfo = false
  versionCache = null

  constructor (photoItem) {
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
    let storePartReworkReason = _.get(photoItem, 'tags.values.store_part_rework_reason') || []
    storePartReworkReason = storePartReworkReason.map(labelItem => {
      const createData = labelItem
      createData.reason = labelItem.reason ? labelItem.reason.split('+') : []
      return createData
    })
    this.storePartReworkReason = storePartReworkReason
    // 整理标签
    const storeReworkReason = _.get(photoItem, 'tags.values.store_rework_reason') || ''
    this.storeReworkReason = storeReworkReason ? storeReworkReason.split('+') : []
    // 整体备注
    this.storeReworkNote = _.get(photoItem, 'tags.values.store_rework_note') || '-'
  }

  // 判断是否显示退单标签
  getHasStoreReturnTag () {
    const hasStorePartReworkReason = Boolean(this.storePartReworkReason.length)
    const hasStoreReworkReason = Boolean(this.storeReworkReason.length)
    this.hasStoreReturnTag = hasStorePartReworkReason || hasStoreReworkReason
  }

  // 获取云学院评价 
  getCommitInfo (photoItem) {
    if (this.version === 'complete_photo') {
      this.commitInfo = photoItem.commitInfo || {}
    }
    this.hasCommitInfo = Boolean(Object.keys(this.commitInfo).length)
  }

  // 获取模式
  getMode () {
    if (this.version === 'store_rework' && this.hasStoreReturnTag) {
      this.mode = 'complete'
    } else if (this.version === 'complete_photo' && this.hasCommitInfo) {
      this.mode = 'cloudLabel'
    }
  }

  getVersionCache (photoItem) {
    if (this.hasStoreReturnTag || this.hasCommitInfo) {
      this.versionCache = photoItem.versionCache
    }
  }
}
