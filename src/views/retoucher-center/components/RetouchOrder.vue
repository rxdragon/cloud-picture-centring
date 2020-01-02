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
        <el-button v-if="orderData.type === 'mainto'" type="primary" plain @click="hangUp">挂起订单</el-button>
        <el-button type="primary" @click="submitOrder">提交审核</el-button>
      </div>
    </div>
    <!-- 照片信息 -->
    <order-info :order-data="orderData" />
    <!-- 图片信息 -->
    <div class="photo-module module-panel">
      <div class="photo-panel-title panel-title">
        <span>原片信息</span>
        <div class="button-box">
          <domain-switch-box />
          <el-button type="primary" size="small" @click="oneAllDownOrign">一键下载原片</el-button>
        </div>
      </div>
      <div class="photo-panel">
        <div v-for="(photoItem, photoIndex) in photos" :key="photoIndex" class="photo-box" :class="{ 'over-success': photoItem.isCover }">
          <photo-box
            downing
            preview
            :stream-num="orderData.streamNum"
            photo-name
            preload-photo
            :tags="photoItem.tags"
            show-joint-label
            show-recede-reason
            :src="photoItem.path"
            :people-num="photoItem.people_num"
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
      <div class="photo-panel-title panel-title">
        <span>修图上传</span>
      </div>
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
  </div>
</template>

<script>
import OrderInfo from '@/components/OrderInfo'
import PhotoBox from '@/components/PhotoBox'
import DomainSwitchBox from '@/components/DomainSwitchBox'
import UploadPhoto from './UploadPhoto.vue'
import DownIpc from '@electronMain/ipc/DownIpc'
import { mapGetters } from 'vuex'
import * as RetoucherCenter from '@/api/retoucherCenter'
import * as LogStream from '@/api/logStream'
import * as SessionTool from '@/utils/sessionTool'

export default {
  name: 'RetouchOrder',
  components: { OrderInfo, PhotoBox, DomainSwitchBox, UploadPhoto },
  props: {
    showDetail: { type: Boolean }
  },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      headerClass: '', // 固定header所用class
      orderData: {
        streamNum: '',
        streamId: '',
        type: '',
        photographerName: '',
        photographer: '',
        productName: '',
        photoNum: 0,
        waitTime: '',
        retouchRemark: '',
        requireLabel: {},
        streamState: ''
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
      realAid: ''
    }
  },
  computed: {
    ...mapGetters(['retouchId', 'showOverTag']),
    // 是否开启沙漏
    isSandClockOpen () {
      if (!this.hourGlass) return this.hourGlass
      return Object.keys(this.hourGlass).length
    }
  },
  watch: {
    retouchId: {
      handler (id) {
        console.log(id, 'watchId')
        if (!id) return
        this.realAid = id
        this.getStreamInfo()
      },
      immediate: true
    }
  },
  created () {
    if (!this.retouchId) { this.$emit('update:showDetail', false) }
  },
  methods: {
    /**
     * @description 一键下载原片
     */
    oneAllDownOrign () {
      const savePath = `/${this.orderData.streamNum}`
      const photoArr = this.photos.map(photoItem => {
        return {
          url: photoItem.path,
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
        LogStream.retoucherSee(+this.realAid)
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
        this.photos.forEach(item => { item.isCover = false })
        for (const uid in finishPhoto) {
          const findOrignPhoto = this.photos.find(item => item.id === finishPhoto[uid].id)
          findOrignPhoto && (findOrignPhoto.isCover = true)
        }
      }
    },
    /**
     * @description 提交审核
     */
    async submitOrder () {
      const finishPhotoArr = Object.values(this.finishPhoto)
      if (!finishPhotoArr.every(item => Boolean(item.path))) {
        return this.$newMessage.warning('请等待照片上传完成')
      }
      const cachePhoto = this.$refs['uploadPhoto']._data.cachePhoto
      const uploadData = [...cachePhoto, ...finishPhotoArr]
      uploadData.forEach(item => { delete item.orginPhotoName })
      if (uploadData.length > this.photos.length) {
        return this.$newMessage.warning('上传照片数量超过限制，请重新上传。')
      }
      if (uploadData.length < this.photos.length) {
        return this.$newMessage.warning('请检查照片上传张数后再提交审核。')
      }
      if (!uploadData.length) {
        return this.$newMessage.warning('请检查照片上传张数后再提交审核。')
      }
      if (!this.photos.some(item => item.id === uploadData[0].id)) {
        return this.$newMessage.warning('找不到流水号对应的id，请刷新页面重新上传')
      }
      const reqData = {
        streamId: this.realAid,
        photoData: uploadData
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
        height: 44px;
        width: 146px;
        position: relative;
        box-sizing: content-box;
        background: url(~@/assets/sand_clock/sand_bg.png);
        display: flex;
        align-items: center;

        .time {
          color: white;
          width: 115px;
          height: 100%;
          position: absolute;
          top: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 500;
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
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;

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
        margin-bottom: 24px;
        margin-right: 24px;
        transition: all 0.3s;

        .handle-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .progress {
          width: 241px;
          height: 241px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .error-photo {
          color: @red;
        }
      }

      .over-success {
        border: 1px solid @green;
        font-family: @elementIcons !important;
        position: relative;
        overflow: hidden;

        &::after {
          content: "\e6da";
          display: block;
          position: absolute;
          right: 0;
          bottom: 0;
          color: #fff;
        }

        &::before {
          content: "";
          display: block;
          width: 40px;
          height: 40px;
          background-color: @green;
          position: absolute;
          transform: rotate(45deg);
          right: -20px;
          bottom: -20px;
        }
      }

      .recede-remark {
        margin-top: 20px;
        display: flex;
        width: 100%;
        background: rgba(250, 250, 250, 1);
        padding: 20px;
        border-radius: 4px;
        margin-right: 24px;

        & > span {
          width: 70px;
          color: #303133;
          font-size: 14px;
        }

        .remark-content {
          color: #303133;
          font-size: 14px;
          width: 632px;
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
