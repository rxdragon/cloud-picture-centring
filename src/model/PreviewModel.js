const completePhoto = ['last_retouch_photo', 'complete_photo']

export default class PreviewModel {
  id = ''
  version = 'original_photo'
  path = ''
  mode = 'original'
  storePartReworkReason = []
  storeReworkReason = []
  storeReworkReasonManage = []
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
    // todo 兼容新格式的store_part_rework_reason
    let storePartReworkReason = _.get(photoItem, 'tags.values.store_part_rework_reason') || []
    storePartReworkReason = storePartReworkReason.map(labelItem => {
      const createData = labelItem
      createData.reason = labelItem.reason ? labelItem.reason.split('+') : []
      createData.reasonManage = [] // 可以进行操作的reason
      createData.reason.forEach(reasonName => {
        createData.reasonManage.push({
          name: reasonName,
          cancel: false
        })
      })

      return createData
    })
    this.storePartReworkReason = storePartReworkReason
    // 整理标签
    const storeReworkReason = _.get(photoItem, 'tags.values.store_rework_reason') || ''
    this.storeReworkReason = storeReworkReason ? storeReworkReason.split('+') : []
    this.storeReworkReason.forEach(reasonName => {
      this.storeReworkReasonManage.push({
        name: reasonName,
        cancel: false
      })
    })
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
