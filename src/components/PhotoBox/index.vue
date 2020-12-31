<template>
  <div class="photo">
    <div class="img-box" :class="{ 'image-load': loading }">
      <div v-show="loading" class="image-loading-model"></div>
      <el-image
        v-if="useEleImage && !showCanvas"
        :src="imageSrc"
        :fit="containPhoto ? 'contain' : 'cover'"
        :class="{
          'show-center': containPhoto
        }"
        :preview-src-list="getPreviewPhoto"
        @load="onLoadImageSuccess"
        @error="onLoadImageError"
      >
        <div slot="error" class="image-slot">
          <i class="el-icon-picture-outline" />
          <span class="image-error-tip">加载失败...</span>
          <el-button @click.capture.stop="debugNetWork" class="debug-network-button" type="text">诊断网络</el-button>
        </div>
      </el-image>
      <preview-canvas-img contain-photo v-else-if="showCanvas" :file="fileData" />
      <img
        v-else
        class="orgin-img"
        :src="imageSrc"
        alt=""
      >
      <span v-if="photoName" class="photo-name" @click.stop="">{{ photoRealName }}</span>
      <div v-if="isLekima" class="lekima-tag">利奇马</div>
      <div class="photo-tags" v-if="showLabelInfo">
        <div
          v-if="storeReturnQualityType === QUALITY_TYPE.QUALITY || storeReturnQualityType === QUALITY_TYPE.BOTH"
          class="tag warning-tag"
        >
          门店质量问题
        </div>
        <div
          v-if="storeReturnQualityType === QUALITY_TYPE.NOT_QUALITY || storeReturnQualityType === QUALITY_TYPE.BOTH"
          class="tag blue-tag"
        >
          门店非质量问题
        </div>
        <div v-if="cloudEvaluatorType === GRADE_TYPE.PLANT" class="tag green-tag">种草</div>
        <div v-if="cloudEvaluatorType === GRADE_TYPE.PULL" class="tag red-tag">拔草</div>
        <div v-if="cloudEvaluatorType === GRADE_TYPE.NONE" class="tag gray-tag">通过</div>
      </div>
    </div>
    <!-- 拼接照信息 -->
    <div v-if="downing || peopleNum" class="handle-box" @click.stop="">
      <div v-if="jointLabel" class="joint-label">拼接照{{ jointLabel | filterJointLabel }}</div>
      <div v-if="rename" class="joint-label">圣诞拼接照 - {{ rename }}</div>
      <el-button v-if="downing" type="text" @click.stop.capture="downingPhoto('original')">下载照片</el-button>
      <el-popover
        v-if="orginLinkPhotoPath"
        placement="right"
        width="241"
        trigger="hover"
      >
        <el-image
          :src="imgCompressDomain + orginLinkPhotoPath"
          :fit="containPhoto ? 'contain' : 'cover'"
          :class="{
            'show-center': containPhoto
          }"
        />
        <el-button type="text" @click.stop.capture="downingOrginLinkPhoto" slot="reference">原始图片下载</el-button>
      </el-popover>
      <el-button v-if="downComplete" type="text" @click.stop.capture="downingPhoto">下载云端成片</el-button>
      <span v-if="peopleNum" class="people-num">人数：{{ peopleNum }}</span>
      <slot name="title" />
    </div>
    <!-- 选定特效 -->
    <div v-if="!rename && showSpecialEffects" class="recede-reason">
      选定特效： <span class="reason-content">{{ specialEffects }}</span>
    </div>
    <!-- 门店退回标记 -->
    <div
      v-if="showStorePartReworkReason && storePartReworkReason.length"
      class="recede-reason"
    >
      <div class="recede-title">门店退回标记：</div>
      <div class="reason-content">
        <el-tag
          size="medium"
          class="reason-tag"
          v-for="(tagItem, tagIndex) in storePartReworkReason"
          :key="tagIndex"
        >
          {{ tagItem }}
        </el-tag>
      </div>
    </div>
    <!-- 门店退回原因 -->
    <div v-if="storeReworkReason" class="recede-reason">
      门店退回原因： <span class="reason-content">{{ storeReworkReason }}</span>
    </div>
    <!-- 门店退回备注 -->
    <div v-if="storeReworkNote" class="recede-reason">
      门店退回备注： <span class="reason-content">{{ storeReworkNote }}</span>
    </div>
    <!-- 审核退回原因 -->
    <div v-if="recedeReason" class="recede-reason">
      审核退回原因： <span class="reason-content">{{ recedeReason }}</span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import DownIpc from '@electronMain/ipc/DownIpc'
