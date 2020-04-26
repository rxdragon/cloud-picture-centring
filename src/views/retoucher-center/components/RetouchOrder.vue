<template>
  <div class="retouch-order">
    <!-- 标题 -->
    <div class="header">
      <div class="header-left">
        <h3>修图详情</h3>
        <div v-if="isSandClockOpen" class="sand-clock">
          <div class="sand" :class="`sand-${sandClass}`" />
          <div class="time">{{ sandTime | toTimeFormatText }}</div>
        </div>
      </div>
      <div class="button-box">
        <el-button v-if="orderData.productInfo.type === 'mainto'" type="primary" plain @click="hangUp">挂起订单</el-button>
        <el-button type="primary" @click="setIssueLabel">提交审核</el-button>
      </div>
    </div>
    <!-- 照片信息 -->
    <order-info :order-data="orderData" />
    <!-- 成片信息 -->
    <div class="photo-module module-panel" v-if="orderData.streamState === 'store_return_retouch'">
      <div class="photo-panel-title panel-title">
        <span>云端成片</span>
        <div class="button-box">
          <el-button type="primary" size="small" @click="oneAllDownOrign(true)">一键下载成片</el-button>
        </div>
      </div>
      <div class="photo-panel">
        <div v-for="(photoItem, photoIndex) in photos" :key="photoIndex"
          @click="showPriviewPhoto(photoIndex, 'complete')"
          class="photo-box" :class="{ 'over-success': photoItem.isCover }">
          <photo-box
            downing
            photo-name
            preload-photo
            show-joint-label
            show-complete-photo
            show-recede-reason
            :pre-list="photos"
            :pre-index="photoIndex"
            :stream-num="orderData.streamNum"
            :src="photoItem.returnPhotoPath"
          />
        </div>
        <div v-if="orderData.streamState === 'review_return_retouch'" class="recede-remark">
          <span>备注原因：</span>
          <div class="remark-content">{{ reviewerNote }}</div>
        </div>
      </div>
    </div>
     <!-- 原片信息 -->
    <div class="photo-module module-panel">
      <div class="photo-panel-title panel-title">
        <span>原片信息</span>
        <div class="button-box">
          <el-button type="primary" size="small" @click="oneAllDownOrign(false)">一键下载原片</el-button>
        </div>
      </div>
      <div class="photo-panel">
        <div v-for="(photoItem, photoIndex) in photos" :key="photoIndex"
          @click="showPriviewPhoto(photoIndex, 'original')"
          class="photo-box" :class="{ 'over-success': photoItem.isCover }">
          <photo-box
            downing
            photo-name
            preload-photo
            show-joint-label
            :pre-list="photos"
            :pre-index="photoIndex"
            :stream-num="orderData.streamNum"
            :src="photoItem.path"
          />
        </div>
        <div v-if="orderData.streamState === 'review_return_retouch'" class="recede-remark">
          <span>备注原因：</span>
          <div class="remark-content">{{ reviewerNote }}</div>
        </div>
      </div>
    </div>
    <!-- 修图上传 -->
    <div class="photo-module module-panel upload-module">
      <div class="photo-panel-title panel-title"><span>修图上传</span></div>
      <upload-photo
        ref="uploadPhoto"
        class="photo-panel"
        :photos="photos"
        :finish-photo="finishPhoto"
        :real-aid="realAid"
        :stream-num="orderData.streamNum"
        @change="uploadDown"
      />
    </div>
    <!-- 问题标签 -->
    <issue-label :issue-data="issueData" :visible.sync="dialogVisible" @submit="submitOrder" />
    <!-- 预览 -->
    <preview-photo
      v-if="showPreview"
      show-return-reson
      v-model="imgIndex"
      :imgarray="priviewPhotoData"
      :show-preview.sync="showPreview"
    />
  </div>
</template>

<script>
import OrderInfo from '@/components/OrderInfo'
import PhotoBox from '@/components/PhotoBox'
import UploadPhoto from './UploadPhoto.vue'
import IssueLabel from './IssueLabel.vue'
import DownIpc from '@electronMain/ipc/DownIpc'
import PreviewPhoto from '@/components/PreviewPhoto/index.vue'
import { mapGetters } from 'vuex'
import * as RetoucherCenter from '@/api/retoucherCenter'
import * as LogStream from '@/api/logStream'
import * as SessionTool from '@/utils/sessionTool'

