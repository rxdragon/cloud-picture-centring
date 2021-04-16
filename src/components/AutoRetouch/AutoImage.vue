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
      <div
        class="photo-actions"
        v-if="autoImageInfo.state === AutoProcessStates.SUCCESS"
      >
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
      <el-button v-else :disabled="true" type="danger">智能修图失败</el-button>
    </div>
    <div
      class="progress-wrap"
      v-show="!autoImageInfo.isLoaded || !activatedImage"
    >
      <div class="title">智能修图中</div>
      <el-progress
        :stroke-width="18"
        :text-inside="true"
        :status="percentageStatus"
        :percentage="percentage"
      />
    </div>
  </div>
</template>

<script>
import { OperationBit, changeToCompress, OPERATION_TYPE, AutoProcessStates } from '@/api/autoRetouch'
import DownIpc from '@electronMain/ipc/DownIpc'
import { mapGetters } from 'vuex'
import _ from 'lodash'

import * as PhotoTool from '@/utils/photoTool'
import * as AutoLog from '@/views/retoucher-center/autoLog'

export default {
  name: 'AutoImage',
  props: {
    autoImageInfo: { type: Object, required: true }
  },
  data () {
    return {
      AutoProcessStates,
      loading: true,
      activatedImage: '',
      downLoading: false,
      inZoomIn: false,
      photoZoomStyle: '',
      percentage: 0,
      percentageStatus: 'success'
    }
  },
  computed: {
    ...mapGetters(['useNewAutoApi', 'imgCompressDomain']),
  },
  watch: {
    // 观察修图信息
    autoImageInfo: {
      async handler () {
        // 如果当前这张没有修图完成， 则开始进度条
        if (!this.autoImageInfo.isLoaded) {
          this.percentage = 0
          this.handlePercentage()
        } else {
          // 否则停止进度条
          this.percentage = 100
        }
        if (_.isEmpty(this.autoImageInfo)) {
          this.activatedImage = ''
          this.loading = true
          return
        }
        if (this.autoImageInfo.state !== AutoProcessStates.SUCCESS) {
          this.activatedImage = this.imgCompressDomain + this.autoImageInfo.path
          return
        }
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
      if (!this.activatedImage) return
      this.loading = false
    },
    /**
     * @description 下载照片
     */
    async downPhoto () {
      if (this.downLoading) return
      const cloneAutoImageInfo = _.cloneDeep(this.autoImageInfo)
      const handleSwtich = _.get(cloneAutoImageInfo, 'handleSwtich') || {}
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
        url = cloneAutoImageInfo.autoFixPhotoList[typeBit]
      } else {
        // 是抠图
        const isWarp = (typeBit & OperationBit[OPERATION_TYPE.WARP]) === OperationBit[OPERATION_TYPE.WARP]
        const maskPhoto = isWarp ? cloneAutoImageInfo.cropWarpMaskPhoto : cloneAutoImageInfo.cropMaskPhoto
        const orgrinPhoto = cloneAutoImageInfo.autoFixPhotoList[typeBit ^ OperationBit[OPERATION_TYPE.MATTING]]
        const compress = false
        const mattingImageTool = await cloneAutoImageInfo.drawMattingImage(maskPhoto, orgrinPhoto, compress)
        url = await mattingImageTool(cloneAutoImageInfo.activeBackgroundImage)

      }
      this.downLoading = false
      const savePath = `/${cloneAutoImageInfo.streamNum}`
      const ext = PhotoTool.getFilePostfix(cloneAutoImageInfo.name)
      const name = PhotoTool.fileNameFormat(cloneAutoImageInfo.name)

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
      AutoLog.downLog(cloneAutoImageInfo.path, model, useNewAutoApi)
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

    /**
     * @description 进度条处理， 越逼近100越慢
     * 递归调用， 退出条件为percentage === 10
     * 退出点要么外面的autoImageInfo.isLoaded = true， 在watch中结束， 要么超过60s
     */
    handlePercentage (num = 0) {
      if (num === 0) {
        this.percentageStatus = 'success'
        setTimeout(() => {
          if (this.percentage >= 100) return
          this.percentage = 100
          this.percentageStatus = 'exception'
        }, 60000)
      }
      const newPercentage = +this.percentage + (num < 90 ? ((100 - num) / 15) : ((100 - num) / 100))
      this.percentage = +newPercentage.toFixed(2)
      setTimeout(() => {
        if (this.percentage < 100 ) this.handlePercentage(newPercentage)
      }, 300)
    }
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

  .progress-wrap {
    position: absolute;
    bottom: 50px;
    z-index: 9999;
    width: 100%;
    padding: 10px 20px;
    background: #fff;

    .title {
      margin-bottom: 5px;
      font-size: 12px;
    }
  }
}
</style>
