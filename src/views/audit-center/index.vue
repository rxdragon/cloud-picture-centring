<template>
  <div class="audit-center">
    <!-- 接单队列 -->
    <div class="header">
      <h3>
        修图审核
        <span class="header-desc">退回重修中流水：{{ todayReviewQuota.reviewReturnRetouchStreamNums }}</span>
      </h3>
      <div class="header-right">
        <template v-if="!isChecking">
          <span v-if="state !== 2" class="queue-info queue-length">审核排队中的流水：{{ queueInfo.reviewQueueStreamNums }}</span>
          <span v-if="state === 2" class="queue-info">排队接单中（顺序{{ queueInfo.reviewQueueIndex }}）</span>
          <el-button
            v-if="state === 1"
            type="primary"
            :disabled="state === 3"
            @click="joinReviewQueue"
          >
            接单
          </el-button>
          <el-button v-if="state === 2" type="info" @click="exitQueue">取消排队</el-button>
        </template>
        <template v-else>
          <!-- 审核退回 -->
          <div class="check-box">
            <el-button v-if="!isReturnOrder" type="primary" @click="passStream">审核通过</el-button>
            <div v-else>
              <el-checkbox v-model="unbundle">退回并解绑审核人</el-checkbox>
              <el-button type="danger" @click="refuseStream">审核退回</el-button>
            </div>
          </div>
        </template>
      </div>
    </div>
    <!-- 今日信息 -->
    <div class="today-info module-panel">
      <div class="panel-title">今日完成</div>
      <div class="panel-content">
        <div class="label-list-title">审核总时长</div>
        <div class="label-list-title">审核单量</div>
        <div class="label-list-title">审核张数</div>
        <div class="label-list-content">{{ todayReviewQuota.todayReviewTimes }}</div>
        <div class="label-list-content">{{ todayReviewQuota.todayReviewStreamNums }}</div>
        <div class="label-list-content">{{ todayReviewQuota.todayReviewPhotoNums }}</div>
      </div>
    </div>
    <!-- 照片信息 -->
    <order-info v-if="orderData" show-retouch :order-data="orderData" />
    <!-- 照片审核 -->
    <div v-if="orderData" class="check-photo module-panel">
      <div class="panel-title">
        <span>照片审核</span>
        <div class="button-box">
          <div v-if="orderData.photos.length > 1" ref="returnBox" class="return-box">
            <el-button
              v-if="!isAllReturnOrder"
              type="warning"
              size="small"
              @click="allRework"
            >
              全部重修
            </el-button>
            <el-button
              v-else
              type="info"
              size="small"
              @click="allCleanRework"
            >
              取消重修
            </el-button>
          </div>
          <el-button size="small" type="primary" @click="oneAllDownOrign">一键下载原片</el-button>
        </div>
      </div>
      <photo-group
        v-for="(photoItem, photoIndex) in orderData.photos"
        :key="photoIndex"
        :stream-num="orderData.streamNum"
        :stream-can-glass="orderData.canGlass"
        :upyun-config="upyunConfig"
        :photos="photoItem"
      />
      <!-- 本单审核备注 -->
      <div
        v-if="isReturnOrder && orderData.photos.length > 1"
        class="review-panel"
      >
        <div class="panel-title review-title">
          <span>
            本单审核备注
            <i>(单张重修或审核备注选其一填写)</i>
          </span>
        </div>
        <el-input
          v-model="reviewMark"
          class="review-mark"
          type="textarea"
          :rows="4"
          placeholder="请输入审核意见"
          resize="none"
        />
      </div>
      <transition name="box-right">
        <template v-if="showFixReturnBox">
          <el-button
            v-if="!isAllReturnOrder"
            class="fix-return-button"
            type="warning"
            size="small"
            @click="allRework"
          >
            全部重修
          </el-button>
          <el-button
            v-else
            class="fix-return-button fix-return-button-cancel"
            type="info"
            size="small"
            @click="allCleanRework"
          >
            取消重修
          </el-button>
        </template>
      </transition>
    </div>
  </div>
</template>

<script>
import OrderInfo from '@/components/OrderInfo'
import PhotoGroup from './components/PhotoGroup'
import DownIpc from '@electronMain/ipc/DownIpc'
import { renameFirstPhoto } from '@/utils/photoTool'
import * as Commonality from '@/api/commonality'
import * as Reviewer from '@/api/reviewer.js'

