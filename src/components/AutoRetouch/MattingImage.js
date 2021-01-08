
/**
 * @description 抠图
 */
export default class MattingImage {
  canvasHeight = 1000
  canvasWidth = 1000
  originalImage = ''
  newImage = ''

  constructor (originalImage, newImage) {
    this.originalImage = originalImage
    this.newImage = newImage
  }

  /**
   * @description 读取图片内容
   * @param {*} imagePath 
   */
  readImageData (imagePath) {
    return new Promise ((resolve, reject) => {
      const image = new Image()
      image.crossOrigin = "Anonymous"
      image.onload = () => {
        resolve(image)
      }

      image.onerror = () => {
        reject()
      }

      image.src = imagePath
    })
  }

  /**
   * @description 获取生成obj地址
   * @param {*} canvas canvas对象
   * @param {*} mimeType 类型 默认 image/png
   * @param {*} quality 质量 默认 0.92
   */
  getCanvasObjectURL (canvas, mimeType = 'image/png', quality = 1) {
    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob((blobData) => {
          const src = URL.createObjectURL(blobData)
          resolve(src)
        }, mimeType, quality)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * @description 创建预览canvas
   * @param {*} canvasHeight canvas大小
   * @param {*} canvasWidth canvas大小
   */
  createCanvas (canvasHeight, canvasWidth) {
    this.canvasHeight = canvasHeight
    this.canvasWidth = canvasWidth

    const previewCanvas = document.createElement('canvas')
    previewCanvas.width = this.canvasHeight
    previewCanvas.height = this.canvasWidth
    const previewCanvasContext = previewCanvas.getContext('2d')
    return {
      canvas: previewCanvas,
      context: previewCanvasContext
    }
  }

  /**
   * @description 绘制图像
   * @param {*} canvas 
   * @param {*} context 
   */
  async drawImage (canvas, context) {
    const originalImage = await this.readImageData(this.originalImage)
    context.drawImage(originalImage, 0, 0, this.canvasHeight, this.canvasWidth)
    context.globalCompositeOperation = 'source-in'
    const newImage = await this.readImageData(this.newImage)
    context.drawImage(newImage, 0, 0, this.canvasHeight, this.canvasWidth)

    // 导出扣图完成图片
    const mattingImage = await this.getCanvasObjectURL(canvas)
    return mattingImage
  }

  /**
   * @description 添加背景
   */
  async addBackground (canvas, context, mattingImage, backgroundImage) {
    context.globalCompositeOperation = 'source-over'
    if (backgroundImage) {
      const backgroundImageDom = await this.readImageData(backgroundImage)
      context.drawImage(backgroundImageDom, 0, 0, this.canvasHeight, this.canvasWidth)
    } else {
      context.fillStyle = 'RGB(255, 0, 0)'
      context.fillRect(0, 0, this.canvasHeight, this.canvasWidth)
    }

    const mattingImageDom = await this.readImageData(mattingImage)
    context.globalCompositeOperation = 'source-over'
    context.drawImage(mattingImageDom, 0, 0, this.canvasHeight, this.canvasWidth)
    const compoundImage = await this.getCanvasObjectURL(canvas)
    return compoundImage
  }
}
