<template>
  <div class="upload-photo">
    <transition-group name="list-photo" class="list-photo" tag="div">
      <div
        v-for="(photoItem, photoIndex) in cachePhoto"
        :key="'cache' + photoItem.path"
        class="photo-box list-photo-item"
        :class="photoItem.isRepetition ? 'is-repetition' : ''"
      >
        <photo-box
          photo-name
          preview-breviary
          contain-photo
          :src="photoItem.path"
        />
        <span class="delete-button" @click="deleteCachePhoto(photoIndex)">
          <i class="el-icon-error" />
        </span>
      </div>
      <div
        v-for="(photoItem, photoIndex) in uploadPhoto"
        :key="photoItem.uid"
        :class="{ 'is-repetition': photoItem.response && finishPhoto[photoItem.uid] && finishPhoto[photoItem.uid].isRepetition }"
        class="photo-box list-photo-item"
      >
        <transition name="el-zoom-in-center" mode="out-in">
          <photo-box
            v-if="photoItem.status === 'success' && finishPhoto[photoItem.uid]"
            photo-name
            preview-breviary
            :file-data="finishPhoto[photoItem.uid].file"
            :src="finishPhoto[photoItem.uid].path"
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
        </transition>
        <span class="delete-button" @click="deleteUploadPhoto(photoItem, photoIndex)">
          <i class="el-icon-error" />
        </span>
      </div>
      <div v-if="canUpdatePhoto" key="upload-button" class="crop-upload-box list-photo-item">
        <el-upload
          id="el-upload-file"
          ref="uploadButton"
          class="upload-crop-button"
          accept="image/*"
          multiple
          drag
          :action="updateDomain"
          :show-file-list="false"
          :before-upload="beforeUpload"
          :on-progress="handleProgress"
          :on-success="handleSuccess"
          :on-error="handleError"
          :file-list="uploadPhoto"
          :data="upyunConfig"
        >
          <div class="avatar-upload">
            <i class="el-icon-plus" />
            <span>上传照片</span>
          </div>
        </el-upload>
      </div>
      <div v-for="i in 4" :key="'empty' + i" class="empty-box list-photo-item" />
    </transition-group>
    <el-tooltip effect="dark" content="匹配查找照片信息里，照片下方显示的文件名" placement="top-start">
      <el-button
        size="small"
        class="one-upload"
        type="primary"
        @click="getFiles"
      >
        一键上传
      </el-button>
    </el-tooltip>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { logUpload } from './log'
import variables from '@/styles/variables.less'
import PhotoBox from '@/components/PhotoBox'
import * as Commonality from '@/api/commonality'
import * as SessionTool from '@/utils/sessionTool'
import * as PhotoTool from '@/utils/photoTool'
import * as AutoUpload from '@/utils/autoUpload'