import PreviewCanvasImg from '@/components/PreviewCanvasImg'
import * as PhotoTool from '@/utils/photoTool'
import { QUALITY_TYPE, GRADE_TYPE, PHOTO_TAG } from '@/utils/enumerate'

export default {
  name: 'PhotoBox',
  components: { PreviewCanvasImg },
  filters: {
    filterJointLabel (jointLabel) {
      return jointLabel[1]
        ? `${jointLabel[0]}-${jointLabel[1]}`
        : jointLabel[0]
    }
  },
  props: {
    src: { type: String, default: '' }, // 地址图片
    orginPhotoPath: { type: String, default: '' },
    photoName: { type: Boolean },
    peopleNum: { type: [String, Number], default: () => '' }, // 是否显示照片人数
    downing: { type: Boolean }, // 是够开启下载功能
    preview: { type: Boolean }, // 是否开启单张预览功能
    previewBreviary: { type: Boolean }, // 开启单张缩略预览功能
    showRecedeReason: { type: Boolean }, // 是否显示退单理由
    showJointLabel: { type: Boolean }, // 是否显示拼接照信息
    downComplete: { type: Boolean },
    tags: { type: Object, default: () => {
      return null
    } }, // 标记信息
    streamNum: { type: String, default: '' }, // 流水号
    preloadPhoto: { type: Boolean },
    useEleImage: { type: Boolean, default: true },
    isLekima: { type: Boolean },
    fileData: { type: Object, default: null },
    containPhoto: { type: Boolean }, // 显示全部图片图像
    rename: { type: [String, Number], default: '' }, // 重命名
    showSpecialEffects: { type: Boolean, default: true }, // 是否显示特效
    showStorePartReworkReason: { type: Boolean, default: true },
    showLabelInfo: { type: Boolean } // 显示标记信息
  },
  data () {
    return {
      QUALITY_TYPE,
      GRADE_TYPE,
      breviary: '!thumb.small.50',
      linkTag: null,
      limitSize: 20 * 1024 * 1024,
      loading: false, // 是否加载中
      errorReplaceUrl: '', // 重新加载图片
      errorCount: 0 // 加载错误次数
    }
  },
  computed: {
    ...mapGetters(['imgDomain', 'imgCompressDomain', 'cacheImageSwitch']),
    // 拼接信息
    jointLabel () {
      if (this.showJointLabel && this.tags && this.tags.values && this.tags.values.splice_mark) {
        return [this.tags.values.splice_mark, this.tags.values.splice_position]
      } else {
        return null
      }
    },
    // 如果模版照，关联是由哪张照片生成的
    orginLinkPhotoPath () {
      const isStoreReturn = _.get(this.tags, 'statics', []).includes(PHOTO_TAG.STORE_REWORK)
      const isTemplate = this.orginPhotoPath.includes('template')
      if (!isStoreReturn || !isTemplate) return ''
      const orginLinkPath = _.get(this.tags, 'values.origin_photo_path') || ''
      return orginLinkPath
    },
    // 重修理由
    recedeReason () {
      const hasReworkReason = this.tags && this.tags.values && this.tags.values.rework_reason
      if (this.showRecedeReason && hasReworkReason) {
        return this.tags.values.rework_reason
      } else {
        return ''
      }
    },
    // 门店退回类型
    storeReturnQualityType () {
      const qualityType = _.get(this.tags, 'values.store_rework_type') || ''
      return qualityType
    },
    // 云学院评价类型
    cloudEvaluatorType () {
      const evaluatorType = _.get(this.tags, 'values.evaluator_type') || ''
      return evaluatorType
    },
    // 门店退回标记
    storePartReworkReason () {
      const storePartReworkReason = _.get(this.tags, 'values.store_part_rework_reason') || []
      let allTag = []
      storePartReworkReason.forEach(item => { allTag = new Set([...allTag, ...item.reason]) })
      return [...allTag]
    },
    // 门店退回理由
    storeReworkReason () {
      const hasStoreReworkReason = this.tags && this.tags.values && this.tags.values.store_rework_reason
      if (this.showRecedeReason && hasStoreReworkReason) {
        return this.tags.values.store_rework_reason
      } else {
        return ''
      }
    },
    // 门店退回备注
    storeReworkNote () {
      const hasStoreReworkNote = this.tags && this.tags.values && this.tags.values.store_rework_note
      if (this.showRecedeReason && hasStoreReworkNote) {
        return this.tags.values.store_rework_note
      } else {
        return ''
      }
    },
    // 压缩图片地址
    imageSrc () {
      // 不是上传显示
      if (!this.fileData) {
        if (this.src.includes('http')) return this.src
        const errorReplaceUrl = `${this.imgCompressDomain}${this.errorReplaceUrl}`
        const imageUrl = `${this.imgCompressDomain}${this.src}`
        return this.errorReplaceUrl ? errorReplaceUrl : imageUrl
      } else {
        return ''
      }
    },
    // 照片去除后缀名字
    photoRealName () {
      const photoFileNam = this.src.split('/')
      return photoFileNam[photoFileNam.length - 1]
    },
    // 展示图片
    getPreviewPhoto () {
      const imgDomain = this.src.includes('http') ? '' : this.imgDomain
      if (this.preview) {
        return [imgDomain + this.src]
      } else if (this.previewBreviary) {
        return [this.imgCompressDomain + this.src]
      } else {
        return []
      }
    },
    // 特效字段
    specialEffects () {
      const special = _.get(this.tags, 'values.special_efficacy') || '无需特效'
      return special
    },
    // 是否显示作图
    showCanvas () {
      return Boolean(this.fileData)
    }
  },
  watch: {
    src: {
      handler (value) {
        if (this.showCanvas) return
        this.errorCount = 0
        this.loading = true
      }
    }
  },
  created () {
    if (this.useEleImage && !this.fileData) { this.loading = true }
  },
  mounted () {
    this.preloadImg()
  },
  beforeDestroy () {
    if (!this.linkTag) return
    const head = document.getElementsByTagName('head')[0]
    head.removeChild(this.linkTag)
  },
  methods: {
    /**
     * @description 排查问题
     */
    async debugNetWork () {
      await this.$ipcRenderer.sendSync('network-debug', this.imageSrc)
    },
    /**
     * @description 下载成功
     * @param {String} type [original]
     */
    downingPhoto (type) {
      const savePath = `/${this.streamNum}`
      let imgSrc = type === 'original' ? this.orginPhotoPath : this.src
      imgSrc = imgSrc || this.src

      const data = {
        url: this.imgDomain + imgSrc,
        path: savePath
      }

      if (this.rename) {
        const ext = PhotoTool.getFilePostfix(imgSrc)
        data.rename = `${this.rename}${ext}`
      }

      this.$newMessage.success('已添加一张照片到下载')
      DownIpc.addDownloadFile(data)
    },
    /**
     * @description 下载原始图片显示
     */
    downingOrginLinkPhoto () {
      const savePath = `/${this.streamNum}`
      const imgSrc = this.orginLinkPhotoPath
      const data = {
        url: this.imgDomain + imgSrc,
        path: savePath
      }
      this.$newMessage.success('已添加一张照片到下载')
      DownIpc.addDownloadFile(data)
    },
    /**
     * @description 预加载
     */
    preloadImg () {
      if (this.preloadPhoto && this.cacheImageSwitch) {
        const head = document.getElementsByTagName('head')[0]
        const photoLink = this.imgDomain + this.src
        this.linkTag = document.createElement('link')
        this.linkTag.href = photoLink
        this.linkTag.rel = 'preload'
        this.linkTag.setAttribute('as', 'image')
        head.appendChild(this.linkTag)
      }
    },
    /**
     * @description 图片加载成功
     */
    onLoadImageSuccess () {
      this.loading = false
    },
    /**
     * @description 图片加载失败
     */
    onLoadImageError () {
      if (this.errorCount < 4) {
        setTimeout(() => {
          this.errorCount++
          this.errorReplaceUrl = `${this.src}?errorCounnnt=${this.errorCount}`
        }, 2000)
      } else {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="less">
@import '../../styles/variables.less';

.img-box {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  overflow: hidden;
  border-radius: 4px;

  &.image-load {
    &::after {
      position: absolute;
      top: 50%;
      left: 50%;
      display: block;
      margin: -16px 0 0 -16px;
      font-family: @elementIcons !important;
      font-size: 32px;
      color: #606266;
      content: '\e6cf';
      animation: rotating 2s linear infinite;
    }

    .image-loading-model {
      width: 100%;
      padding-bottom: 100%;
      background-color: #f1f1f1;
    }
  }

  .photo-name {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 10px;
    font-size: 12px;
    line-height: 16px;
    color: #fff;
    word-break: break-all;
    background: @gradualTransparent;
  }

  .lekima-tag {
    position: absolute;
    top: 0;
    left: 0;
    width: 56px;
    height: 24px;
    font-size: 12px;
    font-weight: 500;
    line-height: 24px;
    color: #fff;
    text-align: center;
    background: linear-gradient(51deg, rgb(255, 126, 0) 0%, rgb(255, 0, 0) 100%);
    border-radius: 0 0 6px 0;
  }

  .photo-tags {
    position: absolute;
    bottom: 0;
    display: flex;
    flex-direction: column;

    .tag {
      display: inline-block;
      width: max-content;
      padding: 3px 6px;
      font-size: 10px;
      font-weight: 600;
      color: #fff;
      border-radius: 0 8px 0 0;

      &.red-tag {
        background: @red;
      }

      &.warning-tag {
        background: @orange;
      }

      &.gray-tag {
        background: @gray;
      }

      &.blue-tag {
        background: @sky-blue;
      }

      &.green-tag {
        background: @green;
      }
    }
  }

  .el-image {
    position: absolute;
    width: 100%;
    height: 100%;

    img {
      -webkit-user-select: none;
      -webkit-user-drag: none;
      user-select: none;
      object-position: top;
    }
  }

  .show-center {
    img {
      -webkit-user-select: none;
      -webkit-user-drag: none;
      object-position: center;
    }
  }

  .image-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 30px;
    color: #909399;
    background-color: #f5f7fa;

    .image-error-tip {
      margin-top: 20px;
      font-size: 16px;
    }

    .debug-network-button {
      font-size: 12px;
    }
  }

  .orgin-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
  }
}

.handle-box {
  display: flex;
  justify-content: space-between;
  padding: 12px 6px 6px;

  .el-button {
    padding: 0;
    font-size: 12px;
    font-weight: 400;
    line-height: 17px;
  }

  .people-num {
    font-size: 12px;
    font-weight: 400;
    line-height: 17px;
    color: #606266;
  }

  .joint-label {
    font-size: 12px;
    font-weight: 400;
    line-height: 17px;
    color: @red;
  }
}

.recede-reason {
  padding-top: 9px;
  margin: 0 6px 6px;
  font-size: 12px;
  line-height: 20px;
  color: @red;
  border-top: 1px solid #ebeef5;

  .recede-title {
    margin-bottom: 10px;
  }

  .reason-content {
    color: #606266;
    word-break: break-all;

    .reason-tag {
      height: auto;
      font-weight: 400;
      line-height: 20px;
      white-space: inherit;

      & + .reason-tag {
        margin-top: 5px;
      }
    }
  }
}
</style>
