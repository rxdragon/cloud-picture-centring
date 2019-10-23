<template>
  <div id="photoShow">
    <div class="title">
      {{ showPhoto.version | toPhotoEnumName }}
      <button id="closeImg" type="button" class="button-close" @click="closeShowPhoto">
        <i class="el-icon-close" />
      </button>
    </div>
    <div class="photoBox">
      <div v-loading="loading" class="orginPhoto" :style="inZoomIn && 'cursor: zoom-out;'">
        <img
          id="orginImg"
          :style="photoZoomStyle"
          :src="showPhoto.src"
          :alt="showPhoto.title"
          @load="loadingPhoto"
          @click="zoom"
        >
      </div>
      <button
        v-if="photoArray.length !== 1"
        type="button"
        class="button-left"
        @click.stop="prePhoto"
      >
        <i class="el-icon-arrow-left" />
      </button>
      <button
        v-if="photoArray.length !== 1"
        type="button"
        class="button-right"
        @click.stop="nextPhoto"
      >
        <i class="el-icon-arrow-right" />
      </button>
      <div v-show="isShow" id="smallImg" v-loading="loading" class="right">
        <div class="smallPhoto">
          <div id="img-box" style="position: relative;">
            <img
              :src="showPhoto.src"
              alt="缩略图"
              @mouseout="handOut"
              @mousemove="handMove"
              @mouseover="handOver"
            >
          </div>
        </div>
        <div class="contant">
          <el-slider v-model="scaleNum" />
          {{ scaleNum * 4 + 100 }}%
          <div class="driver-star" @click.stop="guide">?</div>
        </div>
        <div class="down-button" @click.stop="downing">下载</div>
      </div>
    </div>
  </div>
</template>