export default {
  name: 'UploadPhoto',
  components: { PhotoBox },
  filters: {
    // 过滤进度条
    formatProgress (value) {
      return Number(value.toFixed(0))
    },
    // 进度到100 改变状态
    filterPercentage (value) {
      return value === 100 ? 'success' : null
    },
    // 设置进度颜色
    filterPercentageColor (value) {
      const colorClass = [variables.orange, variables.orange, variables.blue, variables.green]
      const colorIndex = Number((value / 30).toFixed(0))
      return colorClass[colorIndex]
    }
  },
  model: {
    prop: 'finishPhoto',
    event: 'change'
  },
  props: {
    photos: { type: Array, default: () => [] },
    realAid: { type: [String, Number], required: true },
    streamNum: { type: String, default: '' },
    finishPhoto: { type: Object, required: true } // 最后提交成片
  },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      cachePhoto: [], // 缓存照片
      uploadPhoto: [], // 正在上传照片
      upyunConfig: {} // 又拍云配置
    }
  },
  computed: {
    ...mapGetters(['updateDomain', 'showOverTag', 'saveFolder']),
    // 样式变量
    variables () {
      return variables
    },
    // 是否能添加照片
    canUpdatePhoto () {
      const finishNumSame = this.photos.length === Object.values(this.finishPhoto).length + this.cachePhoto.length
      return !finishNumSame
    }
  },
  watch: {
    photos: {
      handler () {
        this.cachePhoto = []
        this.uploadPhoto.forEach((photoItem, photoIndex) => {
          this.deleteUploadPhoto(photoItem, photoIndex)
        })
        this.uploadPhoto = []
        this.$emit('change', {})
        this.getCachePhoto()
      },
      immediate: true
    }
  },
  created () {
    this.getUpyunSign()
  },
  beforeDestroy () {
    const findUploadingPhotoArr = this.uploadPhoto.filter(item => !item.response)
    for (const uploadingItem of findUploadingPhotoArr) {
      this.$refs.uploadButton.abort(uploadingItem)
      logUpload(uploadingItem, 'refresh')
    }
  },
  methods: {
    /**
     * @description 获取文件自动上传
     */
    getFiles (event) {
      if (!this.streamNum) return
      event.stopPropagation()
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        this.checkHasUploadingPhoto() // 是否有图片正在上传
        const needUploadPhotos = []
        const finishPhotoArr = Object.values(this.finishPhoto)
        const allFinishPhoto = [...this.cachePhoto, ...finishPhotoArr]
        this.photos.forEach(photoItem => {
          if (!allFinishPhoto.find(finishItem => finishItem.id === photoItem.id)) {
            let photoFileNam = photoItem.path.split('/')
            photoFileNam = photoFileNam[photoFileNam.length - 1]
            needUploadPhotos.push(photoFileNam)
          }
        })
        AutoUpload.getFiles(this.streamNum, needUploadPhotos)
      } catch (error) {
        console.error(error)
        this.$newMessage.error(error.message || error)
        return false
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 获取又拍云
     */
    async getUpyunSign () {
      this.upyunConfig = await Commonality.getSignature()
    },
    /**
     * @description 获取缓存照片
     */
    getCachePhoto () {
      const data = SessionTool.getUpdatePhoto(this.realAid)
      // 实验功能
      if (this.showOverTag) {
        data.forEach(photoItem => {
          const findOrignPhoto = this.photos.find(item => item.id === photoItem.id)
          findOrignPhoto && (findOrignPhoto.isCover = true)
        })
      }
      this.cachePhoto = data
    },
    /**
     * @description 检测是否正在上传的照片
     */
    checkHasUploadingPhoto () {
      if (!this.uploadPhoto.every(item => item.response)) {
        throw new Error('请等待照片上传完成')
      }
    },
    /**
     * @description 检测正确名字
     */
    checkFileName (file) {
      const fileName = PhotoTool.fileNameFormat(file.name)
      if (fileName.includes('.')) {
        throw new Error('请正确命名照片名！')
      }
    },
    /**
     * @description 检查是否是照片
     */
    checkFileType (type) {
      const canUploadTpye = ['image/jpeg', 'image/png']
      if (!canUploadTpye.includes(type)) {
        throw new Error('上传图片只能是 JPG 或 PNG 格式!')
      }
    },
    /**
     * @description 检查是否和原片名字一样
     */
    checkHasSaveName (file) {
      let fileName = PhotoTool.photoPathExtToLowerCase(file.name)
      fileName = PhotoTool.fixAutoPhotoName(fileName)
      const hasSameName = this.photos.some(item => {
        const orginPhotoName = PhotoTool.photoPathExtToLowerCase(item.path)
        const orginPhotoNameForJpeg = orginPhotoName.replace('jpeg', 'jpg')
        const orginPhotoNameForUnknow = orginPhotoName.replace('unknow', 'jpg')
        
        return orginPhotoName === fileName || orginPhotoNameForJpeg === fileName || orginPhotoNameForUnknow === fileName
      })

      if (!hasSameName) throw new Error('请上传与原片文件名一致的照片。')
    },
    /**
     * @description 检查是否已经上传
     */
    checkHasUploadedPhoto (file) {
      let fileName = PhotoTool.fileNameFormat(file.name)
      fileName = PhotoTool.fixAutoPhotoName(fileName)
      const finishPhotoArr = Object.values(this.finishPhoto)
      const allFinishPhoto = [...this.cachePhoto, ...finishPhotoArr]
      const findPhoto = allFinishPhoto.find(finishPhotoItem => finishPhotoItem.orginPhotoName === fileName)
      if (findPhoto) {
        this.signRepetitionPhoto(findPhoto)
        throw new Error('该照片已经上传，请移除该照片' + findPhoto.path + '再上传。')
      }
    },
    /**
     * @description 检查是否修改
     * @param {Object} file [文件对象]
     * @param {String} uploadPhotoSha1 [上传文件的sha1]
     */
    checkPsPhoto (file, uploadPhotoSha1) {
      // 最后一次提交文件名
      let beforeUploadFilePath = file.name
      beforeUploadFilePath = PhotoTool.fixAutoPhotoName(beforeUploadFilePath)
      const beforeUploadFileName = PhotoTool.fileNameFormat(beforeUploadFilePath)
      if (beforeUploadFileName === uploadPhotoSha1) throw new Error('请修改照片后再进行上传。')
    },
    /**
     * @description 上传前回调
     * @param {*} file
     */
    async beforeUpload (file) {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        this.checkHasUploadingPhoto() // 上一次照片是否上传完成
        this.checkFileName(file) // 是否正确命名
        // 获取type和sha1
        const imgInfo = await PhotoTool.getImgBufferPhoto(file)
        const uploadPhotoSha1 = imgInfo.sha1
        const type = imgInfo.typeInfo.mime
        this.checkFileType(type) // 判断是否是图片
        this.checkHasSaveName(file) // 判断是否与原片名字相同
        this.checkPsPhoto(file, uploadPhotoSha1) // 判断图片是否修改
        this.checkHasUploadedPhoto(file) // 判断是否已经上传
        file.startTime = Date.now() / 1000
        file.sha1Name = uploadPhotoSha1
        return Promise.resolve()
      } catch (error) {
        console.error(error)
        this.$newMessage({
          dangerouslyUseHTMLString: true,
          message: error.message || error,
          type: 'warning',
          duration: 3000
        })
        return Promise.reject()
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
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
    async handleSuccess (response, file, fileList) {
      this.uploadPhoto = fileList
      // 校验数据
      if (file.response && file.response.url) {
        try {
          const info = await PhotoTool.getImgBufferPhoto(file.raw)
          const selfSha1 = info.sha1
          logUpload(file)
          if (!file.response.url.includes(selfSha1)) {
            const willDeleteIndex = fileList.findIndex(fileItem => fileItem.uid === file.uid)
            if (willDeleteIndex >= 0) {
              fileList.splice(willDeleteIndex, 1)
            }
            this.$newMessage.error('上传文件校验错误')
            return false
          }
        } catch (error) {
          console.error(error)
          const willDeleteIndex = fileList.findIndex(fileItem => fileItem.uid === file.uid)
          if (willDeleteIndex >= 0) {
            fileList.splice(willDeleteIndex, 1)
          }
          this.$newMessage.error('上传校验错误')
          return false
        }
      }
      const uid = file.uid
      let uploadedName = PhotoTool.fileNameFormat(file.name)
      uploadedName = PhotoTool.fixAutoPhotoName(uploadedName)
      
      // 上传后的照片名字
      const filePath = file.response ? PhotoTool.handlePicPath(file.response.url) : ''
      const findOrginPhoto = this.photos.find(photoItem => photoItem.path.includes(uploadedName))
      if (!this.finishPhoto[uid]) {
        const newPhoto = {
          id: findOrginPhoto.id,
          path: filePath,
          autoKey: findOrginPhoto.path,
          orginPhotoName: uploadedName,
          file
        }
        this.$set(this.finishPhoto, uid, newPhoto)
      }
      if (filePath && !this.finishPhoto[uid].path) {
        this.$set(this.finishPhoto[uid], 'path', filePath)
      }
      this.$emit('change', this.finishPhoto)
    },
    /**
     * @description 上传失败钩子
     * @param {*} err 错误信息
     * @param {*} file 上传失败单文件
     * @param {*} fileList 上传文件列表
     */
    async handleError (err, file, fileList) {
      try {
        console.error(err)
        logUpload(file, 'error')
      } catch (error) {
        console.error(error)
      }
    },
    /**
     * @description 移除文件
     */
    deleteUploadPhoto (photoItem, index) {
      const isPending = !photoItem.response
      if (isPending) {
        this.$refs.uploadButton.abort(this.uploadPhoto[index])
      }
      this.uploadPhoto.splice(index, 1)
      const uid = photoItem.uid
      this.$delete(this.finishPhoto, uid)
      this.$emit('change', this.finishPhoto)
    },
    /**
     * @description 删除缓存数据
     */
    deleteCachePhoto (index) {
      const findOrignPhoto = this.photos.find(item => item.id === this.cachePhoto[index].id)
      findOrignPhoto && (findOrignPhoto.isCover = false)
      this.cachePhoto.splice(index, 1)
    },
    /**
     * @description 保持上传图片
     */
    saveUpdatePhoto () {
      const finishPhotoArr = Object.values(this.finishPhoto)
      const saveData = [...this.cachePhoto, ...finishPhotoArr]
      SessionTool.saveUpdatePhoto(this.realAid, saveData)
    },
    /**
     * @description 标记重复上传照片
     */
    signRepetitionPhoto (findPhoto) {
      // 实验功能
      if (this.showOverTag) {
        this.$set(findPhoto, 'isRepetition', true)
        setTimeout(() => {
          this.$delete(findPhoto, 'isRepetition')
        }, 2000)
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/variables.less';

.upload-photo {
  position: relative;

  .list-photo {
    position: relative;
    margin-right: -24px;
  }

  .photo-box {
    position: relative;
    width: 253px;
    margin-right: 24px;
    margin-bottom: 24px;
    cursor: pointer;

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

    .delete-button {
      position: absolute;
      top: -14px;
      right: -14px;
      display: none;
      opacity: 0;
      transition: all 10s;

      .el-icon-error {
        font-size: 28px;
      }
    }

    &:hover .delete-button {
      display: block;
      opacity: 1;
    }
  }

  .is-repetition {
    border: 2px solid @red;
    opacity: 1;
    animation: blink 0.8s ease-in-out  infinite alternate;
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

  .crop-upload-box {
    position: relative;
    width: 253px;
    margin-right: 24px;
    margin-bottom: 24px;
    overflow: hidden;

    .progress {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translateX(-50%) translateY(-50%);
    }

    .upload-crop-button {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 0;
      padding: 50% 0;
      background-color: #f5f7fa;
      border-radius: 4px;

      .el-upload {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
      }

      & /deep/ .el-upload-dragger {
        width: 100%;
        height: 100%;
        background-color: transparent;
        border: none;
      }

      .avatar-upload {
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 253px;
        height: 253px;
        color: #606266;
        -webkit-user-select: none;
        transition: all 0.3;

        .el-icon-plus {
          margin-bottom: 16px;
          font-size: 28px;
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

  .one-upload {
    position: absolute;
    top: -52px;
    right: 24px;
  }
}
</style>
