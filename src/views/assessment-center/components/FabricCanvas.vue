<template>
  <div class="fabric-canvas">
    <canvas id="mark-canvas" ref="mark-canvas" />
  </div>
</template>

<script>
import { fabric } from 'fabric'
import * as CanvasTool from '@/utils/canvasTool'
import * as Commonality from '@/api/commonality'
export default {
  name: 'FabricCanvas',
  props: {
    optionObj: { type: Object, required: true }
  },
  data () {
    return {
      upyunConfig: {},
      canvasDom: null,
      mouseFrom: {},
      mouseTo: {},
      moveCount: 1,
      doDrawing: false,
      drawingObject: null, // 去除重读的穿件图像
      cacheIssuse: [], // 缓存问题
      cacheLabelRow: 0,
      zoom: 1 // canvas 比例系数
    }
  },
  watch: {
    'optionObj.penColor': {
      handler (colorValue) {
        if (this.canvasDom) {
          this.canvasDom.freeDrawingBrush.color = colorValue
        }
      },
      deep: true
    },
    'optionObj.lineWidth': {
      handler (lineWidthValue) {
        if (this.canvasDom) {
          this.canvasDom.freeDrawingBrush.width = lineWidthValue
        }
      },
      deep: true
    },
    'optionObj.drawType': {
      handler (drawType) {
        console.log(drawType)
        this.canvasDom.selection = false
        this.canvasDom.skipTargetFind = true
        this.canvasDom.isDrawingMode = false
        switch (drawType) {
          case 'pen':
            this.changePen()
            break
          case 'move':
            this.changeMove()
            break
          case 'blowup':
            this.changeBlowup()
            break
          case 'delete':
            this.deletePath()
            break
          default:
            break
        }
      },
      deep: true
    }
  },
  created () {
    this.getUpyunSign()
  },
  mounted () {
    this.$refs['mark-canvas'].width = this.optionObj.width
    this.$refs['mark-canvas'].height = this.optionObj.height
    console.log(fabric)
    this.canvasDom = new fabric.Canvas('mark-canvas', {
      isDrawingMode: true,
      selection: true,
      skipTargetFind: false
    })
    this.canvasDom.freeDrawingBrush.color = this.optionObj.penColor // 设置自由绘颜色
    this.canvasDom.freeDrawingBrush.width = this.optionObj.lineWidth
    this.canvasDom.on('mouse:down', this.onMouseDown)
    this.canvasDom.on('mouse:up', this.onMouseUp)
    this.canvasDom.on('mouse:move', this.onMouseMove)
  },
  methods: {
    /**
     * @description 获取又拍云
     */
    async getUpyunSign () {
      this.upyunConfig = await Commonality.getSignature()
      console.log(this.upyunConfig)
    },
    /**
     * @description 监听canvas鼠标按下
     */
    onMouseDown (options) {
      console.log(options)
      console.log(this.optionObj.drawType)
      const xy = this.transformMouse(options.e.offsetX, options.e.offsetY)
      this.mouseFrom.x = xy.x
      this.mouseFrom.y = xy.y
      this.doDrawing = true
    },
    /**
     * @description 监听canvas鼠标抬起
     */
    onMouseUp (options) {
      const xy = this.transformMouse(options.e.offsetX, options.e.offsetY)
      this.mouseTo.x = xy.x
      this.mouseTo.y = xy.y
      this.drawingObject = null
      this.moveCount = 1
      this.doDrawing = false
    },
    /**
     * @description 监听鼠标移动
     */
    onMouseMove (options) {
      if (this.moveCount % 2 && !this.doDrawing) return
      this.moveCount++
      const xy = this.transformMouse(options.e.offsetX, options.e.offsetY)
      this.mouseTo.x = xy.x
      this.mouseTo.y = xy.y
      this.drawing()
    },
    /**
     * @description 绘制图片
     */
    drawing () {
      if (this.drawingObject) {
        this.canvasDom.remove(this.drawingObject)
      }
      let canvasObject = null
      switch (this.optionObj.drawType) {
        case 'arrow':
          canvasObject = this.createArrow()
          break
        case 'ellipse':
          canvasObject = this.createEllipse()
          break
        case 'line':
          canvasObject = this.createLine()
          break
        default:
          break
      }
      if (canvasObject) {
        this.canvasDom.add(canvasObject)
        this.drawingObject = canvasObject
      }
    },
    /**
     * @description 重设canvas 宽高度
     */
    resetCanvas () {
      const imgWidth = this.optionObj.width
      const imgHeight = this.optionObj.height
      const canvasWidth = this.canvasDom.width
      const originWidth = canvasWidth / this.zoom
      this.zoom = imgWidth / originWidth
      this.canvasDom.setZoom(this.zoom)
      this.canvasDom.setWidth(imgWidth)
      this.canvasDom.setHeight(imgHeight)
      console.log(this.zoom)
    },
    /**
     * @description 返回鼠标在canvas中的坐标系
     */
    transformMouse (mouseX, mouseY) {
      const zoom = this.zoom
      return { x: mouseX / zoom, y: mouseY / zoom }
    },
    /**
     * @description 使用拖动
     */
    changeMove () {
      this.canvasDom.selection = true
      this.canvasDom.skipTargetFind = false
    },
    /**
     * @description 使用笔
     */
    changePen () {
      this.canvasDom.isDrawingMode = true
      this.canvasDom.selection = false
      this.canvasDom.skipTargetFind = true
    },
    /**
     * @description 放大
     */
    changeBlowup () {
      this.canvasDom.selection = false
      this.canvasDom.isDrawingMode = false
      this.canvasDom.skipTargetFind = true
    },
    /**
     * @description 删除
     */
    deletePath () {
      const selectionObj = this.canvasDom.getActiveObjects()
      for (const selectionItem of selectionObj) {
        if (selectionItem.issueData) {
          this.$emit('cancelDeleteLabel', selectionItem.issueData)
        }
        this.canvasDom.remove(selectionItem)
      }
      // 清楚选中框
      this.canvasDom.discardActiveObject()
      this.optionObj.drawType = 'move'
    },
    deleteLabel (labelInfo) {
      console.log(labelInfo)
      this.canvasDom.forEachObject(pathItem => {
        if (pathItem.issueData.id === labelInfo.id) {
          this.$emit('cancelDeleteLabel', pathItem.issueData)
          this.canvasDom.remove(pathItem)
        }
      })
    },
    /**
     * @description 绘制箭头
     */
    drawArrow (fromX, fromY, toX, toY, theta, headlen) {
      theta = typeof theta !== 'undefined' ? theta : 30
      headlen = typeof theta !== 'undefined' ? headlen : 10
      // 计算各角度和对应的P2,P3坐标
      const angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI
      const angle1 = (angle + theta) * Math.PI / 180
      const angle2 = (angle - theta) * Math.PI / 180
      const topX = headlen * Math.cos(angle1)
      const topY = headlen * Math.sin(angle1)
      const botX = headlen * Math.cos(angle2)
      const botY = headlen * Math.sin(angle2)
      var arrowX = fromX - topX
      var arrowY = fromY - topY
      var path = ' M ' + fromX + ' ' + fromY
      path += ' L ' + toX + ' ' + toY
      arrowX = toX + topX
      arrowY = toY + topY
      path += ' M ' + arrowX + ' ' + arrowY
      path += ' L ' + toX + ' ' + toY
      arrowX = toX + botX
      arrowY = toY + botY
      path += ' L ' + arrowX + ' ' + arrowY
      return path
    },
    /**
     * @description 创建箭头
     */
    createArrow () {
      const color = this.optionObj.penColor
      const drawWidth = this.optionObj.lineWidth
      const arrowpath = this.drawArrow(this.mouseFrom.x, this.mouseFrom.y, this.mouseTo.x, this.mouseTo.y, 30, 30)
      const canvasObject = new fabric.Path(
        arrowpath,
        {
          stroke: color,
          fill: 'rgba(255, 255, 255, 0)',
          strokeWidth: drawWidth
        }
      )
      this.canvasDom.add(canvasObject)
      this.drawingObject = canvasObject
    },
    /**
     * @description 创建椭圆
     */
    createEllipse () {
      const color = this.optionObj.penColor
      const drawWidth = this.optionObj.lineWidth
      const left = this.mouseFrom.x
      const top = this.mouseFrom.y
      // const radius = Math.sqrt((this.mouseTo.x - left) * (this.mouseTo.x - left) + (this.mouseTo.y - top) * (this.mouseTo.y - top)) / 2
      const canvasObject = new fabric.Ellipse({
        left: left,
        top: top,
        stroke: color,
        fill: 'rgba(255, 255, 255, 0)',
        originX: 'center',
        originY: 'center',
        rx: Math.abs(left - this.mouseTo.x),
        ry: Math.abs(top - this.mouseTo.y),
        strokeWidth: drawWidth
      })
      return canvasObject
    },
    /**
     * @description 创建直线
     */
    createLine () {
      const color = this.optionObj.penColor
      const drawWidth = this.optionObj.lineWidth
      const canvasObject = new fabric.Line(
        [this.mouseFrom.x, this.mouseFrom.y, this.mouseTo.x, this.mouseTo.y],
        {
          stroke: color,
          strokeWidth: drawWidth
        }
      )
      return canvasObject
    },
    /**
     * @description 创建标签
     */
    createLabel (issueData) {
      const textColor = '#4f71fb'
      const canvasHeight = this.canvasDom.getHeight()
      let top = this.cacheIssuse.length * 20
      // 判断是否超过边界
      if (top > canvasHeight - 20) {
        this.cacheIssuse.length = 0
        top = 0
        this.cacheLabelRow++
      }
      const left = this.cacheLabelRow * 60
      const textbox = new fabric.Textbox(issueData.label, {
        left,
        top,
        width: 50,
        fontSize: 14,
        borderColor: '#dae1fe',
        backgroundColor: '#edf0ff',
        fill: textColor,
        hasControls: true,
        editable: false,
        textAlign: 'center',
        issueData
      })
      this.canvasDom.add(textbox)
      this.cacheIssuse.push(issueData)
    },
    async outPhoto () {
      // TODO 检测canvas是否空
      const base64Data = this.canvasDom.toDataURL()
      const blobData = CanvasTool.convertBase64ToBlob(base64Data)
      const fileData = CanvasTool.structureFile(blobData)
      const data = await CanvasTool.uploadTagPhoto(fileData, this.upyunConfig)
      console.log(data)
    }
  }
}
</script>

<style lang="less" scoped>
.fabric-canvas {
  position: absolute;
  z-index: 4000;
}
</style>
