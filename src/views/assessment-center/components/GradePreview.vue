<template>
  <div class="grade-preview">
    <div class="title">
      {{ showPhoto.version | toPhotoVerName }}
      <button type="button" class="button-close" @click="closePreview">
        <i id="closeImg" class="el-icon-close" />
      </button>
    </div>
    <div class="photoBox">
      <!-- 画板工具 -->
      <div class="photo-tool">
        <div class="tool" :class="{ 'active': canvasOption.drawType === 'move' }" @click.capture="changeDrawType('move')">
          <i id="move" class="el-icon-rank" data-type="move" />
          <span class="shortcut">V</span>
        </div>
        <div class="tool" :class="{ 'active': canvasOption.drawType === 'pen' }" @click="createCanvas">
          <i id="pen" class="el-icon-edit" />
          <span class="shortcut">B</span>
        </div>
        <div class="tool" :class="{ 'active': canvasOption.drawType === 'arrow' }" @click="changeDrawType('arrow')">
          <i id="arrow" class="el-icon-top-right" />
          <span class="shortcut">C</span>
        </div>
        <div class="tool" :class="{ 'active': canvasOption.drawType === 'ellipse' }" @click="changeDrawType('ellipse')">
          <i id="ellipse" class="el-icon-circle-plus-outline" />
        </div>
        <div class="tool" :class="{ 'active': canvasOption.drawType === 'line' }" @click="changeDrawType('line')">
          <i id="line" class="el-icon-minus" />
        </div>
        <div class="tool" :class="{ 'active': canvasOption.drawType === 'blowup' }" @click="changeDrawType('blowup')">
          <i id="blowup" class="el-icon-search" />
          <span class="shortcut">Z</span>
        </div>
        <div class="tool" @click="changeDrawType('delete')">
          <i id="delete" class="el-icon-delete" />
        </div>
        <el-popover
          placement="right"
          width="200"
          popper-class="tool-line"
          trigger="click"
        >
          <el-slider v-model="canvasOption.lineWidth" />
          <div slot="reference" class="tool">
            <i id="lineWidth" class="el-icon-s-operation" />
          </div>
        </el-popover>
        <div class="tool tool-color">
          <el-color-picker v-model="canvasOption.penColor" size="mini" />
        </div>
      </div>
      <!-- 图片 -->
      <div class="photo-show">
        <div v-loading="loading" class="orginPhoto">
          <img
            id="orginImg"
            ref="orgin-img"
            :style="photoZoomStyle + (inZoomIn && 'cursor: zoom-out;')"
            :src="showPhoto.src"
            :alt="showPhoto.title"
            @load="loadingPhoto"
            @click="zoom"
          >
          <div id="_magnifier_layer" />
          <fabric-canvas v-if="showCanvas" ref="fabric-canvas" :style="photoZoomStyle" :option-obj="canvasOption" @cancelDeleteLabel="addDeleteLabel" @click.native="zoom" />
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
      <!-- 右边栏 -->
      <div class="photo-mark">
        <!-- 缩略图 -->
        <div id="smallImg" v-loading="loading" class="small-img">
          <div v-show="isShow" class="breviary-photo">
            <div class="smallPhoto">
              <div id="img-box" style="position: relative;">
                <img
                  :src="showPhoto.src"
                  alt="缩略图"
                  @mouseout="handOut"
                  @mousemove="handMove"
                  @mouseover="handOver"
                >
                <div class="_magnifier_zoom" />
              </div>
            </div>
            <div class="contant">
              <el-slider v-model="scaleNum" />
              {{ scaleNum * 4 + 100 }}%
              <div class="driver-star" @click.stop="guide">?</div>
            </div>
            <div class="down-button">下载</div>
          </div>
        </div>
        <order-info-module :order-info="info" />
        <div class="issue-label">
          <el-tag
            v-for="tag in cacheLabel"
            :key="tag.id"
            class="cache-issue"
            closable
            disable-transitions
            size="mini"
            type="info"
            @close="tagClose(tag)"
          >
            {{ tag.label }}
          </el-tag>
        </div>
        <!-- 问题标签 -->
        <div class="order-label">
          <template v-for="(labelClassItem, labelClassIndex) in labelData">
            <div v-if="labelClassItem.issueData.length" :key="labelClassIndex" class="label-box">
              <div class="label-class-title">{{ labelClassItem.label }}</div>
              <div class="label-content">
                <el-tag
                  v-for="issueItem in labelClassItem.issueData"
                  :key="'issue' + issueItem.id"
                  :class="`issue-tag-${labelClassIndex}`"
                  size="medium"
                  disable-transitions
                  @click="setLabel(issueItem)"
                >
                  {{ issueItem.label }}
                </el-tag>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import OrderInfoModule from './OrderInfoModule'
