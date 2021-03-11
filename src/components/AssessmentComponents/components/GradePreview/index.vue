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
          <order-info-module v-if="Object.keys(info).length" :order-info="info" />
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
          <fabric-canvas
            v-if="showCanvas"
            ref="fabric-canvas"
            :style="photoZoomStyle"
            :option-obj="canvasOption"
            :show-canvas="isFirstPhoto"
            @cancelDeleteLabel="addDeleteLabel"
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
      </div>
    </div>
  </div>
</template>

<script>
import 'driver.js/dist/driver.min.css'
import Driver from 'driver.js' // 引导框
import { TOOL_TYPE } from './ToolEnumerate.js'

import OrderInfoModule from './OrderInfoModule.vue'
import FabricCanvas from './FabricCanvas.vue'
import MarkTool from './MarkTool.vue'

import DownIpc from '@electronMain/ipc/DownIpc'
import guideData from './guideData'

import * as AssessmentCenter from '@/api/assessmentCenter'
import * as GradeConfiguration from '@/api/gradeConfiguration'

import { mapGetters } from 'vuex'
import { PlantIdTypeEnum, PHOTO_VERSION } from '@/utils/enumerate'


let allLabel = null
let goodWord = []

export default {
  name: 'GradePreview',
  components: { OrderInfoModule, FabricCanvas, MarkTool },
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
    },
    photoVersion: { type: String, required: true }
  },
  data () {
    return {
      photoIndex: 0, // 展示照片索引
      propConfigs: this.configs, // 参数配置
      imgObj: {}, // 照片dom
      bigImg: {}, // 大图dom
      mouseMask: {}, // 图片标记配置
      imgLayer: {}, // 照片布局
      imgRect: {}, // 图片信息
      scaleNum: 25, // 放大倍数
      loading: true, // 是否加载
      isShow: true, // 是否显示
      maxObj: { // 最大宽高
        height: '',
        width: ''
      },
      driver: null, // 引导信息
      inZoomIn: false, // 是否放大中
      photoZoomStyle: '', // 图片信息
      labelDataTop: [], // 种拔草标签, 选了这个以后才能展示对应的标签数据
      labelData: [], // 标签数据
      showCanvas: false,
      canvasOption: { // canvas 信息
        width: 200,
        height: 200,
        penColor: '#E34F51',
        lineWidth: 2,
        drawType: ''
      },
      isSubmit: false, // 是否提交
      allLoading: false, // 整个页面loading
      currentId: '', // 当前种拔草的id 1种草,2拔草,3一般
      hasPushGoodWord: false
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
    this.fetchGoodWord()
    this.initShowPhoto()
    this.getLabelData()
    this.driver = new Driver({
      nextBtnText: '下一个',
      prevBtnText: '上一个',
      doneBtnText: '完成',
      closeBtnText: '关闭'
    })
  },
  mounted () {
    this.registerKeyDownEvent()
    // TODO 添加注销事件
    this.$ipcRenderer.on('win-resize', (e, item) => {
      this.getImgInfo()
      if (!this.showCanvas) return
      this.$nextTick(() => {
        if (!this.$refs['fabric-canvas']) return
        this.$refs['fabric-canvas'].resetCanvas()
      })
    })
  },
  beforeDestroy () {
    document.onkeydown = null
  },
  methods: {
    /**
     * @description 提交分数
     */
    async submitData () {
      try {
        const issuesLabel = this.getIssuesData()
        const issuesLabelId = issuesLabel.reduce((sumArr, item) => {
          if (item.type !== 'goodWord') { sumArr.push({ id: item.id }) }
          return sumArr
        }, [])
        const typeLabelId = issuesLabel.reduce((sumArr, item) => {
          if (item.type === 'goodWord') { sumArr.push(item.id) }
          return sumArr
        }, [])
        this.isSubmit = true
        let markPhotoImg = ''
        if (this.showCanvas && this.$refs['fabric-canvas'].hasDraw()) {
          markPhotoImg = await this.$refs['fabric-canvas'].outPhoto()
        }
        this.showCanvas = false
        this.canvasOption.drawType = ''
        const sendData = {
          issuesLabelId,
          markPhotoImg,
          typeLabelId,
          type: PlantIdTypeEnum[this.currentId]
        }
        this.$emit('submit', sendData)
        this.resetLabelData()
      } catch (error) {
        console.error(error)
        this.$newMessage.error('上传标记图失败')
      }
    },
    /**
     * @description 获取选中标签
     */
    getIssuesData () {
      let selectData = []
      this.labelData.forEach(item => {
        const itemSelectLabel = item.child.filter(issueItem => issueItem.isSelect)
        selectData = [...selectData, ...itemSelectLabel]
      })
      return selectData
    },
    /**
     * @description 获取所有数据
     */
    async getLabelData () {
      const labelInfo = await AssessmentCenter.getScoreConfigList()
      this.labelDataTop = labelInfo.typeArr
      allLabel = labelInfo.allLabel
    },
    /**
     * @description 获取激励词列表
     */
    async fetchGoodWord () {
      const words = await GradeConfiguration.getExcitationDirList()
      words.forEach(wordsItem => {
        wordsItem.isSelect = false
        wordsItem.type = 'goodWord'
      })
      goodWord = words
    },
    /**
     * @description 根据种拔草,选择对应的标签
     */
    selectTLabelData (selItem) {
      const { id } = selItem
      if (id === this.currentId) {
        return
      }
      this.resetLabelData()
      this.labelDataTop.forEach((item) => {
        item.isSelect = item.id === id
      })
      this.currentId = id
      this.labelData = allLabel[id]
      if (id === 1 && !this.hasPushGoodWord) { // 种草情况下,将激励词推进标签中
        this.labelData.push({
          name: '激励词',
          child: goodWord
        })
        this.hasPushGoodWord = true
      }
      this.showCanvas = false
    },
    /**
     * @description 重制标签
     */
    resetLabelData () {
      this.labelDataTop.forEach(item => {
        item.isSelect = false
      })
      this.labelData.forEach(item => {
        item.child.forEach(issItem => { issItem.isSelect = false })
      })
      this.currentId = ''
      this.labelData = []
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
      if (!this.createCanvas()) return false
      this.$nextTick(() => {
        this.labelData.forEach(classItem => {
          const findIssueLabel = classItem.child.find(issueLabel => issueLabel.id === issueItem.id)
          if (findIssueLabel) {
            if (!findIssueLabel.isSelect) {
              this.$refs['fabric-canvas'].createLabel(findIssueLabel)
              findIssueLabel.isSelect = true
            } else {
              this.tagClose(issueItem)
            }
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
        this.createCanvas(type)
        return
      }
      if (type === TOOL_TYPE.BLOWUP && this.inZoomIn) {
        this.$refs['fabric-canvas'].$el.style.cursor = 'zoom-out'
      }
      this.canvasOption.drawType = type
    },
    /**
     * @description 撤销删除标签
     */
    addDeleteLabel (issueItem) {
      this.labelData.forEach(classItem => {
        const findIssueLabel = classItem.child.find(issueLabel => issueLabel.id === issueItem.id)
        if (findIssueLabel) {
          findIssueLabel.isSelect = false
        }
      })
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
      
      this.imgObj = this.$refs['smallImg']

      this.imgBigObj = this.$refs['orgin-img']
      this.imgRect = this.imgObj.getBoundingClientRect()
      this.imgBigRect = this.imgBigObj.getBoundingClientRect()
      // 马克图宽度计算系数
      this.propConfigs.maskWidth = (this.imgRect.width / (this.scaleNum * 4 + 100)) * 100
      this.propConfigs.maskHeight = this.propConfigs.maskWidth * (this.imgRect.height / this.imgRect.width)
      // 背景图放大系数
      this.propConfigs.scale = (this.imgRect.width / this.propConfigs.maskWidth) * 100
      // 获取大图信息
      this.bigImg = new Image()
      this.bigImg.src = this.showPhoto.src
      this.bigImg.height = (this.bigImg.height * this.propConfigs.scale) / 100
      this.bigImg.width = (this.bigImg.width * this.propConfigs.scale) / 100
      // 创建鼠标选择区域
      this.mouseMask = this.$refs['magnifier_zoom']
      this.mouseMask.style.background = this.propConfigs.maskColor
      this.mouseMask.style.height = this.propConfigs.maskHeight + 'px'
      this.mouseMask.style.width = this.propConfigs.maskWidth + 'px'
      this.mouseMask.style.opacity = this.propConfigs.maskOpacity
      this.imgObj.parentNode.appendChild(this.mouseMask)
      // 创建预览框
      const imgLayer = this.$refs['magnifier_layer']

      const orginImg = this.$refs['orgin-img']
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
      const photoShowMain = this.$refs['photo-show-main']
      photoShowMain.appendChild(imgLayer)
    },
    /**
     * @description 注册键盘事件
     */
    registerKeyDownEvent () {
      document.onkeydown = e => {
        const key = window.event.keyCode
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
            this.changeDrawType({ type: TOOL_TYPE.DELETE })
            break
          case 66:
            this.changeDrawType({ type: TOOL_TYPE.PEN })
            break
          case 86:
            this.changeDrawType({ type: TOOL_TYPE.MOVE })
            break
          case 90:
            this.changeDrawType({ type: TOOL_TYPE.BLOWUP })
            break
          default:
            break
        }
      }
    }
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

      .label-top {
        margin-top: 10px;
        margin-left: 10px;

        .type-tag {
          display: inline-block;
          width: 80px;
          height: 40px;
          margin: 0 10px 10px 0;
          font-size: 18px;
          font-weight: 400;
          line-height: 40px;
          text-align: center;
          cursor: pointer;
          -webkit-user-select: none;
          border: 1px solid #fff;
          border-radius: 4px;

          &.plant {
            color: #44c27e;
            background-color: #fff;
            border-color: #44c27e;

            &.active {
              color: #fff;
              background-color: #44c27e;
            }
          }

          &.pull {
            color: #ff3974;
            background-color: #fff;
            border-color: #ff3974;

            &.active {
              color: #fff;
              background-color: #ff3974;
            }
          }

          &.none {
            color: #4669fb;
            background-color: #fff;
            border-color: #4669fb;

            &.active {
              color: #fff;
              background-color: #4669fb;
            }
          }
        }
      }

      .order-label {
        padding: 14px 10px 70px;
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
              background-color: rgba(0, 0, 0, 0.6);
              border: none;
              border-radius: 4px;

              &.active {
                background-color: #808080;
              }
            }
          }
        }
      }

      .submit-box {
        position: absolute;
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
.el-loading-mask {
  z-index: 6001;
}

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

.pen-weight {
  min-width: 30px;
  padding: 0;
  margin-left: 16px !important;
  background-color: #535353;
  border-color: #535353;

  .pen-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 78px;

    .pen-item {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 26px;
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
