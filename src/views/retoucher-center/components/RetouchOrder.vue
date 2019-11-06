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
        <div v-for="(photoItem, photoIndex) in photos" :key="photoIndex" class="photo-box">
          <photo-box
            downing
            preview
            :stream-num="orderData.streamNum"
            photo-name
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
      <div class="photo-panel photo-panel-upload">
        <div v-for="(photoItem, photoIndex) in cachePhoto" :key="photoIndex" class="photo-box">
          <photo-box
            photo-name
            :src="photoItem.path"
          />
          <span class="delete-button" @click="deleteCachePhoto(photoIndex)">
            <i class="el-icon-error" />
          </span>
        </div>
        <div v-for="(photoItem, photoIndex) in uploadPhoto" :key="photoIndex" class="photo-box">
          <photo-box
            v-if="photoItem.response && photoItem.status !== 'fail'"
            photo-name
            :src="finishPhoto[photoIndex].path"
          />
          <div v-else-if="photoItem.status !== 'fail'" class="progress">
            <el-progress
              type="circle"
              :percentage="photoItem.percentage | formatProgress"
              :color="photoItem.percentage | filterPercentageColor"
              :status="photoItem.percentage | filterPercentage"
            />
          </div>
          <div v-else class="error-photo progress">
            <i class="el-icon-warning-outline">上传失败</i>
          </div>
          <span class="delete-button" @click="deleteUploadPhoto(photoItem.response, photoIndex)">
            <i class="el-icon-error" />
          </span>
        </div>
        <div v-show="canUpdatePhoto" key="upload-button" class="crop-upload-box">
          <el-upload
            ref="uploadButton"
            class="upload-crop-button"
            accept="image/*"
            :action="updateDomain + upyunConfig.bucket"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-progress="handleProgress"
            :on-success="handleSuccess"
            multiple
            :file-list="uploadPhoto"
            :data="upyunConfig"
          >
            <div class="avatar-upload">
              <i class="el-icon-plus" />
              <span>上传照片</span>
            </div>
          </el-upload>
        </div>
        <div v-for="i in 4" :key="'empty' + i" class="empty-box" />
      </div>
    </div>
  </div>
</template>

<script>
import OrderInfo from '@/components/OrderInfo'
import PhotoBox from '@/components/PhotoBox'
import DomainSwitchBox from '@/components/DomainSwitchBox'
import variables from '@/styles/variables.less'

import { mapGetters } from 'vuex'
import * as RetoucherCenter from '@/api/retoucherCenter'
import * as Commonality from '@/api/commonality'
import * as PhotoTool from '@/utils/photoTool'
import * as SessionTool from '@/utils/sessionTool'