import labelMock from './labelMock'
import guideData from './guideData'
import Driver from 'driver.js' // 引导框
import 'driver.js/dist/driver.min.css'
import FabricCanvas from './FabricCanvas'
export default {
  name: 'GradePreview',
  components: { OrderInfoModule, FabricCanvas },
  props: {
    info: { type: Object, required: true },
    configs: {
      type: Object,
      default () {
        return {
          width: 100,
          height: 100,
          maskWidth: 100,
          maskHeight: 50,
          maskColor: 'red',
          maskOpacity: 0.5,
          scale: 100
        }
      }
    }
  },
  data () {
    return {
      photoIndex: 0,
      propConfigs: this.configs,
      imgObj: {},
      bigImg: {},
      mouseMask: {},
      imgLayer: {},
      imgRect: {},
      scaleNum: 25,
      loading: true,
      isShow: true,
      maxObj: {
        height: '',
        width: ''
      },
      driver: null,
      inZoomIn: false,
      photoZoomStyle: '',
      labelData: [],
      showCanvas: false,
      canvasOption: {
        width: 200,
        height: 200,
        penColor: '#E34F51',
        lineWidth: 2,
        drawType: ''
      },
      cacheLabel: []
    }
  },
  computed: {
    ...mapGetters(['imgDomain']),
    photoArray () {
      const data = this.info.photoVersion.map(item => {
        // 调试
        item.src = this.imgDomain + item.path
        return item
      })
      return data
    },
    showPhoto () {
      return this.photoArray[this.photoIndex]
    }
  },
  created () {
    console.log(this.info)
    this.labelData = JSON.parse(JSON.stringify(labelMock))
    this.driver = new Driver({
      nextBtnText: '下一个',
      prevBtnText: '上一个',
      doneBtnText: '完成',
      closeBtnText: '关闭'
    })
  },
  mounted () {
    /**
     * @description 监听键盘事件
     */
    document.onkeydown = e => {
      const key = window.event.keyCode
      console.log(key, '键位')
      switch (key) {
        case 49:
        case 50:
        case 51:
        case 52:
        case 53:
          this.scaleNum = (key - 49) * 25
          this.judgeHasZoom(e)
          break
        case 187:
        case 69:
          if (this.scaleNum < 100) { this.scaleNum++ }
          this.judgeHasZoom(e)
          break
        case 189:
        case 81:
          if (this.scaleNum > 0) { this.scaleNum-- }
          this.judgeHasZoom(e)
          break
        case 18:
        case 83:
          this.closePreview()
          break
        case 65:
        case 37:
          if (this.photoArray.length > 1) { this.prePhoto() }
          break
        case 39:
        case 68:
          if (this.photoArray.length > 1) { this.nextPhoto() }
          break
        case 16:
          this.isShow = !this.isShow
          break
        case 8:
          this.changeDrawType('delete')
          break
        case 66:
          this.createCanvas()
          break
        case 86:
          this.changeDrawType('move')
          break
        case 90:
          this.changeDrawType('blowup')
          break
        case 67:
          this.changeDrawType('arrow')
          break
        default:
          break
      }
    }
    this.$ipcRenderer.on('win-resize', (e, item) => {
      this.getImgInfo()
      if (this.showCanvas) {
        this.$refs['fabric-canvas'].resetCanvas()
      }
    })
  },
  methods: {
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
      const canvasWidth = orginImgDom.clientWidth
      const canvasHeight = orginImgDom.clientHeight
      this.canvasOption.width = canvasWidth
      this.canvasOption.height = canvasHeight
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
     * @description 鼠标移动
     */
    handMove (e) {
      // 获取在图片的位置
      const objX = e.clientX - this.imgRect.left
      const objY = e.clientY - this.imgRect.top
      // 判断是否超出界限
      var _maskX = objX - this.mouseMask.offsetHeight / 2
      var _maskY = objY - this.mouseMask.offsetWidth / 2
      if (_maskY <= 0) {
        _maskY = 0
      }
      if (_maskY + this.mouseMask.offsetHeight >= this.imgRect.height) {
        _maskY = this.imgRect.height - this.mouseMask.offsetHeight
      }
      if (_maskX <= 0) {
        _maskX = 0
      }
      if (_maskX + this.mouseMask.offsetWidth >= this.imgRect.width) {
        _maskX = this.imgRect.width - this.mouseMask.offsetWidth
      }
      this.mouseMask.style.webkitTransform = `translate3d(${_maskX}px,${_maskY}px,0)`
      const backgroundX =
        ((_maskX / this.imgRect.width) *
          this.propConfigs.width *
          this.propConfigs.scale) /
        100
      const backgroundY =
        ((_maskY / this.imgRect.height) *
          this.propConfigs.height *
          this.propConfigs.scale) /
        100
      this.imgLayer.style.backgroundPositionX = `-${backgroundX}px `
      this.imgLayer.style.backgroundPositionY = `-${backgroundY}px `
    },
    /**
     * @description 鼠标移出
     */
    handOut (e) {
      this.imgLayer.removeAttribute('style')
      this.mouseMask.removeAttribute('style')
    },
    /**
     * @description 鼠标移进
     */
    handOver (e) {
      // 获取大图尺寸
      this.imgObj = this.$el.getElementsByTagName('img')[1]
      this.imgBigObj = this.$el.getElementsByTagName('img')[0]
      this.imgRect = this.imgObj.getBoundingClientRect()
      this.imgBigRect = this.imgBigObj.getBoundingClientRect()
      // 马克图宽度计算系数
      this.propConfigs.maskWidth =
        (this.imgRect.width / (this.scaleNum * 4 + 100)) * 100
      this.propConfigs.maskHeight =
        this.propConfigs.maskWidth *
        (this.imgRect.height / this.imgRect.width)
      // 背景图放大系数
      this.propConfigs.scale =
        (this.imgRect.width / this.propConfigs.maskWidth) * 100
      // 获取大图信息
      this.bigImg = new Image()
      this.bigImg.src = this.showPhoto.src
      this.bigImg.height =
        (this.bigImg.height * this.propConfigs.scale) / 100
      this.bigImg.width = (this.bigImg.width * this.propConfigs.scale) / 100
      // 创建鼠标选择区域
      this.mouseMask = document.querySelector('._magnifier_zoom')
      this.mouseMask.style.background = this.propConfigs.maskColor
      this.mouseMask.style.height = this.propConfigs.maskHeight + 'px'
      this.mouseMask.style.width = this.propConfigs.maskWidth + 'px'
      this.mouseMask.style.opacity = this.propConfigs.maskOpacity
      this.imgObj.parentNode.appendChild(this.mouseMask)
      // 创建预览框
      const imgLayer = document.getElementById('_magnifier_layer')
      const orginImg = document.getElementById('orginImg')
      this.propConfigs.width = orginImg.width
      this.propConfigs.height = orginImg.height
      this.imgLayer = imgLayer
      const _layerHeight = this.propConfigs.height
      const _layerWidth = this.propConfigs.width
      imgLayer.style.width = _layerWidth + 'px'
      imgLayer.style.height = _layerHeight + 'px'
      imgLayer.style.backgroundImage = `url('${this.showPhoto.src}')`
      imgLayer.style.backgroundRepeat = 'no-repeat'
      imgLayer.style.backgroundSize = `${this.propConfigs.scale}%`
      document.getElementsByClassName('orginPhoto')[0].appendChild(imgLayer)
    },
    /**
     * @description 滑块滑动改变值
     * @param {Number} [放大系数]
     */
    formatTooltip (val) {
      return val + 100
    },
    /**
     * @description 上一张图片
     */
    prePhoto () {
      const beforePath = this.photoArray[this.photoIndex].path
      if (this.photoIndex === 0) {
        this.photoIndex = this.photoArray.length - 1
      } else {
        this.photoIndex--
      }
      const nextPath = this.photoArray[this.photoIndex].path
      if (beforePath === nextPath) return
      this.loading = true
    },
    /**
     * @description 下一张图片
     */
    nextPhoto () {
      const beforePath = this.photoArray[this.photoIndex].path
      if (this.photoIndex === this.photoArray.length - 1) {
        this.photoIndex = 0
      } else {
        this.photoIndex++
      }
      const nextPath = this.photoArray[this.photoIndex].path
      if (beforePath === nextPath) return
      this.loading = true
    },
    /**
     * @description 放大
     */
    zoom (e) {
      if (this.canvasOption.drawType !== 'blowup') return
      if (this.inZoomIn) {
        this.photoZoomStyle = ''
        this.inZoomIn = false
      } else {
        const imageWidth = e.target.clientWidth
        const imageHeight = e.target.clientHeight
        const clickX = (e.offsetX / imageWidth * 100).toFixed(2) + '%'
        const clickY = (e.offsetY / imageHeight * 100).toFixed(2) + '%'
        const zoomScale = (this.scaleNum * 4 + 100) / 100
        this.photoZoomStyle = `transform-origin: ${clickX} ${clickY}; transform: scale(${zoomScale});`
        this.inZoomIn = true
      }
    },
    /**
     * @description 判断是否处于放大中
     */
    judgeHasZoom (e) {
      const isOverIn = Boolean(this.imgLayer.style.width)
      if (isOverIn) { this.handOver(e) }
    },
    /**
     * @description 设置标签
     */
    setLabel (issueItem) {
      if (!this.showCanvas) { this.createCanvas() }
      this.$nextTick(() => {
        this.labelData.forEach(classItem => {
          const findIssueLabelIndex = classItem.issueData.findIndex(issueLabel => issueLabel.id === issueItem.id)
          if (findIssueLabelIndex >= 0) {
            const setLabelData = classItem.issueData.splice(findIssueLabelIndex, 1)
            this.cacheLabel.push(...setLabelData)
            this.$refs['fabric-canvas'].createLabel(...setLabelData)
          }
        })
      })
    },
    tagClose (tagInfo) {
      console.log(tagInfo)
      this.$refs['fabric-canvas'].deleteLabel(tagInfo)
    },
    /**
     * @description 创建canvas
     */
    createCanvas () {
      if (!this.showCanvas) {
        this.getImgInfo()
        this.showCanvas = true
      }
      this.changeDrawType('pen')
    },
    changeDrawType (drawType) {
      if (drawType !== 'blowup' && !this.showCanvas) {
        this.$newMessage.warning('请创建画板')
        return
      }
      if (drawType === 'blowup' && this.inZoomIn) {
        this.$refs['fabric-canvas'].$el.style.cursor = 'zoom-out'
      }
      this.canvasOption.drawType = drawType
    },
    /**
     * @description 撤销删除标签
     */
    addDeleteLabel (data) {
      console.log(data, 'addDeleteLabel')
      const findIssueClass = this.labelData.find(labelClassItem => labelClassItem.id === data.pid)
      const findIssueLabelIndex = this.cacheLabel.findIndex(labelItem => labelItem.id === data.id)
      if (findIssueClass) { findIssueClass.issueData.push(data) }
      if (findIssueLabelIndex >= 0) { this.cacheLabel.splice(findIssueLabelIndex, 1) }
    }
  }
}
</script>