export default {
  name: 'AuditReview',
  components: { OrderInfo, PhotoGroup },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      scrollTop: 0, // 滚动高度
      unbundle: false, // 退回并解绑审核人
      orderData: null, // 订单信息
      todayReviewQuota: {
        todayReviewTimes: '-',
        todayReviewStreamNums: '-',
        todayReviewPhotoNums: '-',
        reviewReturnRetouchStreamNums: '-'
      },
      queueInfo: {}, // 排队信息
      reviewMark: '', // 审核备注
      headerClass: '',
      upyunConfig: {},
      observer: null,
      showFixReturnBox: false
    }
  },
  computed: {
    // 有退回订单
    isReturnOrder () {
      const hasRework = this.orderData.photos.some(photoItem => photoItem.reworkMark)
      return hasRework
    },
    // 全部退回订单
    isAllReturnOrder () {
      const everyRework = this.orderData.photos.every(photoItem => photoItem.reworkMark)
      return everyRework
    },
    // 是否在审核
    isChecking () {
      return this.orderData
    },
    // 排队状态
    state () {
      // 1 未接单  2 排队接单 3 接单中
      if (this.queueInfo.inQueue) return 2
      if (this.retouchingListNum) return 3
      return 1
    }
  },
  created () {
    this.$eventEmitter.on('getReviewerReceive', () => {
      this.queueInfo.inQueue = false
      if (this.isChecking) return
      this.getReviewQueueInfo()
    })
    this.getUpyunSign()
    this.getTodayReviewQuota()
    this.getReviewQueueInfo()
  },
  activated () {
    if (!this.isChecking) {
      this.getTodayReviewQuota()
      this.getReviewQueueInfo()
    }
  },
  destroyed () {
    this.$eventEmitter.removeAllListeners('getReviewerReceive')
  },
  methods: {
    /**
     * @description 一键下载原片
     */
    oneAllDownOrign () {
      const savePath = `/${this.orderData.streamNum}`
      const photoArr = []
      this.orderData.photos.forEach(photoItem => {
        const findOriginal = photoItem.priviewPhotoData.find(versionItem => versionItem.version === 'original_photo')
        const findFirst = photoItem.priviewPhotoData.find(versionItem => versionItem.version === 'first_photo')
        photoArr.push({
          url: findOriginal.path,
          path: savePath
        })
        photoArr.push({
          url: findFirst.path,
          rename: renameFirstPhoto(findOriginal.path),
          path: savePath
        })
      })
      DownIpc.addDownloadFiles(photoArr)
    },
    /**
     * @description 获取又拍云
     */
    async getUpyunSign () {
      const data = await Commonality.getSignature()
      this.upyunConfig = JSON.parse(JSON.stringify(data))
    },
    /**
     * @description 全部重修
     */
    allRework () {
      this.orderData.photos.forEach(photoItem => {
        photoItem.reworkMark = true
      })
    },
    /**
     * @description 取消全部重修
     */
    allCleanRework () {
      this.orderData.photos.forEach(photoItem => {
        photoItem.reworkMark = false
      })
    },
    /**
     * @description 获取审核信息
     */
    async getReviewInfo () {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        this.orderData = await Reviewer.getReviewInfo()
        this.$nextTick(this.createdJudgePadding)
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    },
    /**
     * @description 判断目标元素
     */
    createdJudgePadding () {
      if (!this.$refs['returnBox']) return false
      const callback = (e) => {
        const isIntersecting = e[0].isIntersecting // 是否重叠
        const isTopRoot = e[0].boundingClientRect.y <= e[0].rootBounds.y // 是否高于目标元素
        this.showFixReturnBox = Boolean(!isIntersecting && isTopRoot)
      }
      const rootDom = document.querySelector('.app-main')
      const option = { root: rootDom }
      this.observer = new IntersectionObserver(callback, option)
      this.observer.observe(this.$refs['returnBox'])
    },
    /**
     * @description 获取审核队列信息
     */
    async getReviewQueueInfo () {
      this.queueInfo = await Reviewer.getReviewQueueInfo()
      if (this.queueInfo.inQueue) {
        window.polling.getReviewQueue = setTimeout(() => {
          this.getReviewQueueInfo()
        }, 10000)
      }
      if (this.queueInfo.reviewStreamId.length) {
        this.getReviewInfo()
      }
    },
    /**
     * @description 获取今日审核工作统计
     */
    async getTodayReviewQuota () {
      this.todayReviewQuota = await Reviewer.getTodayReviewQuota()
    },
    /**
     * @description 进入排队
     */
    async joinReviewQueue () {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        await Reviewer.joinReviewQueue()
        this.$newMessage.success('进入排队成功')
        this.queueInfo.inQueue = true
        this.getReviewQueueInfo()
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        if (error.message === '存在在审流水') {
          this.getReviewInfo()
        }
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    },
    /**
     * @description 退出排队
     */
    async exitQueue () {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        await Reviewer.exitReviewQueue()
        this.$newMessage.success('退出排队成功')
        this.queueInfo.inQueue = false
        await this.getReviewQueueInfo()
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    },
    /**
     * @description 审核通过
     */
    async passStream () {
      const submitData = []
      const req = {
        streamId: this.orderData.streamId
      }
      this.orderData.photos.forEach(photoItem => {
        if (photoItem.glass) {
          submitData.push({
            id: photoItem.id,
            glass: photoItem.glass,
            grassReason: photoItem.grassReason
          })
        }
      })
      if (submitData.length) {
        req.photoData = submitData
      }
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        await Reviewer.passStream(req)
        this.$newMessage.success('审核成功')
        await this.resetData()
        this.getReviewQueueInfo()
      } catch (error) {
        console.error(error)
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 审核退回
     */
    async refuseStream () {
      const submitData = []
      const req = {
        streamId: this.orderData.streamId
      }
      if (this.reviewMark) {
        req.reviewNote = this.reviewMark
      }
      this.orderData.photos.forEach(photoItem => {
        const photoItemInfo = {
          id: photoItem.id,
          glass: photoItem.glass,
          grassReason: photoItem.grassReason,
          reworkMark: photoItem.reworkMark,
          reworkMarkReason: photoItem.reworkMarkReason
        }
        if (photoItem.reworkLabel.length) {
          photoItemInfo.tags = photoItem.reworkLabel
        }
        submitData.push(photoItemInfo)
      })
      submitData.forEach(photoItem => {
        for (const key in photoItem) {
          const value = photoItem[key]
          if (!value) {
            delete photoItem[key]
          }
        }
      })
      const reworkDataHasRemark = submitData.every(photoItem => {
        if (photoItem.reworkMark) {
          return photoItem.reworkMarkReason
        } else {
          return true
        }
      })
      req.photoData = submitData
      if (!req.reviewNote && !reworkDataHasRemark) {
        return this.$newMessage.warning('请填写退单理由或者审核备注')
      }
      if (this.unbundle) {
        req.isUntied = true
      }
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        await Reviewer.refuseStream(req)
        this.$newMessage.success('退回成功')
        await this.resetData()
        this.getReviewQueueInfo()
      } catch (error) {
        console.error(error)
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 重置数据
     */
    async resetData () {
      this.unbundle = false
      this.orderData = null
      this.reviewMark = ''
      this.headerClass = ''
      this.queueInfo.inQueue = false
      await this.getTodayReviewQuota()
    }
  }
}
</script>

<style lang="less">


.audit-center {
  .header {
    .el-button {
      margin-left: 14px;
      border-radius: 8px;
    }

    .header-desc,
    .queue-info {
      font-size: 14px;
      line-height: 22px;
      color: #606266;
    }
  }

  .today-info {
    padding: 20px;
    margin-bottom: 24px;

    .panel-content {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      width: 600px;
      margin-top: 20px;
      border-bottom: 1px solid @borderColor;
      border-radius: 4px;

      .label-list-title {
        padding: 17px 20px;
        font-size: 14px;
        font-weight: 500;
        line-height: 22px;
        color: #303133;
        background-color: #fafafa;
      }

      .label-list-content {
        padding: 20px 21px;
        font-size: 14px;
        line-height: 14px;
        color: #606266;
      }
    }
  }

  .check-photo {
    margin: 24px 0;

    .panel-title {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .button-box {
        display: flex;
        align-items: center;
        padding: 10px;

        .return-box {
          margin-right: 12px;
        }

        .domain-switch-box {
          margin-left: 12px;
        }
      }
    }

    .fix-return-button {
      position: fixed;
      right: 42px;
      bottom: 255px;
      width: 60px;
      height: 60px;
      padding: 0;
      border-radius: 50%;
      box-shadow: 0 2px 4px 0 rgba(245, 166, 35, 0.5);
    }

    .fix-return-button-cancel {
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
    }
  }

  .check-box {
    text-align: center;
  }

  .review-mark {
    margin-top: 18px;
  }

  .review-title {
    & > span {
      i {
        font-size: 16px;
        font-style: normal;
        font-weight: 600;
        line-height: 24px;
        color: @orange;
      }
    }
  }
}
</style>