export default {
  name: 'RetouchOrder',
  components: { OrderInfo, PhotoBox, UploadPhoto, IssueLabel, PreviewPhoto },
  props: {
    showDetail: { type: Boolean }
  },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      headerClass: '', // 固定header所用class
      orderData: {
        productInfo: {},
        orderInfo: {},
        requireLabel: {}
      },
      photos: [], // 照片数组
      reviewerNote: '', // 审核备注
      finishPhoto: {}, // 最后提交成片
      hourGlass: null, // 沙漏时间
      goalTime: {
        green: 0,
        red: 0
      }, // 目标沙漏时间
      overTime: 0, // 超时时间
      sandTime: 0, // 沙漏时间
      sandClass: '', // 沙漏样式
      issueData: {},
      realAid: '',
      preIndexPhoto: {},
      dialogVisible: false,
      imgPreMask: false,
      showPreview: false,
      priviewPhotoData: [], // 预览数组
      imgIndex: 0 // 照片索引
    }
  },
  computed: {
    ...mapGetters(['retouchId', 'showOverTag', 'imgDomain']),
    // 是否开启沙漏
    isSandClockOpen () {
      if (!this.hourGlass) return this.hourGlass
      return Object.keys(this.hourGlass).length
    }
  },
  watch: {
    retouchId: {
      handler (id) {
        if (!id) return
        this.realAid = id
        this.getStreamInfo()
      },
      immediate: true
    }
  },
  created () {
    if (!this.retouchId) {
      this.$emit('update:showDetail', false)
    }
  },
  methods: {
    /**
     * @description 一键下载照片 true:成片， false:原片
     */
    oneAllDownOrign (type) {
      const savePath = `/${this.orderData.streamNum}`
      const photoArr = this.photos.map(photoItem => {
        return {
          url: type ? photoItem.returnPhotoPath : photoItem.path,
          path: savePath
        }
      })
      DownIpc.addDownloadFiles(photoArr)
    },
    /**
     * @description 挂起订单
     */
    hangUp () {
      const reqData = { streamId: this.realAid }
      RetoucherCenter.hangStream(reqData)
        .then(msg => {
          if (this.$refs['uploadPhoto']) {
            this.$refs['uploadPhoto'].saveUpdatePhoto()
          }
          this.$newMessage.success('流水挂起成功，不要忘记处理哦～')
          this.$store.commit('notification/CLEAR_RETOUCH_STREAM_ID')
          this.$emit('update:showDetail', false)
        })
    },
    /**
     * @description 获取流水信息
     */
    async getStreamInfo () {
      try {
        const reqData = { streamId: this.realAid }
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await RetoucherCenter.getStreamInfo(reqData)
        this.orderData = data.orderData
        this.hourGlass = data.hourGlass
        if (this.isSandClockOpen) {
          this.overTime = +this.hourGlass.over_time
          const nowDate = Math.ceil(new Date().getTime() / 1000)
          this.goalTime.green = this.hourGlass.green_time + nowDate
          this.goalTime.red = this.hourGlass.green_time + this.hourGlass.orange_time + nowDate
          this.countDown()
        }
        this.photos = data.photos
        this.reviewerNote = data.reviewerNote
        this.needPunchLabel = data.needPunchLabel
        LogStream.retoucherSee(+this.realAid)
        this.initPriviewPhoto()
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    },
    /**
     * @description 时间倒计时
     */
    countDown () {
      let time = 0
      const nowDate = Math.ceil(new Date().getTime() / 1000)
      if (this.goalTime.green - nowDate > 0) {
        time = this.goalTime.green - nowDate
        this.sandClass = 'green'
      } else if (this.goalTime.red - nowDate > 0) {
        time = this.goalTime.red - nowDate
        this.sandClass = 'orange'
      } else {
        time = nowDate - this.goalTime.red + this.overTime
        this.sandClass = 'red'
      }
      this.sandTime = time
      setTimeout(this.countDown, 1000)
    },
    /**
     * @description 上传完成
     */
    uploadDown (finishPhoto) {
      // 实验功能
      if (this.showOverTag) {
        this.photos.forEach(item => {
          item.isCover = false
        })
        for (const uid in finishPhoto) {
          const findOrignPhoto = this.photos.find(item => item.id === finishPhoto[uid].id)
          findOrignPhoto && (findOrignPhoto.isCover = true)
        }
      }
    },
    /**
     * @description 提交审核
     */
    async submitOrder (issue) {
      const finishPhotoArr = Object.values(this.finishPhoto)
      const cachePhoto = this.$refs['uploadPhoto']._data.cachePhoto
      const uploadData = [...cachePhoto, ...finishPhotoArr]
      uploadData.forEach(item => {
        delete item.orginPhotoName
        delete item.file
      })
      const reqData = {
        streamId: this.realAid,
        photoData: uploadData
      }
      // 设置问题标签
      if (issue) {
        reqData.streamTagData = issue
      }
      this.$store.dispatch('setting/showLoading', this.routeName)
      try {
        await RetoucherCenter.submitStream(reqData)
        SessionTool.removeUpdatePhoto(this.realAid)
        SessionTool.removeSureRetouchOrder(this.realAid)
        SessionTool.removeReturnRetouchOrder(this.realAid)
        this.$newMessage.success('提交审核成功。')
        this.$store.commit('notification/CLEAR_RETOUCH_STREAM_ID')
        this.$emit('update:showDetail', false)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    },
    /**
     * @description 判断是否能上传照片
     */
    canUploadPhoto () {
      const finishPhotoArr = Object.values(this.finishPhoto)
      if (!finishPhotoArr.every(item => Boolean(item.path))) {
        throw new Error('请等待照片上传完成')
      }
      const cachePhoto = this.$refs['uploadPhoto']._data.cachePhoto
      const uploadData = [...cachePhoto, ...finishPhotoArr]
      if (uploadData.length > this.photos.length) {
        throw new Error('上传照片数量超过限制，请重新上传。')
      }
      if (uploadData.length < this.photos.length) {
        throw new Error('请检查照片上传张数后再提交审核。')
      }
      if (!uploadData.length) {
        throw new Error('请检查照片上传张数后再提交审核。')
      }
      if (!this.photos.some(item => item.id === uploadData[0].id)) {
        throw new Error('找不到流水号对应的id，请刷新页面重新上传')
      }
    },
    /**
     * @description 设置问题标签
     */
    setIssueLabel () {
      try {
        this.canUploadPhoto()
        if (this.needPunchLabel) {
          this.getPhotoProblemTagSets()
          this.dialogVisible = true
        } else {
          this.submitOrder()
        }
      } catch (error) {
        this.$newMessage.warning(error.message)
      }
    },
    /**
     * @description 展示搜索框
     */
    showPriviewPhoto (photoIndex, mode) {
      this.photos.forEach(item => {
        item.src = this.imgDomain + item.path
        item.version = mode === 'complete' ? 'complete_photo' : 'original_photo'
        item.mode = mode === 'complete' ? 'complete' : 'original'
      })
      this.imgIndex = photoIndex
      this.showPreview = true
    },
    /**
     * @description 初始化预览数据
     */
    initPriviewPhoto () {
      this.photos.forEach(item => {
        item.src = this.imgDomain + item.path
        item.version = 'original_photo'
        item.mode = 'original'
        item.storePartReworkReason = _.get(item, 'phototag.values.store_part_rework_reason') || []
        item.storeReworkReason = _.get(item, 'phototag.values.store_rework_reason') || ''
        item.storeReworkReason = item.storeReworkReason ? item.storeReworkReason.split('+') : []
        item.storeReworkNote = _.get(item, 'phototag.values.store_rework_note') || '-'
        item.storePartReworkReason.forEach(labelItem => { labelItem.reason = labelItem.reason.split('+') })
      })
      this.priviewPhotoData = this.photos
    },
    /**
     * @description 获取标签
     */
    async getPhotoProblemTagSets () {
      const res = await RetoucherCenter.getPhotoProblemTagSets()
      this.issueData = res
    }
  }
}
</script>

<style lang="less">
@import '~@/styles/variables.less';

.retouch-order {
  .header {
    .header-left {
      display: flex;
      align-items: center;

      h3 {
        margin-right: 25px;
      }

      .sand-clock {
        position: relative;
        box-sizing: content-box;
        display: flex;
        align-items: center;
        width: 146px;
        height: 44px;
        background: url(~@/assets/sand_clock/sand_bg.png);

        .time {
          position: absolute;
          top: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 115px;
          height: 100%;
          font-size: 16px;
          font-weight: 500;
          color: white;
        }
      }
    }

    .button-box {
      text-align: right;

      .el-button {
        border-radius: 8px;
      }
    }
  }

  .photo-module {
    margin-top: 20px;

    .photo-panel-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;

      .button-box {
        display: flex;
        align-items: center;

        .el-button {
          margin-left: 24px;
        }
      }
    }

    .photo-panel {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      margin-right: -24px;

      .photo-box {
        width: 253px;
        margin-right: 24px;
        margin-bottom: 24px;
        cursor: pointer;
        transition: all 0.3s;

        .handle-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .progress {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 241px;
          height: 241px;
        }

        .error-photo {
          color: @red;
        }
      }

      .over-success {
        position: relative;
        overflow: hidden;
        font-family: @elementIcons !important;
        border: 1px solid @green;

        &::after {
          position: absolute;
          right: 0;
          bottom: 0;
          display: block;
          color: #fff;
          content: "\e6da";
        }

        &::before {
          position: absolute;
          right: -20px;
          bottom: -20px;
          display: block;
          width: 40px;
          height: 40px;
          content: "";
          background-color: @green;
          transform: rotate(45deg);
        }
      }

      .recede-remark {
        display: flex;
        width: 100%;
        padding: 20px;
        margin-top: 20px;
        margin-right: 24px;
        background: rgba(250, 250, 250, 1);
        border-radius: 4px;

        & > span {
          width: 70px;
          font-size: 14px;
          color: #303133;
        }

        .remark-content {
          width: 632px;
          font-size: 14px;
          color: #303133;
          white-space: pre-wrap;
        }
      }
    }
  }

  .upload-module {
    margin-bottom: 10px;
  }
}
</style>
