<template>
  <div class="auto-image" v-loading="loading">
    <img
      class="auto-image-content"
      :src="activatedImage"
      :style="photoZoomStyle + (inZoomIn && 'cursor: zoom-out;')"
      @load="imageLoaded"
      @click="zoom"
      alt=""
    >
    <div class="image-tool" v-show="activatedImage">
      <div class="photo-actions">
        <el-button
          @click="downPhoto"
          :loading="downLoading"
          type="text"
          class="tool"
          size="mini"
          icon="el-icon-download"
          circle
        >
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { OperationBit, changeToCompress, OPERATION_TYPE } from '@/api/autoRetouch'
import DownIpc from '@electronMain/ipc/DownIpc'
import { mapGetters } from 'vuex'

import * as PhotoTool from '@/utils/photoTool'
import * as AutoLog from '@/views/retoucher-center/autoLog'

export default {
  name: 'AutoImage',
  props: {
    autoImageInfo: { type: Object, required: true }
  },
  data () {
    return {
      loading: false,
      activatedImage: '',
      downLoading: false,
      inZoomIn: false,
      photoZoomStyle: ''
    }
  },
  computed: {
    ...mapGetters(['useNewAutoApi']),
  },
  watch: {
    // 观察修图信息
    autoImageInfo: {
      async handler () {
        const handleSwtich = _.get(this.autoImageInfo, 'handleSwtich') || {}
        let typeBit = 0
        for (const key in handleSwtich) {
          const switchValue = handleSwtich[key]
          if (switchValue) {
            typeBit = typeBit | OperationBit[key]
          }
        }
        // 没有找到对应类型
        if (!typeBit) {
          this.activatedImage = ''
          return false
        }
        if ((typeBit & OperationBit[OPERATION_TYPE.MATTING]) !== OperationBit[OPERATION_TYPE.MATTING]) {
          // 不是抠图
          const url = this.autoImageInfo.autoFixPhotoList[typeBit]
          if (!url) {
            this.activatedImage = ''
            return false
          }
          const compressUrl = changeToCompress(url)
          this.activatedImage = compressUrl
        } else {
          // 是抠图
          const url = await this.autoImageInfo.autoFixPhotoList[typeBit](this.autoImageInfo.activeBackgroundImage)
          this.activatedImage = url
        }
      },
      immediate: true,
      deep: true
    },
    activatedImage (value, oldValue) {
      if (value !== oldValue) {
        this.loading = true
      }
    }
  },
  methods: {
    /**
     * @description 当图片加载完成
     */
    imageLoaded () {
      this.loading = false
    },
    /**
     * @description 下载照片
     */
    async downPhoto () {
      if (this.downLoading) return
      const handleSwtich = _.get(this.autoImageInfo, 'handleSwtich') || {}
      let typeBit = 0
      for (const key in handleSwtich) {
        const switchValue = handleSwtich[key]
        if (switchValue) {
          typeBit = typeBit | OperationBit[key]
        }
      }
      if (!typeBit) {
        this.$newMessage.warning('下载失败')
        return false
      }

      let url = ''
      this.downLoading = true
      if ((typeBit & OperationBit[OPERATION_TYPE.MATTING]) !== OperationBit[OPERATION_TYPE.MATTING]) {
        // 不是抠图
        url = this.autoImageInfo.autoFixPhotoList[typeBit]
      } else {
        // 是抠图
        const isWarp = (typeBit & OperationBit[OPERATION_TYPE.WARP]) === OperationBit[OPERATION_TYPE.WARP]
        const maskPhoto = isWarp ? this.autoImageInfo.cropWarpMaskPhoto : this.autoImageInfo.cropMaskPhoto
        const orgrinPhoto = this.autoImageInfo.autoFixPhotoList[typeBit ^ OperationBit[OPERATION_TYPE.MATTING]]
        const compress = false
        const mattingImageTool = await this.autoImageInfo.drawMattingImage(maskPhoto, orgrinPhoto, compress)
        url = await mattingImageTool(this.autoImageInfo.activeBackgroundImage)

      }
      this.downLoading = false
      const savePath = `/${this.autoImageInfo.streamNum}`
      const ext = PhotoTool.getFilePostfix(this.autoImageInfo.name)
      const name = PhotoTool.fileNameFormat(this.autoImageInfo.name)

      let model = ''
      for (const key in handleSwtich) {
        const switchValue = handleSwtich[key]
        if (switchValue) {
          model = model + key
        }
      }
      const rename = `${name}~${model}${ext}`

      const data = {
        url,
        path: savePath,
        rename
      }

      // 日志记录下载
      const useNewAutoApi = this.useNewAutoApi
      AutoLog.downLog(this.autoImageInfo.path, model, useNewAutoApi)
      this.$newMessage.success('已添加一张照片到下载')
      DownIpc.addDownloadFile(data)
    },
    zoom (e) {
      if (this.inZoomIn) {
        this.photoZoomStyle = ''
        this.inZoomIn = false
      } else {
        const imageWidth = e.target.clientWidth
        const imageHeight = e.target.clientHeight
        const clickX = (e.offsetX / imageWidth * 100).toFixed(2) + '%'
        const clickY = (e.offsetY / imageHeight * 100).toFixed(2) + '%'
        const zoomScale = 300 / 100
        this.photoZoomStyle = `transform-origin: ${clickX} ${clickY}; transform: scale(${zoomScale});`
        this.inZoomIn = true
      }
    },
  }
}
</script>

<style lang="less" scoped>
.auto-image {
  @toolHeight: 74px;
  @color-text-placeholder: #C0C4CC;

  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;

  .auto-image-content {
    max-width: 100%;
    max-height: 100%;
    cursor: zoom-in;
  }

  .image-tool {
    position: absolute;
    bottom: 20px;
    z-index: 9999;
    display: flex;
    justify-content: center;
    height: @toolHeight;
    padding-bottom: 30px;
    opacity: 0.8;

    .photo-actions {
      display: flex;
      align-items: center;
      height: 44px;
      padding: 0 23px;
      background-color: #606266;
      border-color: #fff;
      border-radius: 22px;

      .tool {
        font-size: 23px;
        color: #fff;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          color: @color-text-placeholder;
        }

        &.active {
          color: @blue;
        }
      }
    }
  }
}
</style>
