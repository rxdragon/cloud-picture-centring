<template>
  <div class="grade-preview">
    <div class="title">
      {{ showPhoto.version | toPhotoVerName }}
      <div class="driver-star" @click.stop="guide">?</div>
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
        <div class="tool" :class="{ 'active': canvasOption.drawType === 'pen' }" @click="changeDrawType('pen')">
          <el-popover
            placement="right-start"
            width="30"
            popper-class="pen-weight"
            trigger="click">
            <div class="pen-list">
              <div class="pen-item"
                v-for="penWeightItem in penWeight" :key="penWeightItem.label"
                @click="changeLineWidth(penWeightItem)">
                <div class="pen-box" :class="penWeightItem.active ? penWeightItem.label + ' active' :penWeightItem.label "></div>
              </div>
            </div>
            <div slot="reference">
              <i id="pen" class="el-icon-edit" />
              <span class="shortcut">B</span>
            </div>
          </el-popover>
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
          <fabric-canvas v-if="showCanvas" ref="fabric-canvas"
            :style="photoZoomStyle" :option-obj="canvasOption"
            :show-canvas="isFinishPhoto"
            @cancelDeleteLabel="addDeleteLabel" @click.native="zoom" />
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
              <el-slider :show-tooltip="false" v-model="scaleNum" />
              <span class="scale-box">{{ scaleNum * 4 + 100 }}%</span>
              <span class="down-button" @click.stop="downing">下载</span>
            </div>
          </div>
        </div>
        <order-info-module :order-info="info" />
        <!-- TODO -->
        <!-- <div class="issue-label">
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
        </div> -->
        <!-- 问题标签 -->
        <div class="order-label">
          <div class="label-title">标签栏</div>
          <template v-for="(labelClassItem, labelClassIndex) in labelData">
            <div v-if="labelClassItem.issueData.length" :key="labelClassIndex" class="label-box">
              <div class="label-class-title">{{ labelClassItem.label }}</div>
              <div class="label-content">
                <el-tag
                  v-for="issueItem in labelClassItem.issueData"
                  :key="'issue' + issueItem.id"
                  :class="issueItem.isSelect ? 'active' : ''"
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
        <div class="submit-box">
          <el-button type="primary">提交评分</el-button>
          <el-button type="info" class="out-btn">退出</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import 'driver.js/dist/driver.min.css'