<script>
import Driver from 'driver.js' // 引导框
import 'driver.js/dist/driver.min.css'
export default {
  name: 'PreviewPhoto',
  filters: {
    toPhotoEnumName (value) {
      const nameList = {
        original_photo: '原片',
        first_photo: '一次成片',
        return_photo: '退回照片',
        complete_photo: '审核成片',
        finish_photo: '最终成片'
      }
      return nameList[value]
    }
  },
  props: {
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
    imgarray: {
      type: Array,
      default () {
        return [
          {
            src: '',
            title: '没有接收到图片'
          }
        ]
      }
    },
    orderindex: {
      type: Number,
      default () {
        return 0
      }
    }
  },
  data () {
    return {
      propConfigs: this.configs,
      imgObj: {},
      bigImg: {},
      mouseMask: {},
      imgLayer: {},
      imgRect: {},
      scaleNum: 25,
      photoIndex: this.orderindex,
      loading: true,
      isShow: true,
      maxObj: {
        height: '',
        width: ''
      },
      driver: null,
      inZoomIn: false,
      photoZoomStyle: ''
    }
  },
  computed: {
    photoArray () {
      return this.imgarray
    },
    showPhoto () {
      console.log(this.photoArray[this.photoIndex])
      return this.photoArray[this.photoIndex]
    }
  },
  watch: {
    /**
     * @description 展示图片数组
     * @param {*} val
     */
    imgarray: function (val) {
      this.photoArray = [...val]
    }
  },
  mounted () {
    /**
     * @description 监听键盘事件
     */
    document.onkeydown = e => {
      const key = window.event.keyCode
      switch (key) {
        case 187:
        case 69:
          if (this.scaleNum < 100) {
            this.scaleNum++
          }
          this.judgeHasZoom()
          break
        case 189:
        case 81:
          if (this.scaleNum > 0) {
            this.scaleNum--
          }
          this.judgeHasZoom(e)
          break
        case 18:
          this.closeShowPhoto()
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
        default:
          break
      }
    }
  },
  created () {
    this.driver = new Driver({
      nextBtnText: '下一个',
      prevBtnText: '上一个',
      doneBtnText: '完成',
      closeBtnText: '关闭'
    })
    this.photoIndex = this.orderindex
  },
  methods: {
    /**
     * @description 提示按钮
     */
    guide () {
      const steps = [
        {
          element: '#closeImg',
          popover: {
            title: '关闭预览框',
            description: '按右下角的ctrl或者option键可以快速关闭弹框',
            position: 'left'
          }
        },
        {
          element: '#smallImg',
          popover: {
            title: '缩略图的隐藏',
            description: '按右下角的shift键可以快速隐藏或开启缩略图',
            position: 'left'
          }
        },
        {
          element: '.contant',
          popover: {
            title: '放大镜放大效果，默认200%',
            description: '可以通过键盘 +(E)，-(Q) 控制放大倍数',
            position: 'left'
          }
        },
        {
          element: '#orginImg',
          popover: {
            title: '切换图片',
            description: '可以通过键盘左<-(A),右->(D)键切换图片',
            position: 'mid-center'
          }
        }
      ]
      this.driver.defineSteps(steps)
      this.driver.start()
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
      this.imgLayer.remove()
      this.mouseMask.remove()
    },
    /**
     * @description 鼠标移进
     */
    handOver (e) {
      if (!document.getElementById('_magnifier_layer')) {
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
        this.mouseMask = document.createElement('div')
        this.mouseMask.className = '_magnifier_zoom'
        this.mouseMask.style.background = this.propConfigs.maskColor
        this.mouseMask.style.height = this.propConfigs.maskHeight + 'px'
        this.mouseMask.style.width = this.propConfigs.maskWidth + 'px'
        this.mouseMask.style.opacity = this.propConfigs.maskOpacity
        this.imgObj.parentNode.appendChild(this.mouseMask)
        // 创建预览框
        const imgLayer = document.createElement('div')
        const orginImg = document.getElementById('orginImg')
        this.propConfigs.width = orginImg.width
        this.propConfigs.height = orginImg.height
        this.imgLayer = imgLayer
        const _layerHeight = this.propConfigs.height
        const _layerWidth = this.propConfigs.width
        imgLayer.id = '_magnifier_layer'
        imgLayer.style.width = _layerWidth + 'px'
        imgLayer.style.height = _layerHeight + 'px'
        imgLayer.style.backgroundImage = `url('${this.showPhoto.src}')`
        imgLayer.style.backgroundRepeat = 'no-repeat'
        imgLayer.style.backgroundSize = `${this.propConfigs.scale}%`
        document.getElementsByClassName('orginPhoto')[0].appendChild(imgLayer)
      } else {
        this.propConfigs.maskWidth =
          (this.imgRect.width / (this.scaleNum * 4 + 100)) * 100
        this.propConfigs.maskHeight =
          this.propConfigs.maskWidth *
          (this.imgRect.height / this.imgRect.width)
        this.propConfigs.scale =
          (this.imgRect.width / this.propConfigs.maskWidth) * 100
        this.mouseMask.style.height = this.propConfigs.maskHeight + 'px'
        this.mouseMask.style.width = this.propConfigs.maskWidth + 'px'
        this.imgLayer.style.backgroundImage = `url('${this.showPhoto.src}')`
        this.imgLayer.style.backgroundRepeat = 'no-repeat'
        this.imgLayer.style.backgroundSize = `${this.propConfigs.scale}%`
      }
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
      if (this.photoIndex === 0) {
        this.photoIndex = this.photoArray.length - 1
      } else {
        this.photoIndex--
      }
      this.loading = true
    },
    /**
     * @description 下一张图片
     */
    nextPhoto () {
      if (this.photoIndex === this.photoArray.length - 1) {
        this.photoIndex = 0
      } else {
        this.photoIndex++
      }
      this.loading = true
    },
    /**
     * @description 关闭图片
     */
    closeShowPhoto () {
      this.$emit('update:showPreview', false)
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
      // 针对又拍云下载 转为流格式
      window.location = url + '?_upd=true'
    },
    /**
     * @description 放大
     */
    zoom (e) {
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
      const hasZoom = document.getElementById('_magnifier_layer')
      hasZoom && this.handOver(e)
    }
  }
}
</script>

<style lang="less">
  @import url('./index.less');
</style>
