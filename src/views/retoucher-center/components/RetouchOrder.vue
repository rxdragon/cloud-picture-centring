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
        <el-button
          v-if="orderData.productInfo.type === 'mainto'"
          type="primary"
          plain
          @click="hangUp"
        >
          挂起订单
        </el-button>
        <el-button type="primary" @click="setIssueLabel">提交审核</el-button>
      </div>
    </div>

    <!-- 照片信息 -->
    <order-info :order-data="orderData" />

    <!-- 圣诞拼接信息 -->
    <div class="christmas-photos module-panel" v-if="christmasSplicePhotos.length">
      <div class="photo-panel-title panel-title">
        <span>圣诞拼接照</span>
        <div class="button-box">
          <el-button type="primary" size="small" @click="oneRenamePhoto">
            一键下载
          </el-button>
        </div>
      </div>
      <div class="photo-panel">
        <div
          v-for="(photoItem, photoIndex) in christmasSplicePhotos"
          :key="photoIndex"
          class="photo-box"
        >
          <photo-box
            downing
            photo-name
            preload-photo
            show-joint-label
            :stream-num="orderData.streamNum"
            :rename="photoItem.position"
            :src="photoItem.path"
          />
        </div>
      </div>
    </div>

    <!-- 关联退回照片 -->
    <div class="christmas-photos module-panel" v-if="tempRelationPhotos.length">
      <div class="photo-panel-title panel-title">
        <span>关联退回照片</span>
        <div class="button-box">
          <el-button type="primary" size="small" @click="oneTempRelationPhoto">
            一键下载
          </el-button>
        </div>
      </div>
      <div class="photo-panel">
        <div
          v-for="(photoItem, photoIndex) in tempRelationPhotos"
          :key="photoIndex"
          class="photo-box"
        >
          <photo-box
            downing
            photo-name
            preload-photo
            show-joint-label
            :tags="photoItem.tags"
            :show-store-part-rework-reason="false"
            :orgin-photo-path="photoItem.orginPhotoPath"
            :down-complete="photoItem.isReturnPhoto"
            :stream-num="orderData.streamNum"
            :rename="photoItem.position"
            :src="photoItem.path"
          />
        </div>
      </div>
    </div>

    <!-- 成片信息 -->
    <div class="photo-module module-panel">
      <div class="photo-panel-title panel-title">
        <span>照片信息</span>
        <div class="button-box">
          <el-button type="primary" size="small" @click="oneAllDownOrign(false)">一键下载摄影原片</el-button>
          <el-button
            v-if="isReturnOrder"
            type="primary"
            size="small"
            @click="oneAllDownOrign(true)"
          >
            一键下载成片
          </el-button>
          <el-button
            v-if="showAutoRetouchBtn"
            type="primary"
            size="small"
            @click="switchAutoRetouch(true)"
          >
            自动修图
          </el-button>
        </div>
      </div>

      <div class="photo-panel">
        <div
          v-for="(photoItem, photoIndex) in photos"
          :key="photoIndex"
          @click="showPriviewPhoto(photoIndex, 'complete')"
          class="photo-box"
          :class="{ 'over-success': photoItem.isCover }"
        >
          <photo-box
            downing
            :down-complete="photoItem.isReturnPhoto"
            :orgin-photo-path="photoItem.orginPhotoPath"
            :people-num="photoItem.people_num"
            photo-name
            preload-photo
            show-joint-label
            show-recede-reason
            :tags="photoItem.tags"
            :stream-num="orderData.streamNum"
            :src="photoItem.path"
          />
        </div>
        <div
          v-if="orderData.streamState === 'review_return_retouch'"
          class="recede-remark"
        >
          <span>备注原因：</span>
          <div class="remark-content">{{ reviewerNote }}</div>
        </div>
      </div>
    </div>

    <transition name="app-transform" mode="out-in">
      <el-alert
        class="tip-module"
        type="info"
        effect="dark"
        v-if="showTip"
      >
        <div class="tip-title" slot="title">
          如果原片后缀为<code>jpeg</code><code>unknown</code><code>unknow</code>，请保存为<code>jpg</code>手动上传，<code>不要</code>一键上传
        </div>
      </el-alert>
    </transition>

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

    <!-- 预览 -->
    <preview-photo
      v-if="showPreview"
      show-return-reson
      v-model="imgIndex"
      :imgarray="priviewPhotoData"
      :show-preview.sync="showPreview"
    />
    <!-- 自动修图 -->
    <auto-retouch
      v-if="showAutoRetouchBtn"
      v-show="showAutoRetouch"
      :productId="productId"
      :photo-list="autoRetouchPhoto"
      :stream-num="orderData.streamNum"
    />
  </div>