import DownIpc from '@electronMain/ipc/DownIpc'
import OrderInfoModule from './OrderInfoModule'
import labelMock from './labelMock'
import guideData from './guideData'
import Driver from 'driver.js' // 引导框
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
      cacheLabel: [],
      penWeight: [ // 画笔宽度数据
        {
          label: 'min',
          size: 2,
          active: true
        },
        {
          label: 'mid',
          size: 6,
          active: false
        },
        {
          label: 'big',
          size: 10,
          active: false
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['imgDomain']),
    photoArray () {
      const data = this.info.photoInfo.photoVersion.map(item => {
        item.src = this.imgDomain + item.path
        return item
      })
      return data
    },
    // 当前展示图片
    showPhoto () {
      return this.photoArray[this.photoIndex]
    },
    // 是云端成片
    isFinishPhoto () {
      return this.showPhoto.version === 'complete_photo'
    }
  },
  created () {
    console.warn(this.info)
    // TODO mock
    const createData = JSON.parse(JSON.stringify(labelMock))
    createData.forEach(item => {
      item.issueData.forEach(issItem => issItem.isSelect = false)
    })
    this.labelData = createData
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
      console.warn(key, '键位')
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
          if (this.scaleNum < 100) {
            this.scaleNum++
          }
          this.judgeHasZoom(e)
          break
        case 189:
        case 81:
          if (this.scaleNum > 0) {
            this.scaleNum--
          }
          this.judgeHasZoom(e)
          break
        case 18:
        case 83:
          this.closePreview()
          break
        case 65:
        case 37:
          if (this.photoArray.length > 1) {
            this.prePhoto()
          }
          break
        case 39:
        case 68:
          if (this.photoArray.length > 1) {
            this.nextPhoto()
          }
          break
        case 16:
          this.isShow = !this.isShow
          break
        case 8:
          this.changeDrawType('delete')
          break
        case 66:
          this.changeDrawType('pen')
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
      let _maskX = objX - this.mouseMask.offsetHeight / 2
      let _maskY = objY - this.mouseMask.offsetWidth / 2
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
      if (isOverIn) {
        this.handOver(e)
      }
    },
    /**
     * @description 设置标签
     */
    setLabel (issueItem) {
      if (!this.showCanvas) {
        this.createCanvas()
      }
      this.$nextTick(() => {
        this.labelData.forEach(classItem => {
          const findIssueLabelIndex = classItem.issueData.findIndex(issueLabel => issueLabel.id === issueItem.id)
          if (findIssueLabelIndex >= 0) {
            const setLabelData = classItem.issueData[findIssueLabelIndex]
            if (!setLabelData.isSelect) {
              this.$refs['fabric-canvas'].createLabel(setLabelData)
            } else {
              this.tagClose(issueItem)
            }
            setLabelData.isSelect = !setLabelData.isSelect
          }
        })
      })
    },
    /**
     * @description 标签关闭
     */
    tagClose (tagInfo) {
      this.$refs['fabric-canvas'].deleteLabel(tagInfo)
    },
    /**
     * @description 创建canvas
     */
    createCanvas () {
      if (!this.isFinishPhoto) {
        this.$newMessage.warning('请在成片上进行评分')
        return
      }
      if (!this.showCanvas) {
        this.getImgInfo()
        this.showCanvas = true
      }
      this.changeDrawType('pen')
    },
    /**
     * @description 更改画笔类型
     */
    changeDrawType (drawType) {
      if (drawType !== 'blowup' && !this.showCanvas) {
        this.createCanvas()
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
    addDeleteLabel (issueItem) {
      console.log(issueItem, 'addDeleteLabel')
      this.labelData.forEach(classItem => {
        const findIssueLabel = classItem.issueData.find(issueLabel => issueLabel.id === issueItem.id)
        if (findIssueLabel) {
          findIssueLabel.isSelect = false
        }
      })
    },
    /**
     * @description 导出图片
     */
    outPut () {
      this.$refs['fabric-canvas'].outPhoto()
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
     * @description 更改线宽
     */
    changeLineWidth (penWeightItem) {
      this.penWeight.forEach(item => item.active = false)
      penWeightItem.active = true
      this.canvasOption.lineWidth = penWeightItem.size
    }
  }
}
</script>

<style lang="less" scoped>
.grade-preview {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1900 !important;
  width: 100vw;
  height: 100vh;
  background-color: #424242;

  .title {
    position: relative;
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
    z-index: 5000;

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
      top: 5px;
      right: 10px;
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
    position: relative;
    display: flex;
    height: calc(100% - 42px);

    .photo-tool {
      width: 48px;
      background-color: #535353;
      position: relative;
      z-index: 5000;

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
    }

    .photo-show {
      position: relative;
      width: calc(100% - 328px);

      .orginPhoto {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        margin: auto;
        overflow: hidden;
        background-color: #282828;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

        img {
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
      width: 280px;
      overflow: overlay;
      background-color: #535353;
      z-index: 5000;

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

      // .issue-label {
      //   padding: 10px;
      //   padding-bottom: 0;

      //   .cache-issue {
      //     margin-right: 10px;
      //     margin-bottom: 10px;
      //     -webkit-user-select: none;
      //   }
      // }

      .order-label {
        padding: 14px 10px;
        font-size: 12px;
        color: #eee;

        .label-title {
          display: flex;
          align-items: center;
          font-size: 14px;
          font-weight: 500;

          &::before {
            display: inline-block;
            width: 2px;
            height: 16px;
            margin-right: 6px;
            content: '';
            background-color: #4669fb;
          }
        }

        .label-box {
          .label-class-title {
            padding: 10px 0;
            font-size: 14px;
            font-weight: 600;
            line-height: 20px;
            color: #eee;
          }

          .label-content {
            .el-tag {
              margin: 0 10px 10px 0;
              font-size: 12px;
              font-weight: 400;
              color: #eee;
              cursor: pointer;
              -webkit-user-select: none;
              background-color: #000;
              border: none;
              border-radius: 4px;
              opacity: 0.6;

              &.active {
                background-color: #808080;
              }
            }
          }
        }
      }

      .submit-box {
        position: sticky;
        bottom: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 60px;
        background-color: #535353;
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

.pen-weight {
  background-color: #535353;
  border-color: #535353;
  margin-left: 16px !important;
  min-width: 30px;
  padding: 0;

  .pen-list {
    height: 78px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;

    .pen-item {
      height: 26px;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      .pen-box {
        background-color: #282828;
        border-radius: 50%;

        &.active {
          background-color: #eee;
        }
      }
      
      .min {
        width: 2px;
        height: 2px;
      }

      .mid {
        width: 6px;
        height: 6px;
      }

      .big {
        width: 10px;
        height: 10px;
      }
    }
  }

  .popper__arrow {
    border-right-color: #535353 !important;

    &::after {
      border-right-color: #535353 !important;
    }
  }
}
</style>
