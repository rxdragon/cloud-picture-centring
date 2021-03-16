<template>
  <div v-show="show" class="fabric-canvas">
    <canvas id="mark-canvas" ref="mark-canvas" />
  </div>
</template>

<script>
import * as CanvasTool from '@/utils/canvasTool'
import * as Commonality from '@/api/commonality'
import { TOOL_TYPE } from './ToolEnumerate.js'
import { fabric } from 'fabric'

export default {
  name: 'FabricCanvas',
  props: {
    optionObj: { type: Object, required: true },
    showCanvas: { type: Boolean }
  },
  data () {
    return {
      qNConfig: {}, // 七牛云token
      canvasDom: null,
      mouseFrom: {},
      mouseTo: {},
      moveCount: 1,
      doDrawing: false,
      drawingObject: null, // 去除重读的穿件图像
      activeLableList: [], // 选中标签
      cacheLabelRow: 0, // 行
      cacheLabelCell: 0, // 列
      isPrevEditing: false, // 是否处于编辑状态
      zoom: 1 // canvas 比例系数
    }
  },
  computed: {
    show () {
      return this.showCanvas
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
        this.changeDrawMode(drawType)
      },
      deep: true
    }
  },
  created () {
    this.getQNSign()
  },
  mounted () {
    this.$refs['mark-canvas'].width = this.optionObj.width
    this.$refs['mark-canvas'].height = this.optionObj.height
    this.canvasDom = new fabric.Canvas('mark-canvas', {
      isDrawingMode: false,
      selection: false,
      skipTargetFind: true
    })
    this.canvasDom.freeDrawingBrush.color = this.optionObj.penColor // 设置自由绘颜色
    this.canvasDom.freeDrawingBrush.width = this.optionObj.lineWidth
    this.canvasDom.on('mouse:down', this.onMouseDown)
    this.canvasDom.on('mouse:up', this.onMouseUp)
    this.canvasDom.on('mouse:move', this.onMouseMove)
    this.registerLableEvent()
  },
  destroyed () {
    this.cancelRegisterLableEvent()
  },
  methods: {
    /**
     * @description 注册监听标签事件
     */
    registerLableEvent () {
      this.$bus.$on('delete-canvas-lable', (lableId) => { this.deleteLabel(lableId) })
      this.$bus.$on('add-canvas-lable', (labelInfo) => { this.createLabel(labelInfo) })
    },
    /**
     * @description 注销监听标签向光事件
     */
    cancelRegisterLableEvent () {
      this.$bus.$off('delete-canvas-lable')
      this.$bus.$off('add-canvas-lable')
    },
    /**
     * @description 更改绘画模式
     */
    changeDrawMode (drawType) {
      this.canvasDom.selection = false
      this.canvasDom.skipTargetFind = true
      this.canvasDom.isDrawingMode = false
      switch (drawType) {
        case TOOL_TYPE.PEN:
          this.changePen()
          break
        case TOOL_TYPE.TEXT:
        case TOOL_TYPE.MOVE:
          this.changeMove()
          break
        case TOOL_TYPE.BLOWUP:
          this.changeBlowup()
          break
        case TOOL_TYPE.DELETE:
          this.deletePath()
          break
        default:
          break
      }
    },
    /**
     * @description 获取又拍云
     */
    async getQNSign () {
      this.qNConfig = await Commonality.getSignature()
    },
    /**
     * @description 判断是否是绘画
     */
    judgeIsDrawing () {
      const drawingTypes = [TOOL_TYPE.PEN, TOOL_TYPE.ELLIPSE, TOOL_TYPE.LINE]
      if (drawingTypes.includes(this.optionObj.drawType)) {
        this.doDrawing = true
      } else {
        this.doDrawing = false
      }
    },
    /**
     * @description 监听canvas鼠标按下
     */
    onMouseDown (options) {
      const xy = this.transformMouse(options.e.offsetX, options.e.offsetY)
      this.mouseFrom.x = xy.x
      this.mouseFrom.y = xy.y
      this.judgeIsDrawing()
      this.textAction(options)
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
        case TOOL_TYPE.ELLIPSE:
          canvasObject = this.createEllipse()
          break
        case TOOL_TYPE.LINE:
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
    },
    /**
     * @description 返回鼠标在canvas中的坐标系
     */
    transformMouse (mouseX, mouseY) {
      const zoom = this.zoom
      return { x: mouseX / zoom, y: mouseY / zoom }
    },
    /**
     * @description 使用拖动模式
     */
    changeMove () {
      this.canvasDom.selection = true
      this.canvasDom.skipTargetFind = false
    },
    /**
     * @description 使用笔模式
     */
    changePen () {
      this.canvasDom.selection = false
      this.canvasDom.isDrawingMode = true
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
        // 取消打分模块的值
        if (selectionItem.lableInfo) {
          this.$bus.$emit('delete-grade-lable', selectionItem.lableInfo)
          this.removeActiveLable(selectionItem.lableInfo.levelId)
        }
        this.canvasDom.remove(selectionItem)
      }
      // 清楚选中框
      this.canvasDom.discardActiveObject()
      // 如果是文字状态不更改模式
      if (this.optionObj.drawType === TOOL_TYPE.TEXT) return
      this.optionObj.drawType = TOOL_TYPE.MOVE
    },
    /**
     * @description 删除标签
     */
    deleteLabel (lableId) {
      this.canvasDom.forEachObject(pathItem => {
        if (pathItem.lableInfo && pathItem.lableInfo.levelId === lableId) {
          this.canvasDom.remove(pathItem)
        }
      })
      this.removeActiveLable(lableId)
    },
    /**
     * @description 移除激活标签内的标签
     */
    removeActiveLable (lableId) {
      const findCacheIssuesIndex = this.activeLableList.findIndex(item => item.levelId === lableId)
      if (findCacheIssuesIndex < 0) return
      this.activeLableList.splice(findCacheIssuesIndex, 1)
    },
    /**
     * @description 处理添加文本框操作
     */
    textAction (fEvent) {
      if (this.optionObj.drawType !== TOOL_TYPE.TEXT) return
      const obj = fEvent.target
      if (obj && !obj.isType('text')) {
        return
      }

      if (this.isPrevEditing) {
        this.isPrevEditing = false
        return
      }

      const left = this.mouseFrom.x
      const top = this.mouseFrom.y
      const textColor = this.optionObj.penColor
      const newText = new fabric.IText('修图批注', {
        left,
        top,
        fontSize: 22,
        fill: textColor,
        hasControls: true,
        editable: true,
        autofocus: true,
        textAlign: 'center',
      })

      this.canvasDom.add(newText)
      
      newText.enterEditing()
      newText.selectAll()
      this.canvasDom.setActiveObject(newText)
      this.isPrevEditing = true
    },
    /**
     * @description 创建椭圆
     */
    createEllipse () {
      const color = this.optionObj.penColor
      const drawWidth = this.optionObj.lineWidth
      const left = this.mouseFrom.x
      const top = this.mouseFrom.y
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
    createLabel (lableInfo) {
      const textColor = 'rgba(238, 238, 238, 0.6)'
      const canvasHeight = this.canvasDom.getHeight()
      let top = this.cacheLabelRow * 30
      // 判断是否超过边界
      if (top > canvasHeight - 60) {
        this.activeLableList.length = 0
        top = 0
        this.cacheLabelRow = 0
        this.cacheLabelCell++
      }
      this.cacheLabelRow++
      const width = lableInfo.name.length * 14 + 25
      const left = this.optionObj.width - (this.cacheLabelCell + 1) * width - 10
      const rect = new fabric.Rect({
        rx: 4,
        ry: 4,
        fill: 'rgba(0, 0, 0, 0.6)',
        width,
        height: 28,
        originX: 'center',
        originY: 'center'
      })

      const text = new fabric.Text(lableInfo.name, {
        fontSize: 12,
        originX: 'center',
        originY: 'center',
        fill: textColor
      })
      const group = new fabric.Group([rect, text], {
        left,
        top,
        lableInfo
      })
      this.canvasDom.add(group)
      this.activeLableList.push(lableInfo)
    },
    /**
     * @description 上传照片到七牛云
     */
    async outPhoto () {
      const base64Data = this.canvasDom.toDataURL()
      const blobData = CanvasTool.convertBase64ToBlob(base64Data)
      const fileData = CanvasTool.structureFile(blobData)
      const fileDataUploadUrl = await CanvasTool.uploadTagPhoto(fileData, this.qNConfig)
      return fileDataUploadUrl
    },
    /**
     * @description 判断canvas是否为空
     */
    hasDraw () {
      return !this.canvasDom.isEmpty()
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
