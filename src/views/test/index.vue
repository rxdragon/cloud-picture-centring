<template>
  <div>
    <input type="file" accept="image/*" @change="getImg">
    <div class="img-box">
      <img id="inputImg" ref="inputImg" :src="inputImgSrc" alt="">
      <canvas id="overlay" ref="overlay" />
    </div>
  </div>
</template>

<script>
import * as faceapiSDK from 'face-api.js'
import * as FaceDetectionControls from './faceDetectionControls'
import * as UtilsWithFaceWidth from './utils_with_face_width'
import * as Drawing from './drawing'
export default {
  name: 'Test',
  data () {
    return {
      inputImgSrc: ''
    }
  },
  created () {
    window.faceapi = faceapiSDK
  },
  mounted () {
    this.run()
  },
  methods: {
    getImg (event) {
      const input = event.target
      const reader = new FileReader()
      reader.onload = (e) => {
        this.inputImgSrc = e.target.result
        this.updateResults()
      }
      reader.readAsDataURL(input.files[0])
    },
    /**
     * @description 更新数据
     */
    async updateResults () {
      const inputImg = this.$refs['inputImg']
      const canvas = this.$refs['overlay']
      if (!this.inputImgSrc) return
      if (!FaceDetectionControls.isFaceDetectionModelLoaded()) return
      const results = await window.faceapi.detectAllFaces(inputImg).withFaceLandmarks()
      window.faceapi.matchDimensions(canvas, inputImg)
      const resizedResults = window.faceapi.resizeResults(results, inputImg)
      const info = UtilsWithFaceWidth.getHatInfo(resizedResults)
      window.faceapi.draw.drawFaceLandmarks(canvas, resizedResults) // 直接画出识别的的特征点
      window.faceapi.draw.drawDetections(canvas, resizedResults)
      Drawing.drawing(canvas, {
        info,
        imgSrc: inputImg.src,
        width: canvas.width,
        height: canvas.height
      })
    },
    async run () {
      // 初始化face-api 这里使用ssd moblile
      await FaceDetectionControls.getCurrentFaceDetectionNet().load('/weights')
      // 加载Landmark模型
      await window.faceapi.nets.faceLandmark68Net.load('/weights')
      // 更新数据
      this.updateResults()
    }
  }
}
</script>

<style lang="less" scoped>
.img-box {
  width: 800px;
  height: 800px;
  margin-top: 20px;
  position: relative;

  canvas,
  img {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>