export default {
  name: 'RetouchOrder',
  components: { OrderInfo, PhotoBox, DomainSwitchBox },
  filters: {
    formatProgress (value) {
      return Number(value.toFixed(0))
    },
    filterPercentage (value) {
      if (value === 100) {
        return 'success'
      }
      return null
    },
    filterPercentageColor (value) {
      const colorClass = [variables.orange, variables.orange, variables.blue, variables.green]
      const colorIndex = Number((value / 30).toFixed(0))
      return colorClass[colorIndex]
    }
  },
  props: {
    aid: { type: [Number, String], required: true },
    showDetail: { type: Boolean }
  },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      orderData: {
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
      hourGlass: null,
      photos: [],
      reviewerNote: '',
      headerClass: '',
      upyunConfig: {}, // 又拍云配置
      finishPhoto: [], // 最后提交成片
      uploadPhoto: [], // 正在上传照片
      cachePhoto: [], // 缓存照片
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
    ...mapGetters(['updateDomain', 'returnStreamId']),
    variables () {
      return variables
    },
    // 是否开启沙漏
    isSandClockOpen () {
      if (!this.hourGlass) return this.hourGlass
      return Object.keys(this.hourGlass).length
    },
    // 是否能添加照片
    canUpdatePhoto () {
      const finishNumSame = this.photos.length === this.finishPhoto.length + this.cachePhoto.length
      const updatePaddingSame = this.photos.length === this.uploadPhoto.length + this.cachePhoto.length
      return !finishNumSame && !updatePaddingSame
    }
  },
  watch: {
    aid (value) {
      if (value) {
        this.getCachePhoto()
        this.getStreamInfo()
      }
    }
  },
  created () {
    if (!this.aid && !this.returnStreamId) { this.$emit('update:showDetail', false) }
    this.realAid = this.returnStreamId || this.aid
    this.getCachePhoto()
    this.getStreamInfo()
    this.getUpyunSign()
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
      PhotoTool.oneAllDown(photoArr)
    },
    /**
     * @description 获取缓存照片
     */
    getCachePhoto () {
      const data = SessionTool.getUpdatePhoto(this.realAid)
      this.cachePhoto = data
    },
    /**
     * @description 挂起订单
     */
    hangUp () {
      const reqData = { streamId: this.realAid }
      RetoucherCenter.hangStream(reqData)
        .then(msg => {
          const saveData = [...this.cachePhoto, ...this.finishPhoto]
          SessionTool.saveUpdatePhoto(this.realAid, saveData)
          this.$newMessage.success('流水挂起成功，不要忘记处理哦～')
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
        this.$store.commit('notification/CLEAR_RETURN_STREAM_ID')
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
     * @description 获取又拍云
     */
    async getUpyunSign () {
      this.upyunConfig = await Commonality.getSignature()
    },
    /**
     * @description 上传前回调
     * @param {*} file
     */
    beforeUpload (file) {
      this.$store.dispatch('setting/showLoading', this.routeName)
      const name = PhotoTool.fileNameFormat(file.name)
      if (name.includes('.')) {
        this.$newMessage.warning('请正确命名照片名！')
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        return false
      }
      const isJPG = file.type === 'image/jpeg'
      const isPNG = file.type === 'image/png'
      const allFinishPhoto = [...this.cachePhoto, ...this.finishPhoto]
      const hasSameName = this.photos.some(item => item.path.includes(name))
      const findPhoto = allFinishPhoto.find(finishPhotoItem => finishPhotoItem.orginPhotoName === name)
      if (!isJPG && !isPNG) {
        this.$newMessage.warning('上传图片只能是 JPG 或 PNG 格式!')
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        return isJPG || isPNG
      }
      if (findPhoto) {
        this.$newMessage.warning('该照片已经上传，请移除该照片' + name + '再上传。')
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        return false
      }
      if (!hasSameName) {
        this.$newMessage.warning('请上传与原片文件名一致的照片。')
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        return false
      }
      this.$store.dispatch('setting/hiddenLoading', this.routeName)
      return true
    },
    /**
     * @description 文件上传时的钩子
     */
    handleProgress (event, file, fileList) {
      this.uploadPhoto = fileList
    },
    /**
     * @description 上传成功钩子
     * @param {*} response 成功回调
     * @param {*} file 上传成功单文件
     * @param {*} fileList 上传全部文件
     */
    handleSuccess (response, file, fileList) {
      this.uploadPhoto = fileList
      const createPhotoData = []
      fileList.forEach((fileItem, fileIndex) => {
        const uploadedName = PhotoTool.fileNameFormat(file.name)
        // 上传后的照片名字
        const filePath = fileItem.response ? PhotoTool.handlePicPath(fileItem.response.url) : ''
        const findOrginPhoto = this.photos.find(photoItem => photoItem.path.includes(uploadedName))
        const findFinishPhoto = file.name === filePath
        if (this.finishPhoto[fileIndex] && this.finishPhoto[fileIndex].path) {
          createPhotoData.push(this.finishPhoto[fileIndex])
        } else {
          const newPhoto = {
            id: findOrginPhoto.id,
            path: filePath,
            orginPhotoName: uploadedName,
            willDelete: false
          }
          if (findFinishPhoto) {
            this.$newMessage.warning('请修改照片后再进行上传。')
            this.uploadPhoto[fileIndex].willDelete = true
            newPhoto.willDelete = true
          }
          createPhotoData.push(newPhoto)
        }
      })
      const filterCreatePhotoData = createPhotoData.filter((photoItem, photoIndex) => {
        if (photoItem.willDelete) { this.uploadPhoto.splice(photoIndex, 1) }
        return !photoItem.willDelete
      })
      this.finishPhoto = JSON.parse(JSON.stringify(filterCreatePhotoData))
    },
    /**
     * @description 移除文件
     */
    deleteUploadPhoto (response, index) {
      const isPending = !response
      if (isPending) {
        this.$refs.uploadButton.abort(this.uploadPhoto[index])
      }
      this.uploadPhoto.splice(index, 1)
      this.finishPhoto.splice(index, 1)
    },
    /**
     * @description 删除缓存数据
     */
    deleteCachePhoto (index) {
      this.cachePhoto.splice(index, 1)
    },
    /**
     * @description 提交审核
     */
    async submitOrder () {
      if (!this.finishPhoto.every(item => Boolean(item.path))) {
        return this.$newMessage.warning('请等待照片上传完成')
      }
      const uploadPhotoData = [...this.cachePhoto, ...this.finishPhoto]
      const uploadData = uploadPhotoData
      uploadData.forEach(item => {
        delete item.orginPhotoName
        delete item.willDelete
      })
      if (uploadData.length > this.photos.length) {
        return this.$newMessage.warning('上传照片数量超过限制，请重新上传。')
      }
      if (uploadData.length < this.photos.length) {
        return this.$newMessage.warning('请检查照片上传张数后再提交审核。')
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

    .photo-panel-upload {
      .crop-upload-box {
        overflow: hidden;
        position: relative;
        width: 253px;
        margin-bottom: 24px;
        margin-right: 24px;

        .progress {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translateX(-50%) translateY(-50%);
        }

        .upload-crop-button {
          display: flex;
          justify-content: center;
          align-items: center;
          padding-bottom: 100%;
          height: 0;
          background-color: #f5f7fa;
          border-radius: 4px;

          .el-upload {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
          }

          .avatar-upload {
            display: flex;
            flex-direction: column;
            color: #606266;
            transition: all 0.3;

            .el-icon-plus {
              font-size: 28px;
              margin-bottom: 16px;
            }

            & > span {
              font-size: 16px;
              font-weight: 400;
            }
          }

          &:hover .avatar-upload {
            color: @blue;
          }
        }
      }

      .photo-box {
        position: relative;
        cursor: pointer;
        width: 253px;
        margin-bottom: 24px;
        margin-right: 24px;

        .delete-button {
          position: absolute;
          right: -14px;
          top: -14px;
          display: none;
          opacity: 0;
          transition: all 0.3s;

          .el-icon-error {
            font-size: 28px;
          }
        }

        &:hover .delete-button {
          display: block;
          opacity: 1;
        }
      }
    }
  }

  .upload-module {
    margin-bottom: 10px;
  }
}
</style>
