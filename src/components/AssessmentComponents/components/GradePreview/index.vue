<template>
  <div class="grade-preview">
    <div class="title">
      {{ showPhoto.version | toPhotoVerName }}
      <div class="driver-star" @click.stop="guide">?</div>
      <button type="button" class="button-close" @click="closePreview">
        <i id="closeImg" class="el-icon-close" />
      </button>
    </div>
    <div class="photoBox" v-loading="allLoading">
      <!-- 左侧栏 -->
      <div class="photo-mark">
        <div class="scroll-box">
          <!-- 缩略图 -->
          <div id="smallImg" v-loading="loading" class="small-img">
            <div v-show="isShow" class="breviary-photo">
              <div class="smallPhoto">
                <div id="img-box" style="position: relative;">
                  <img
                    ref="smallImg"
                    :src="showPhoto.src"
                    alt="缩略图"
                    @mouseout="handOut"
                    @mousemove="handMove"
                    @mouseover="handOver"
                  >
                  <div ref="magnifier_zoom" class="_magnifier_zoom" />
                </div>
              </div>
              <div class="contant">
                <el-slider :show-tooltip="false" v-model="scaleNum" />
                <span class="scale-box">{{ scaleNum * 4 + 100 }}%</span>
                <span class="down-button" @click.stop="downing">下载</span>
              </div>
            </div>
          </div>
          <!-- 工具 -->
          <MarkTool @changeTool="changeDrawType" :canvas-option="canvasOption" />
          <!-- 订单信息 -->
          <OrderInfoModule v-if="Object.keys(info).length" :order-info="info" />
        </div>
      </div>
      <!-- 图片 -->
      <div class="photo-show">
        <div v-loading="loading" ref="photo-show-main" class="orginPhoto">
          <img
            id="orginImg"
            ref="orgin-img"
            :style="photoZoomStyle + (inZoomIn && 'cursor: zoom-out;')"
            :src="showPhoto.src"
            :alt="showPhoto.title"
            @load="loadingPhoto"
            @click="zoom"
          >
          <div ref="magnifier_layer" id="_magnifier_layer" />
          <FabricCanvas
            v-if="showCanvas"
            ref="fabric-canvas"
            :style="photoZoomStyle"
            :option-obj="canvasOption"
            :show-canvas="isFirstPhoto"
            @click.native="zoom"
          />
        </div>
        <!-- left按钮 -->
        <button
          v-if="photoArray.length !== 1"
          type="button"
          class="button-left"
          @click.stop="prePhoto"
        >
          <i class="el-icon-arrow-left" />
        </button>
        <!-- right按钮 -->
        <button
          v-if="photoArray.length !== 1"
          type="button"
          class="button-right"
          @click.stop="nextPhoto"
        >
          <i class="el-icon-arrow-right" />
        </button>
      </div>
      <!-- 右侧栏 -->
      <div class="photo-tool">
        <GradeLabel class="scroll-box" />
        <div class="button-box">
          <el-button type="info" class="out-btn" @click="closePreview">退出</el-button>
          <el-button type="primary" @click="submitData">提交评分</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import 'driver.js/dist/driver.min.css'
import Driver from 'driver.js' // 引导框
import { TOOL_TYPE } from './ToolEnumerate.js'
import { PHOTO_VERSION } from '@/utils/enumerate'

import OrderInfoModule from './OrderInfoModule.vue'
import FabricCanvas from './FabricCanvas.vue'
import MarkTool from './MarkTool.vue'
import GradeLabel from './GradeLabel.vue'

import DownIpc from '@electronMain/ipc/DownIpc'
import guideData from './guideData'
import PreviewMix from '@/mixins/preview-mixins'
import canvasMix from './keyDownEventMix.js'

import { mapGetters } from 'vuex'

