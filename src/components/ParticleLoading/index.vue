<template>
  <div ref="particleLoading" class="particle-loading">
    <canvas
      ref="particle"
      id="particle"
      :width="width"
      :height="height"
    >
    </canvas>
  </div>
</template>

<script>
import Particle from './particle.js'
import Strategy from './strategy.js'

export default {
  name: 'ParticleLoading',
  data () {
    return {
      PARTICLE_COUNT: 1500,
      PARTICLE_RADIUS: 1,
      MAX_ROTATION_ANGLE: Math.PI / 60,
      rotationX: 0,
      rotationY: 0,
      TRANSLATION_COUNT: 500,
      container: null,
      canvas: null,
      context: null,
      width: 0,
      height: 0,
      center: {
        x: 0,
        y: 0
      },
      strategyIndex: 0,
      translationCount: 0,
      theta: 0,
      strategies: null,
      particles: []
    }
  },
  mounted () {
    const strategy = new Strategy()
    this.init(strategy)
  },
  methods: {
    /**
     * @description 初始化
     */
    init (strategy) {
      this.setParameters(strategy)
      this.createParticles()
      this.setupFigure()
      this.reconstructMethod()
      this.drawFigure()
    },
    /**
     * @description 设置参数
     */
    setParameters (strategy) {
      this.container = this.$refs['particleLoading']
      this.canvas = this.$refs['particle']

      this.width = this.container.clientWidth
      this.height = this.container.clientHeight

      this.canvas.width = this.width
      this.canvas.height = this.height
      this.context = this.canvas.getContext('2d')
      this.center = { x: this.width / 2, y: this.height / 2 }

      this.rotationX = this.MAX_ROTATION_ANGLE
      this.rotationY = this.MAX_ROTATION_ANGLE
      this.strategyIndex = 0
      this.translationCount = 0
      this.theta = 0
      
      this.strategies = strategy.getStrategies()
      this.particles = []
    },
    createParticles () {
      for (let i = 0; i < this.PARTICLE_COUNT; i ++){
        this.particles.push(new Particle(this.center))
      }
    },
    reconstructMethod () {
      this.setupFigure = this.setupFigure.bind(this)
      this.drawFigure = this.drawFigure.bind(this)
      this.changeAngle = this.changeAngle.bind(this)
    },
    
    setupFigure () {
      for (let i = 0, length = this.particles.length; i < length; i++){
        this.particles[i].setAxis(this.strategies[this.strategyIndex]())
      }
      if (++this.strategyIndex === this.strategies.length){
        this.strategyIndex = 0
      }
      this.translationCount = 0
    },
    drawFigure () {
      requestAnimationFrame(this.drawFigure)
      this.context.fillStyle = 'rgba(255, 255, 255, 0.2)'
      const fillWidth = this.width
      const fillHeight = this.height
      this.context.fillRect(0, 0, fillWidth, fillHeight)
      
      for (let i = 0, length = this.particles.length; i < length; i++){
        let axis = this.particles[i].getAxis2D(this.theta)
        
        this.context.beginPath()
        this.context.fillStyle = axis.color
        this.context.arc(axis.x, axis.y, this.PARTICLE_RADIUS, 0, Math.PI * 2, false)
        this.context.fill()
      }
      this.theta++
      this.theta %= 360
      
      for (let i = 0, length = this.particles.length; i < length; i++){
        this.particles[i].rotateX(this.rotationX)
        this.particles[i].rotateY(this.rotationY)
      }
      this.translationCount++
      this.translationCount %= this.TRANSLATION_COUNT
      
      if (this.translationCount === 0){
        this.setupFigure()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.particle-loading {
  width: 80%;
  height: 80%;
}
</style>
