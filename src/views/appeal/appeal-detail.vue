<template>
  <div class="appeal-detail">
    <div class="header">
      <h3>申诉详情</h3>
    </div>
    <div class="order module-panel">
      <div class="panel-title">照片信息</div>
      <order-info :appeal-info="appealInfo" :order-data="orderData" />
    </div>
    <!-- 照片列表 -->
    <div v-for="(photoItem, photoIndex) in photos" :key="photoIndex" class="photo-list module-panel">
      <div class="panel-title">申诉照片{{ photoIndex + 1 }}</div>
      <photo-detail :ref="`photoDetail${photoIndex}`" :check-type="checkType" :photo-item="photoItem"/>
    </div>
    <div class="footer" v-if="checkType">
      <el-button type="info" @click="cancelAll">返回</el-button>
      <el-button type="primary" @click="submitAll">提交</el-button>
    </div>
  </div>
</template>

<script>
import PhotoDetail from './components/PhotoDetail'
import OrderInfo from './components/OrderInfo'

import * as Appeal from '@/api/appeal.js'

export default {
  name: 'Detail',
  components: { PhotoDetail, OrderInfo },
  data () {
    return {
      showPreview: false,
      routeName: this.$route.name, // 路由名字
      checkType: this.$route.query.type, // 审核类型
      streamId: '', // 流水id
      orderData: {}, // 订单信息
      photos: [],
      qualityNum: this.$route.query.qualityNum, // 质量问题数量
      dialogAppealVisible: false,
      appealType: 'rework', // 申诉信息
      appealOptions: [
        {
          value: 'rework',
          name: '门店退单问题'
        }
      ],
      appealInfo: {}
    }
  },
  created () {
    this.getStreamInfo()
  },
  methods: {
    /**
     * @description 获取订单详情
     */
    async getStreamInfo () {
      try {
        const req = { id: this.$route.query.id }
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await Appeal.appealDetail(req)
        this.orderData = data.orderData
        this.photos = data.photos
        this.appealInfo = data.appealInfo
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 显示申诉弹窗
     */
    showAppeal () {
      this.dialogAppealVisible = true
    },
    /**
     * @description 提交申诉
     */
    submitAppeal () {
      let checkFail = false
      const checkArr = []
      const req = {
        streamId: this.streamId,
        photoAppeals: [],
        type: this.appealType
      }
      this.photos.forEach(photoItem => {
        if (photoItem.reworkChecked) {
          checkArr.push(photoItem.id)
          if (!photoItem.appealReason) {
            checkFail = true
            return
          }
          req.photoAppeals.push({
            photo_id: photoItem.id,
            desc: photoItem.appealReason
          })
        }
      })
      if (!checkArr.length) return this.$newMessage.warning('还没有勾选任何照片')
      if (checkFail) return this.$newMessage.warning('因未勾选问题照片or没有填写问题描述则需要进行提示：请填写完整申诉问题!')
      this.dialogAppealVisible = false
    },
    /**
     * @description 返回不保存
     */
    cancelAll () {
      this.$store.dispatch('tagsView/delView', { path: '/appeal-detail' })
      this.$router.push({
        path: '/admin-manage/appeal-handle'
      })
    },
    /**
     * @description 提交
     */
    async submitAll () {
      const photoExamines = []
      this.photos.forEach((photoItem, photoIndex) => {
        const photoDetailData = this.$refs[`photoDetail${photoIndex}`][0]
        const { realPhotoData } = photoDetailData
        const { firstResult, secondResult } = photoDetailData.photoItem.photoAppeals

        if (this.checkType === 'first' && firstResult.result) {
          const firstObj = {
            photo_appeal_id: firstResult.id,
            result: firstResult.result
          }
          if (firstResult.reason) firstObj.reason = firstResult.reason
          photoExamines.push(firstObj)
        }
        if (this.checkType === 'second' && secondResult.result) {
          const secondObj = {
            photo_appeal_id: secondResult.id,
            result: secondResult.result
          }
          if (secondResult.reason) secondObj.reason = secondResult.reason
          secondObj.labels_to_del = []
          secondObj.parts = []
          realPhotoData.storeReworkReasonManage.forEach(storeReworkReasonItem => {
            if (storeReworkReasonItem.cancel) secondObj.labels_to_del.push(storeReworkReasonItem.id)
          })
          realPhotoData.storePartReworkReason.forEach(storePartReworkReasonItem => {
            const partReason = {}
            partReason.labels_to_del = []
            storePartReworkReasonItem.reasonManage.forEach(reasonItem => {
              if (reasonItem.cancel) partReason.labels_to_del.push(reasonItem.id)
            })
            secondObj.parts.push(partReason)
          })
          photoExamines.push(secondObj)
        }
      })
      if (photoExamines.length !== this.photos.length) {
        this.$newMessage.warning('还存在未审核的申诉照片')
        return
      }
      const req = {
        id: this.appealInfo.id,
        photoExamines
      }
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        await Appeal.appealExamine(req)
        this.$newMessage.success('提交成功')
        this.$store.dispatch('tagsView/delView', { path: '/appeal-detail' })
        this.$router.push({
          path: '/admin-manage/appeal-handle'
        })
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    }
  }
}
</script>

<style lang="less" scoped>

.appeal-detail {
  .footer {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    margin-bottom: 20px;
  }
}
</style>

<style lang="less">
.el-rate {
  height: auto;
}

.el-rate__icon {
  font-size: 24px;
}
</style>
