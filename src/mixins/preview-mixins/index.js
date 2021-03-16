export default {
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
  },
  data () {
    return {
      propConfigs: this.configs, // 配置信息
      imgObj: {}, // 图片信息
      bigImg: {}, // 大图信息
      mouseMask: {}, // 马克图
      imgLayer: {}, // 图片预览信息
      imgRect: {}, // 图片宽度信息
      scaleNum: 25, // 放大信息
      loading: true,
      isShow: true, // 小图信息
      maxObj: {
        height: '',
        width: ''
      },
      inZoomIn: false,
      photoZoomStyle: '', // 图片信息
      showLabelDataTop: false,
      canvasOption: { // canvas 信息
        width: 200,
        height: 200,
        penColor: '#E34F51',
        lineWidth: 2,
        drawType: ''
      },
    }
  },
  methods: {
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
     * @description 判断是否处于放大中
     */
    judgeHasZoom (e) {
      const isOverIn = _.get(this.imgLayer, 'style.width')
      if (isOverIn) this.handOver(e)
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
        const _x = e.offsetX
        const _y = e.offsetY
        const clickX = (_x / imageWidth * 100).toFixed(2) + '%'
        const clickY = (_y / imageHeight * 100).toFixed(2) + '%'
        const zoomScale = (this.scaleNum * 4 + 100) / 100
        this.photoZoomStyle = `transform-origin: ${clickX} ${clickY}; transform: scale(${zoomScale});`
        this.inZoomIn = true
      }
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
      this.$emit('change', this.photoIndex)
      const nextPath = this.photoArray[this.photoIndex].path
      if (beforePath === nextPath) return
      this.loading = true
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
      this.$emit('change', this.photoIndex)
      const nextPath = this.photoArray[this.photoIndex].path
      if (beforePath === nextPath) return
      this.loading = true
    },
    /**
     * @description 滑块滑动改变值
     * @param {Number} [放大系数]
     */
    formatTooltip (val) {
      return val + 100
    },
  },
}