export default {
  name: 'GradePreview',
  components: { OrderInfoModule, FabricCanvas, MarkTool, GradeLabel },
  mixins: [PreviewMix, canvasMix],
  provide () {
    return {
      judageCanvas: this.createCanvas
    }
  },
  props: {
    info: { type: Object, required: true },
    photoVersion: { type: String, required: true }
  },
  data () {
    return {
      photoIndex: 0, // 展示照片索引
      driver: null, // 引导信息
      showCanvas: false,
      isSubmit: false, // 是否提交
      allLoading: false, // 整个页面loading
    }
  },
  computed: {
    ...mapGetters(['imgDomain']),
    // 展示照片数据
    photoArray () {
      const photoVersion = _.get(this.info, 'photoInfo.photoSpotCheckVersion', [])
      const data = photoVersion.map(item => {
        item.src = this.imgDomain + item.path
        return item
      })
      return data
    },
    // 当前展示图片
    showPhoto () {
      return this.photoArray[this.photoIndex] || {}
    },
    // 是否最新修片
    isFirstPhoto () {
      return this.showPhoto.version === PHOTO_VERSION.FIRST_PHOTO
    }
  },
  created () {
    this.initShowPhoto()
    this.driver = new Driver({
      nextBtnText: '下一个',
      prevBtnText: '上一个',
      doneBtnText: '完成',
      closeBtnText: '关闭'
    })
  },
  mounted () {
    this.$ipcRenderer.on('win-resize', this.onWindowResize)
  },
  beforeDestroy () {
    this.$ipcRenderer.removeListener('win-resize', this.onWindowResize)
  },
  methods: {
    /**
     * @description 提交分数
     */
    async submitData () {
      try {
        this.isSubmit = true
        // 获取批注图片
        let markPhotoImg = ''
        if (this.showCanvas && this.$refs['fabric-canvas'].hasDraw()) {
          markPhotoImg = await this.$refs['fabric-canvas'].outPhoto()
        }
        // 获取标签数据
        const lableId = this.getActiveLableId()
        this.showCanvas = false
        this.canvasOption.drawType = ''
        const sendData = {
          markPhotoImg,
          lableId
        }
        this.$emit('submit', sendData)
        this.resetLabelData()
      } catch (error) {
        this.$newMessage.error('上传标记图失败')
      }
    },
    /**
     * @description 获取选中标签
     */
    getActiveLableId () {
      if (!this.$refs['fabric-canvas']) return []
      const activeLableList = this.$refs['fabric-canvas'].activeLableList
      const ids = []

      activeLableList.forEach(item => {
        if (!item) return
        ids.push({
          id: item.levelId
        })
      })
      return ids
    },
    /**
     * @description 重制标签
     */
    resetLabelData () {
      this.$bus.$emit('reset-grade-lable')
    },
    /**
     * @description 提示按钮
     */
    guide () {
      const steps = guideData
      this.driver.defineSteps(steps)
      this.driver.start()
    },
    /**
     * @description 获取图片信息
     */
    getImgInfo () {
      const orginImgDom = this.$refs['orgin-img']
      if (orginImgDom) {
        this.canvasOption.width = orginImgDom.clientWidth
        this.canvasOption.height = orginImgDom.clientHeight
      }
    },
    /**
     * @description 关闭窗口
     */
    closePreview () {
      this.$emit('update:show', false)
    },
    /**
     * @description 取消加载
     */
    loadingPhoto () {
      this.loading = false
    },
    /**
     * @description 创建canvas
     */
    createCanvas (drawType) {
      if (!this.isFirstPhoto) {
        this.$newMessage.warning('请在一次成片上进行评分')
        return false
      }
      if (!this.showCanvas) {
        this.getImgInfo()
        this.showCanvas = true
        if (drawType) { this.$nextTick(() => { this.changeDrawType(drawType) }) }
      }
      return true
    },
    /**
     * @description 更改画笔类型
     */
    changeDrawType (drawInfo) {
      if (!this.$parent.showGradePreview) return false
      const { type, value } = drawInfo

      if (type === TOOL_TYPE.COLOR) {
        this.canvasOption.penColor = value
        return
      }

      if (type !== TOOL_TYPE.BLOWUP && !this.showCanvas) {
        this.createCanvas(drawInfo)
        return
      }
      if (type === TOOL_TYPE.BLOWUP && this.inZoomIn) {
        this.$refs['fabric-canvas'].$el.style.cursor = 'zoom-out'
      }
      this.canvasOption.drawType = type
    },
    /**
     * @description 下载图片
     */
    downing () {
      const pointIndex = this.showPhoto.src.lastIndexOf('!')
      let url = this.showPhoto.src
      if (pointIndex > 0) {
        url = this.showPhoto.src.substring(0, pointIndex)
      }
      const data = { url, path: '' }
      this.$newMessage.success('已添加一张照片到下载')
      DownIpc.addDownloadFile(data)
    },
    /**
     * @description 初始化图片版本
     */
    initShowPhoto () {
      const findIndex = this.photoArray.findIndex(item => item.version === this.photoVersion)
      this.photoIndex = findIndex
    },
    /**
     * @description 监听屏幕变化
     */
    onWindowResize (e, item) {
      this.getImgInfo()
      if (!this.showCanvas) return
      this.$nextTick(() => {
        if (!this.$refs['fabric-canvas']) return
        this.$refs['fabric-canvas'].resetCanvas()
      })
    },
    
  }
}
</script>

