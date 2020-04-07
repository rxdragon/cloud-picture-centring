<template>
  <button ref="particle" @click="anmClick" class="particle-button">
    <slot></slot>
  </button>
</template>

<script>
import html2canvas from 'html2canvas'
import ExplodingParticle from './ExplodingParticle.js'

export default {
  name: 'ParticleButton',
  data () {
    return {
      particleCanvas: null,
      particleCtx: null,
      particles: [],
      colorData: [],
      width: 0,
      height: 0,
      btnLeft: 0,
      btnTop: 0,
      particleAnimationId: null
    }
  },
  created () {
    this.createParticleCanvas()
  },
  mounted () {
    this.getButtonInfo()
    this.particleAnimationId = window.requestAnimationFrame(this.update)
  },
  beforeDestroy () {
    window.cancelAnimationFrame(this.particleAnimationId)
  },
  methods: {
    /**
     * @description 创建canvas
     */
    createParticleCanvas () {
      // Create our canvas
      if (document.querySelector('#buttonCanvas')) {
        this.particleCanvas = document.querySelector('#buttonCanvas')
        this.particleCtx = this.particleCanvas.getContext("2d")
        return
      }
      this.particleCanvas = document.createElement("canvas")
      this.particleCanvas.id = 'buttonCanvas'
      this.particleCtx = this.particleCanvas.getContext("2d")
      
      // Size our canvas
      this.particleCanvas.width = window.innerWidth
      this.particleCanvas.height = window.innerHeight
      
      // Position out canvas
      this.particleCanvas.style.position = "absolute"
      this.particleCanvas.style.top = "0"
      this.particleCanvas.style.left = "0"
      
      // Make sure it's on top of other elements
      this.particleCanvas.style.zIndex = "1001"
      
      // Make sure other elements under it are clickable
      this.particleCanvas.style.pointerEvents = "none"
      
      // Add our canvas to the page
      document.body.appendChild(this.particleCanvas)
    },
    /**
     * @description 获取按钮信息
     */
    getButtonInfo () {
      const btn = this.$refs['particle']
      this.width = btn.offsetWidth
      this.height = btn.offsetHeight
      const bcr = btn.getBoundingClientRect()
      this.btnLeft = bcr.left
      this.btnTop = bcr.top
      html2canvas(btn).then(canvas => {
        const ctx = canvas.getContext("2d")
        this.colorData = ctx.getImageData(0, 0, this.width, this.height).data
      })
    },
    /**
     * @description 绘制粒子
     */
    createParticleAtPoint (x, y, colorData) {
      const particle = new ExplodingParticle()
      particle.rgbArray = colorData
      particle.startX = x
      particle.startY = y
      particle.startTime = Date.now()
      this.particles.push(particle)
    },
    /**
     * @description 动画处罚事件
     */
    anmClick () {
      let count = 0
      let reductionFactor = 17
      for (let localX = 0; localX < this.width; localX++) {
        for (let localY = 0; localY < this.height; localY++) {
          if (count % reductionFactor === 0) {
            const index = (localY * this.width + localX) * 4
            // 获取当前像素色彩
            const rgbaColorArr = this.colorData.slice(index, index + 4)
            const globalX = this.btnLeft + localX
            const globalY = this.btnTop + localY
            // 绘制粒子
            this.createParticleAtPoint(globalX, globalY, rgbaColorArr)
          }
          count++
        }
      }
      this.$emit('click')
    },
    /**
     * @description 动画坚挺
     */
    update () {
      // Clear out the old particles
      if (!this.particleCtx) return
      // Draw all of our particles in their new location
      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].draw(this.particleCtx)
        
        // Simple way to clean up if the last particle is done animating
        if (i === this.particles.length - 1) {
          let percent = (Date.now() - this.particles[i].startTime) / this.particles[i].animationDuration
          if (percent > 1) {
            this.particles = []
          }
        }
      }
      // Animate performantly
      this.particleAnimationId = window.requestAnimationFrame(this.update)
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";

.particle-button {
  box-sizing: border-box;
  display: inline-block;
  padding: 12px 20px;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  color: white;
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  background: @gradualBlue;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  outline: 0;
  -webkit-transition: 0.1s;
  transition: 0.1s;
  -webkit-appearance: none;
}
</style>