</template>

<script>
import PreviewModel from '@/model/PreviewModel'
import OrderInfo from '@/components/OrderInfo'
import PhotoBox from '@/components/PhotoBox'
import UploadPhoto from './UploadPhoto.vue'
import DownIpc from '@electronMain/ipc/DownIpc'
import PreviewPhoto from '@/components/PreviewPhoto/index.vue'
import AutoRetouch from '@/components/AutoRetouch/index.vue'

import AutoProductIds from '../AutoConfig.js'

import { mapGetters } from 'vuex'

import * as RetoucherCenter from '@/api/retoucherCenter'
import * as LogStream from '@/api/logStream'
import * as AutoLog from '../autoLog.js'
import * as SessionTool from '@/utils/sessionTool'
import * as PhotoTool from '@/utils/photoTool'

export default {
  name: 'RetouchOrder',
  components: { OrderInfo, PhotoBox, UploadPhoto, PreviewPhoto, AutoRetouch },
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
      christmasSplicePhotos: [], // 拼接照信息
      tempRelationPhotos: [], // 关联退回照片
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
      realAid: '',
      preIndexPhoto: {},
      imgPreMask: false,
      showPreview: false,
      isReturnOrder: false, // 是否退单订单
      priviewPhotoData: [], // 预览数组
      imgIndex: 0, // 照片索引
      showAutoRetouch: false, // 调试显示自动修图页面
      autoRetouchPhoto: [],
      showTip: false // 是否显示提示框
    }
  },
  computed: {
    ...mapGetters(['retouchId', 'showOverTag', 'imgDomain', 'canAutoRetouch', 'useNewAutoApi']),
    // 是否开启沙漏
    isSandClockOpen () {
      if (!this.hourGlass) return this.hourGlass
      return Object.keys(this.hourGlass).length
    },
    productId () {
      const productId = _.get(this.orderData, 'productInfo.id', 0)
      return productId
    },
    // 是否显示自动修图按钮
    showAutoRetouchBtn () {
      const hasProduct = Boolean(AutoProductIds[this.productId])
      return this.canAutoRetouch && hasProduct
    }
  },
  watch: {
    retouchId: {
      handler (id) {
        if (!id) return
        this.realAid = id
        this.$ipcRenderer.sendSync('upload-workbench', { id: this.realAid })
        this.getStreamInfo()
      },
      immediate: true
    }
  },
  created () {
    if (!this.retouchId) {
      this.$emit('update:showDetail', false)
    }
    this.$bus.$on('autoretouch-close', this.switchAutoRetouch.bind(false))
  },
  methods: {
    /**
     * @description 一键下载照片 true:成片， false:原片
     */
    oneAllDownOrign (type) {
      const savePath = `/${this.orderData.streamNum}`
      const photoArr = this.photos.map(photoItem => {
        return {
          url: type ? photoItem.path : photoItem.orginPhotoPath,
          path: savePath
        }
      })
      DownIpc.addDownloadFiles(photoArr)
    },
    /**
     * @description 重命名拼接下载
     */
    oneRenamePhoto () {
      const savePath = `/${this.orderData.streamNum}`
      const photoArr = this.christmasSplicePhotos.map(photoItem => {
        const ext = PhotoTool.getFilePostfix(photoItem.path)
        const rename = `${photoItem.position}${ext}`
        return {
          url: photoItem.path,
          path: savePath,
          rename
        }
      })
      DownIpc.addDownloadFiles(photoArr)
    },
    /**
     * @description 一键下载关联退回照片
     */
    oneTempRelationPhoto () {
      const savePath = `/${this.orderData.streamNum}`
      const photoArr = this.tempRelationPhotos.map(photoItem => {
        return {
          url: photoItem.path,
          path: savePath,
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
        this.christmasSplicePhotos = data.christmasSplicePhotos || []
        this.isReturnOrder = data.isReturnOrder
        if (this.isSandClockOpen) {
          this.overTime = +this.hourGlass.over_time
          const nowDate = Math.ceil(new Date().getTime() / 1000)
          this.goalTime.green = this.hourGlass.green_time + nowDate
          this.goalTime.red = this.hourGlass.green_time + this.hourGlass.orange_time + nowDate
          this.countDown()
        }
        this.photos = data.photos
        // 关联退回照片
        this.tempRelationPhotos = data.tempRelationPhotos
        // 判断是否显示上传提示框
        this.checkHasSpecialExt(data.photos)

        const filterPhotos = data.photos.filter(item => item.type !== 'template')
        this.autoRetouchPhoto = filterPhotos.map(item => item.orginPhotoPath)
        this.reviewerNote = data.reviewerNote
        LogStream.retoucherSee(+this.realAid)
        this.initPreviewPhoto()
      } catch (error) {
        console.error(error)
        SessionTool.removeSureRetouchOrder(this.realAid)
        this.$store.commit('notification/SET_RETOUCH_STREAM_ID', '')
        this.$bus.$emit('stream-with-drawn')
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 判断是否含有特殊后缀照片
     */
    checkHasSpecialExt (photos) {
      const hasSpecialExt = photos.some(photoItem => {
        const isJPEG = photoItem.path.includes('jpeg')
        const isUNKNOWN = photoItem.path.includes('unknown')
        const isUNKNOW = photoItem.path.includes('unknow')
        return isUNKNOW || isUNKNOWN || isJPEG
      })
      this.showTip = hasSpecialExt
      return hasSpecialExt
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
    async submitOrder () {
      const finishPhotoArr = Object.values(this.finishPhoto)
      const cachePhoto = this.$refs['uploadPhoto']._data.cachePhoto
      const uploadData = [...cachePhoto, ...finishPhotoArr]
      AutoLog.uploadLog(uploadData, this.useNewAutoApi)
      uploadData.forEach(item => {
        delete item.orginPhotoName
        delete item.file
        delete item.autoKey
      })

      // 添加关联照片，不更改path路径，最后一张return_show版本图片
      this.tempRelationPhotos.forEach(photoItem => {
        uploadData.push({
          id: photoItem.id,
          path: photoItem.path
        })
      })

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
        this.$ipcRenderer.sendSync('upload-workbench')
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
      if (!finishPhotoArr.every(item => Boolean(item.path))) throw new Error('请等待照片上传完成')
      const cachePhoto = this.$refs['uploadPhoto']._data.cachePhoto
      const uploadData = [...cachePhoto, ...finishPhotoArr]
      if (uploadData.length > this.photos.length) throw new Error('上传照片数量超过限制，请重新上传。')
      if (uploadData.length < this.photos.length) throw new Error('请检查照片上传张数后再提交审核。')
      if (!uploadData.length) throw new Error('请检查照片上传张数后再提交审核。')
      if (!this.photos.some(item => item.id === uploadData[0].id)) throw new Error('找不到流水号对应的id，请刷新页面重新上传')
    },
    /**
     * @description 设置问题标签
     */
    setIssueLabel () {
      try {
        this.canUploadPhoto()
        this.submitOrder()
      } catch (error) {
        this.$newMessage.warning(error.message)
      }
    },
    /**
     * @description 展示搜索框
     */
    showPriviewPhoto (photoIndex, mode) {
      if (mode !== this.priviewPhotoData[0].mode) {
        this.priviewPhotoData.forEach(item => {
          item.version = mode === 'complete' ? 'complete_photo' : 'original_photo'
          item.mode = mode === 'complete' ? 'complete' : 'original'
        })
      }
      this.imgIndex = photoIndex
      this.showPreview = true
    },
    /**
     * @description 初始化预览数据
     */
    initPreviewPhoto () {
      const previewData = this.photos.map(item => {
        const createData = new PreviewModel(item)
        createData.src = this.imgDomain + createData.path
        createData.mode = 'original'
        return createData
      })
      this.priviewPhotoData = previewData
    },
    /**
     * @description 自动修图页面切换
     */
    switchAutoRetouch (flag) {
      this.showAutoRetouch = flag
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

  .christmas-photos {
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
    }
  }

  .tip-module {
    margin-top: 20px;

    .tip-title {
      code {
        margin: 0 5px;
        color: @red;
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