<style lang="less" scoped>
@navTop: 42px;

.grade-preview {
  position: fixed;
  top: @navTop;
  left: 0;
  z-index: 1900 !important;
  width: 100vw;
  height: calc(100vh - @navTop);
  background-color: #424242;

  .title {
    position: relative;
    z-index: 5000;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 42px;
    font-size: 22px;
    line-height: 40px;
    color: #ddd;
    text-align: center;
    background-color: #535353;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .driver-star {
      display: inline-block;
      width: 14px;
      height: 14px;
      margin-left: 4px;
      font-size: 12px;
      line-height: 1.3;
      color: #666;
      text-align: center;
      cursor: pointer;
      background-color: #999;
      border-radius: 50%;
    }

    .button-close {
      position: absolute;
      right: 0;
      width: 30px;
      height: 30px;
      padding: 0;
      cursor: pointer;
      background-color: #535353;
      border: none;
      outline: none;

      .el-icon-close {
        font-size: 20px;
        color: #cdcdcd;
      }

      &:hover {
        .el-icon-close {
          color: #fff;
        }
      }
    }
  }

  .photoBox {
    @leftWidth: 280px;
    @rightWidth: 280px;

    position: relative;
    display: flex;
    height: calc(100% - 40px);

    .photo-tool {
      position: relative;
      z-index: 5000;
      width: @rightWidth;
      background-color: #535353;

      .tool {
        position: relative;
        width: 48px;
        height: 48px;
        padding: 10px;
        font-size: 16px;
        line-height: 30px;
        color: #eee;
        text-align: center;
        cursor: pointer;
        background-clip: content-box;
        border-radius: 13px;
        transition: all 0.3s ease;

        .circle {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 1px solid;
          border-radius: 50%;
        }

        .shortcut {
          position: absolute;
          right: 10px;
          bottom: 5px;
          font-size: 10px;
        }

        &:hover {
          color: #eee;
          background-color: #282828;
        }

        &.active {
          color: #eee;
          background-color: #282828;
        }
      }

      .tool-color {
        .el-color-picker__trigger {
          border: none;
        }

        &:hover {
          background-color: rgba(0, 0, 0, 0);
        }
      }

      .scroll-box {
        height: calc(100% - 60px);
        overflow: overlay;
      }

      .button-box {
        position: absolute;
        bottom: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 60px;
        border-top: 1px solid #666;

        .out-btn {
          background-color: #666;
          border-color: #666;

          &:hover {
            background-color: #535353;
          }
        }
      }
    }

    .photo-show {
      position: relative;
      width: calc(~'100vw - @{leftWidth} - @{rightWidth}');

      .orginPhoto {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        margin: auto;
        overflow: hidden;
        touch-action: none;
        user-select: none;
        background-color: #282828;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

        img {
          -webkit-user-drag: none;
          max-width: 100%;
          max-height: 100%;
        }
      }

      .button-left {
        position: absolute;
        top: calc(50% - 25px);
        left: 10px;
        z-index: 4020;
        width: 50px;
        height: 50px;
        cursor: pointer;
        background-color: #383838;
        border: none;
        border-radius: 50%;
        outline: none;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

        i {
          font-size: 20px;
          color: #cdcdcd;
        }

        &:hover {
          background-color: #535353;

          i {
            color: #fff;
          }
        }
      }

      .button-right {
        position: absolute;
        top: calc(50% - 25px);
        right: 10px;
        z-index: 4020;
        width: 50px;
        height: 50px;
        cursor: pointer;
        background-color: #383838;
        border: none;
        border-radius: 50%;
        outline: none;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

        .el-icon-arrow-right {
          font-size: 20px;
          color: #cdcdcd;
        }

        &:hover {
          background-color: #535353;

          .el-icon-arrow-right {
            color: #fff;
          }
        }
      }
    }

    .photo-mark {
      position: relative;
      z-index: 5000;
      width: @leftWidth;
      background-color: #535353;

      .scroll-box {
        width: 100%;
        height: 100%;
        padding-bottom: 80px;
        overflow: overlay;
      }

      .small-img {
        position: sticky;
        top: 0;
        z-index: 4001;
        box-sizing: border-box;
        box-sizing: content-box;
        width: 250px;
        padding: 0 15px;
        background-color: #535353;
        border-bottom: 1px solid #666;

        .smallPhoto {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 250px;
          background-color: #282828;

          ._magnifier_zoom {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 4010;
            pointer-events: none;
          }

          #img-box {
            width: max-content;
            height: max-content;
            text-align: center;
            vertical-align: bottom;

            img {
              max-width: 100%;
              max-height: 100%;
            }
          }
        }

        .contant {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: auto;
          color: #ddd;
          text-align: left;

          .el-slider {
            display: inline-block;
            width: 160px;
            margin-right: 8px;
          }

          .scale-box {
            margin-right: auto;
            font-size: 14px;
            font-weight: 400;
            line-height: 20px;
            color: #eee;
          }

          .down-button {
            font-size: 14px;
            font-weight: 400;
            line-height: 20px;
            color: #eee;
            cursor: pointer;

            &:hover {
              color: #ddd;
            }
          }

          & /deep/ .el-slider__runway {
            height: 4px;
            margin: 14px 0;
            background-color: #282828;

            .el-slider__bar {
              height: 4px;
              background: linear-gradient(33deg, #91f5ff 0%, #71b9fd 45%, #4669fb 100%);
            }

            .el-slider__button {
              width: 12px;
              height: 12px;
              border: 1px solid #409eff;
            }
          }
        }
      }
    }
  }

  #_magnifier_layer {
    position: absolute;
    z-index: 4000;
    background: #000;
  }

  .el-loading-mask {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
  }
}
</style>

<style lang="less">
.el-loading-mask {
  z-index: 6001;
}

.grade-preview {
  overflow: hidden;

  .tool-color {
    .el-color-picker__trigger {
      border: none;
    }
  }
}

.tool-line {
  .el-slider__runway {
    margin: 0;
  }
}

#driver-highlighted-element-stage {
  opacity: 0.3;
}

.el-color-picker__panel {
  background-color: #535353;
  border: 1px solid #535353;

  .el-color-dropdown__btns {
    .el-button--default {
      color: #eee;
      background-color: #666;
      border-color: #666;
    }
  }
}
</style>
