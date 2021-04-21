<template>
  <div class="lighting-point-photo">
    <div v-for="(photoItem, photoIndex) in uploadPhoto" :key="photoItem.uid" class="list-photo-item">
      <transition name="el-zoom-in-center" mode="out-in">
        <photo-box
          v-if="photoItem.status === 'success' && photoItem.path"
          original-photo
          preview
          :downing="false"
          :showSpecialEffects="false"
          :src="photoItem.url"
        />
        <div v-else-if="photoItem.status !== 'fail'" class="progress">
          <el-progress
            type="circle"
            :width="100"
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

    <el-upload
      v-show="uploadPhoto.length < maxNum"
      v-on="$listeners"
      v-bind="$attrs"
      ref="uploadButton"
      accept="image/*"
      multiple
      drag
      list-type="picture-card"
      :limit="maxNum"
      :show-file-list="false"
      :action="updateDomain"
      :data="upyunConfig"
      :file-list="uploadPhoto"
      :before-upload="beforeUpload"
      :on-progress="handleProgress"
      :on-success="handleSuccess"
      :on-exceed="onExceedPhoto"
    >
      <i slot="default" class="el-icon-plus"></i>
    </el-upload>
    <div class="upload-tips">
      <div class="tip">{{ option.tip }}</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import PhotoBox from "@/components/PhotoBox"
import variables from '@/styles/variables.less'
import * as Commonality from '@/api/commonality'
import * as PhotoTool from '@/utils/photoTool'

export default {
  name: 'LightingPointPhoto',
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
    prop: 'uploadPhoto',
    event: 'change'
  },
  props: {
    uploadPhoto: { type: Array, required: true },
    option: { type: Object, default: () => ({}) },
    maxNum: { type: Number, default: 9 }
  },
  data () {
    return {
      upyunConfig: {},
    }
  },
  computed: {
    ...mapGetters(['updateDomain']),
  },
  created () {
    this.getUpyunSign()
  },
  methods: {
    /**
     * @description 获取又拍云
     */
    async getUpyunSign () {
      this.upyunConfig = await Commonality.getSignature()
    },
    /**
     * @description 检测是否有一样的图片
     */
    async checkHasSamePhoto (file) {
      const imgInfo = await PhotoTool.getImgBufferPhoto(file)
      const uploadPhotoSha1 = imgInfo.sha1
      const hasSamePhoto = this.uploadPhoto.some(item => {
        const path = item.path || ''
        return path.includes(uploadPhotoSha1)
      })
      if (hasSamePhoto) throw new Error(`请不要上传相同的图片`)
    },
    /**
     * @description 超过上传张数限制钩子
     */
    onExceedPhoto () {
      this.$newMessage.error(`超过上传张数限制${this.maxNum}张`)
    },
    /**
     * @description 检测是否正在上传的照片
     */
    checkHasUploadingPhoto () {
      if (!this.uploadPhoto.every(item => item.status === 'success')) {
        throw new Error('请等待照片上传完成')
      }
    },
    /**
     * @description 上传前回调
     */
    async beforeUpload (file) {
      try {
        const canUploadType = ['image/jpeg', 'image/jpg', 'image/png']
        if (!canUploadType.includes(file.type)) throw new Error(`请上传jpg/png的图片`)
        this.checkHasUploadingPhoto()
        await this.checkHasSamePhoto(file)
        return Promise.resolve()
      } catch (error) {
        this.$newMessage({
          dangerouslyUseHTMLString: true,
          message: error.message || error,
          type: 'warning',
          duration: 3000
        })
        return Promise.reject()
      }
    },
    /**
     * @description 上传中
     */
    handleProgress (event, file, fileList) {
      this.$emit('change', fileList)
    },
    /**
     * @description 上传成功
     */
    handleSuccess (response, file, fileList) {
      const path = file.response ? PhotoTool.handlePicPath(file.response.url) : ''
      const uploadedName = PhotoTool.fileNameFormat(file.name)
      const uploadedPhotoIndex = fileList.findIndex(item => item.uid === file.uid)
      if (uploadedPhotoIndex < 0) return
      this.$set(fileList[uploadedPhotoIndex], 'path', path)
      this.$set(fileList[uploadedPhotoIndex], 'uploadedName', uploadedName)
      this.$emit('change', fileList)
    },
    /**
     * @description 移除文件
     */
    deleteUploadPhoto (photoItem, index) {
      const isPending = !photoItem.response
      if (isPending) { this.$refs.uploadButton.abort(this.uploadPhoto[index]) }
      this.uploadPhoto.splice(index, 1)
    }
  }
}
</script>

<style lang="less" scoped>
.lighting-point-photo {
  display: flex;

  .list-photo-item {
    position: relative;
    width: 148px;
    height: 148px;
    margin-right: 12px;

    .delete-button {
      position: absolute;
      top: -5px;
      right: -5px;
      display: none;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
    }

    .progress {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }

    &:hover {
      .delete-button {
        display: block;
      }
    }
  }

  .upload-tips {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    margin-left: 16px;

    .tip {
      font-size: 12px;
      line-height: 1.5;
      color: #909399;
    }
  }

  & /deep/ .el-upload-dragger {
    width: 100%;
    height: 100%;
    background-color: transparent;
    border: none;
  }
}
</style>
