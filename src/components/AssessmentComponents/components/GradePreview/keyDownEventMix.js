import { TOOL_TYPE } from './ToolEnumerate.js'

export default {
  mounted () {
    this.registerKeyDownEvent()
  },
  methods: {
    /**
     * @description 注册键盘事件
     */
    registerKeyDownEvent () {
      document.onkeydown = e => {
        const domType = _.get(document, 'activeElement.type')
        if (domType === 'textarea' || domType === 'input') return
        if (this.$refs['fabric-canvas'] && this.$refs['fabric-canvas'].canvasDom) {
          const activeText = this.$refs['fabric-canvas'].canvasDom.getActiveObject()
          if (activeText && activeText.type === 'i-text' && activeText.isEditing) {
            return
          }
        }
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
          case 84:
            this.changeDrawType({ type: TOOL_TYPE.TEXT })
            break
          case 86:
            this.changeDrawType({ type: TOOL_TYPE.MOVE })
            break
          case 90:
            this.changeDrawType({ type: TOOL_TYPE.BLOWUP })
            break
          case 67:
            this.changeDrawType({ type: TOOL_TYPE.ARROW })
          default:
            break
        }
      }
    }
  },
  beforeDestroy () {
    document.onkeydown = null
  }
}
