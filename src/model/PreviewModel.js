const completePhoto = ['last_retouch_photo', 'complete_photo']

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
    let storePartReworkReason = _.get(photoItem, 'tags.values.store_part_rework_reason') || []
    storePartReworkReason = storePartReworkReason.map(labelItem => {
      const createData = labelItem
      // 2.12之后新的局部标签在在labels下面
      if (createData.labels) {
        createData.reason = createData.labels.map(labelItem => labelItem.name)
        createData.reasonManage = [] // 可以进行操作的reason
        createData.labels.forEach(label => {
          const reasonObj = {
            id: label.id,
            name: label.name,
            cancel: false
          }
          if (label.is_del) {
            reasonObj.cancel = true
          }
          createData.reasonManage.push(reasonObj)
        })
      } else {
        createData.reason = labelItem.reason ? labelItem.reason.split('+') : []
        createData.reasonManage = [] // 可以进行操作的reason
      }
      
      return createData
    })
    this.storePartReworkReason = storePartReworkReason
    // 整理标签 2.12之后新的整体标签在values.labels下面
    if (_.get(photoItem, 'tags.values.labels')) {
      const storeReworkReason = _.get(photoItem, 'tags.values.labels') || ''
      this.storeReworkReason = storeReworkReason.map(reasonItem => reasonItem.name)
      storeReworkReason.forEach(reasonItem => {
        const reasonObj = {
          id: reasonItem.id,
          name: reasonItem.name,
          cancel: false
        }
        if (reasonItem.is_del) {
          reasonObj.cancel = true
        }
        this.storeReworkReasonManage.push(reasonObj)
      })

    } else {
      const storeReworkReason = _.get(photoItem, 'tags.values.store_rework_reason') || ''
      this.storeReworkReason = storeReworkReason ? storeReworkReason.split('+') : []
    }
    
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
