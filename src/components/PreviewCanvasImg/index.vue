<template>
  <img class="preview-canvas-img" :src="src">
</template>

<script>
export default {
  name: 'PreviewCanvasImg',
  props: {
    file: { type: Object, required: true }
  },
  data () {
    return {
      fileData: null,
      quality: 0.8,
      width: 300,
      src: ''
    }
  },
  created () {
    this.fileData = this.file.raw
    this.pressImg()
  },
  methods: {
    /**
     * @param {二进制文件流} file
     */
    changeFileToBaseURL (file) {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader()
        fileReader.onload = (e) => {
          const imgBase64Data = fileReader.result
          resolve(imgBase64Data)
        }
        fileReader.readAsDataURL(file)
      })
    },
    /**
     * @description 压缩图片
     */
    async pressImg () {
      // 得到文件类型
      const fileType = this.fileData.type
      const base64 = await this.changeFileToBaseURL(this.fileData)
      const image = new Image()
      image.src = base64
      image.onload = () => {
        const scale = image.width / image.height
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = this.width
        canvas.height = parseInt(this.width / scale)
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        const newImageData = canvas.toDataURL(fileType, this.quality)
        this.src = newImageData
      }
    }
  }

}
</script>

<style lang="less" scoped>
.preview-canvas-img {
  width: 100%;
  height: 100%;
  object-position: top;
  object-fit: cover;
  position: absolute;
}
</style>
