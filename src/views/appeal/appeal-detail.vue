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
      <photo-detail
        :ref="`photoDetail${photoIndex}`"
        :check-type="checkType"
        :photo-item="photoItem"
        :appeal-info="appealInfo"
      />
    </div>
    <div
      class="footer"
      v-if="checkType && appealInfo.appealType !== APPEAL_TYPE.TIMEOUT"
    >
      <el-button type="info" @click="cancelAll">返回</el-button>
      <el-button type="primary" @click="submitAll">提交</el-button>
    </div>
    <div
      class="footer"
      v-if="checkType && appealInfo.appealType === APPEAL_TYPE.TIMEOUT"
    >
      <el-button type="info" @click="cancelAll">返回</el-button>
      <div class="timeout-appeal-operation">
        <el-button type="danger" @click="showTimeoutDialog">审核拒绝</el-button>
        <el-button type="primary" @click="acceptAppeal">审核通过</el-button>
      </div>
    </div>
    <!-- timeout-dialog -->
    <el-dialog
      title="审核拒绝"
      class="alter-performance-dialog"
      :visible.sync="refuseReasonShow"
      width="30%"
    >
      <el-input
        type="textarea"
        :rows="2"
        placeholder="请填写审核拒绝的原因"
        v-model="refuseReason"
      >
      </el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelRefuse">取 消</el-button>
        <el-button type="primary" @click="refuseAppeal">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import PhotoDetail from './components/PhotoDetail'
import OrderInfo from './components/OrderInfo'

import { APPEAL_TYPE } from '@/utils/enumerate'

import * as Appeal from '@/api/appeal.js'

export default {
  name: 'Detail',
  components: { PhotoDetail, OrderInfo },
  data () {
    return {
      showPreview: false,
      routeName: this.$route.name, // 路由名字
      checkType: this.$route.query.type, // 审核类型
      pageSource: this.$route.query.source, // 页面来源, history: 来自申诉历史记录列表
      streamId: '', // 流水id
      orderData: {}, // 订单信息
      photos: [],
      dialogAppealVisible: false,
      appealInfo: {},
      APPEAL_TYPE,
      refuseReasonShow: false,
      refuseReason: ''
    }
  },
  created () {
    this.getAppealDetail()
  },
  methods: {
    /**
     * @description 获取申诉详情
     */
    async getAppealDetail () {
      try {
        const req = { id: this.$route.query.id }
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await Appeal.appealDetail(req, this.pageSource)
        this.orderData = data.orderData
        // 如果是审核页面要剔除初审拒绝的照片
        if (this.checkType) {
          this.photos = data.photos.filter(item => {
            const result = _.get(item, 'photoAppeals.firstResult.result') || ''
            return result !== 'refuse'
          })
        } else {
          this.photos = data.photos
        }
        this.appealInfo = data.appealInfo
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
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
      const appealInfo = this.appealInfo
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
        // 质量问题复审数据
        if (this.checkType === 'second' && secondResult.result && appealInfo.appealType === APPEAL_TYPE.REWORK) {
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
              if (reasonItem.cancel && !reasonItem.isDel) partReason.labels_to_del.push(reasonItem.id)
            })
            secondObj.parts.push(partReason)
          })
          photoExamines.push(secondObj)
        }
        // 评分问题复审数据
        if (this.checkType === 'second' && secondResult.result && appealInfo.appealType === APPEAL_TYPE.EVALUATE) {
          const secondObj = {
            photo_appeal_id: secondResult.id,
            result: secondResult.result
          }
          if (secondResult.reason) secondObj.reason = secondResult.reason
          secondObj.new_check_pool_history = realPhotoData.sendData
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
        await Appeal.appealExamine(req, this.checkType)
        this.$newMessage.success('提交成功')
        this.$store.dispatch('tagsView/delView', { path: '/appeal-detail' })
        this.$router.push({ path: '/admin-manage/appeal-handle' })
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 沙漏审核通过
     */
    async acceptAppeal () {
      try {
        const req = {
          id: this.appealInfo.id,
          result: 'accept'
        }
        this.$store.dispatch('setting/showLoading', this.routeName)
        await Appeal.appealExamine(req, this.checkType)
        this.$newMessage.success('提交成功')
        this.$store.dispatch('tagsView/delView', { path: '/appeal-detail' })
        this.$router.push({ path: '/admin-manage/appeal-handle' })
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 展示沙漏拒绝理由
     */
    showTimeoutDialog () {
      this.refuseReasonShow = true
    },
    /**
     * @description 取消拒绝
     */
    cancelRefuse () {
      this.refuseReasonShow = false
      this.refuseReason = ''
    },
    /**
     * @description 沙漏拒绝
     */
    async refuseAppeal () {
      if (!this.refuseReason) {
        this.$newMessage.warning('拒绝的理由还没有填写')
        return
      }
      try {
        const req = {
          id: this.appealInfo.id,
          result: 'refuse',
          reason: this.refuseReason
        }
        this.$store.dispatch('setting/showLoading', this.routeName)
        await Appeal.appealExamine(req, this.checkType)
        this.$newMessage.success('提交成功')
        this.$store.dispatch('tagsView/delView', { path: '/appeal-detail' })
        this.$router.push({ path: '/admin-manage/appeal-handle' })
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    }
  }
}
</script>

<style lang="less" scoped>

.appeal-detail {
  .order {
    margin-bottom: 24px;
  }

  .photo-list {
    margin-bottom: 24px;
  }

  .footer {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    margin-bottom: 20px;

    .timeout-appeal-operation {
      margin-left: 40px;
    }
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