<style lang="less" scoped>
.grade-preview {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1900 !important;
  background-color: #424242;

  .title {
    width: 100%;
    height: 40px;
    box-sizing: border-box;
    position: relative;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    font-size: 22px;
    line-height: 40px;
    color: #ddd;
    background-color: #535353;
    text-align: center;

    .button-close {
      position: absolute;
      width: 30px;
      height: 30px;
      border: none;
      right: 10px;
      padding: 0;
      top: 5px;
      background-color: #535353;
      outline: none;
      cursor: pointer;

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
    height: calc(100% - 40px);
    position: relative;
    display: flex;

    .photo-tool {
      width: 50px;
      background-color: #535353;

      .tool {
        width: 50px;
        height: 50px;
        font-size: 16px;
        color: #eee;
        padding: 10px;
        text-align: center;
        line-height: 30px;
        background-clip: content-box;
        transition: all 0.3s ease;
        cursor: pointer;
        border-radius: 13px;
        position: relative;

        .shortcut {
          position: absolute;
          right: 10px;
          bottom: 5px;
          font-size: 10px;
        }

        &:hover {
          background-color: #fff;
          color: #9d9d9d;
        }

        &.active {
          background-color: #fff;
          color: #9d9d9d;
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
    }

    .photo-show {
      width: calc(100% - 300px);
      position: relative;

      .orginPhoto {
        background-color: #282828;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        height: 100%;
        margin: auto;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;

        img {
          max-width: 100%;
          max-height: 100%;
        }
      }

      .button-left {
        position: absolute;
        width: 50px;
        height: 50px;
        border: none;
        border-radius: 50%;
        top: calc(50% - 25px);
        left: 10px;
        z-index: 4020;
        outline: none;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        background-color: #383838;
        cursor: pointer;

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
        width: 50px;
        height: 50px;
        border: none;
        z-index: 4020;
        border-radius: 50%;
        top: calc(50% - 25px);
        right: 10px;
        outline: none;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        background-color: #383838;
        cursor: pointer;

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
      width: 250px;
      position: relative;
      overflow: overlay;
      background-color: #535353;

      .small-img {
        width: 250px;
        box-sizing: border-box;
        z-index: 4001;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        background-color: #535353;
        position: sticky;
        top: 0;

        .smallPhoto {
          width: 100%;
          height: 250px;
          display: flex;
          justify-content: center;
          align-items: center;

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
          width: 80%;
          margin: auto;
          color: #ddd;
          text-align: center;

          .driver-star {
            display: inline-block;
            border-radius: 50%;
            height: 22px;
            width: 22px;
            margin-left: 10px;
            background-color: #fff;
            color: #333;
            line-height: 22px;
            cursor: pointer;
            box-shadow: inset 0 -5px 6px 0 rgba(46, 61, 73, 0.7);
            transition: all 0.5s;
            text-align: center;

            &:hover {
              box-shadow: inset -4px -4px 6px 0 rgba(46, 61, 73, 0.2);
            }
          }
        }

        .down-button {
          color: #ddd;
          padding: 10px 0;
          cursor: pointer;
          text-align: center;

          &:hover {
            color: #409eff;
          }
        }
      }

      .issue-label {
        padding: 10px;
        padding-bottom: 0;

        .cache-issue {
          margin-right: 10px;
          margin-bottom: 10px;
          -webkit-user-select: none;
        }
      }

      .order-label {
        padding: 0 12px 12px 12px;
        color: #eee;
        font-size: 12px;

        .panel-title {
          font-size: 14px;
          font-weight: 500;
        }

        .label-box {
          margin-bottom: 12px;

          .label-class-title {
            font-size: 14px;
            padding: 8px 0;
          }

          .label-content {
            .el-tag {
              margin: 0 8px 8px 0;
              font-size: 14px;
              cursor: pointer;
              -webkit-user-select: none;
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
.grade-preview {
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
</style>
