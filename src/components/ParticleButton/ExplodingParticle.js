export default class ExplodingParticle {
  animationDuration = 1000 // 动画时间 ms
  constructor () {
    this.speed = {
      x: -5 + Math.random() * 10,
      y: -5 + Math.random() * 10
    }
    // 粒子半径
    this.radius = 5 + Math.random() * 5
    // Set a max time to live for our particle
    this.life = 30 + Math.random() * 10
    //  粒子寿命
    this.remainingLife = this.life
  }
  
  draw = ctx => {
    const p = this
    if (this.remainingLife > 0 && this.radius > 0) {
      // Draw a circle at the current location
      ctx.beginPath()
      ctx.arc(p.startX, p.startY, p.radius, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(" + this.rgbArray[0] + ',' + this.rgbArray[1] + ',' + this.rgbArray[2] + ", 1)"
      ctx.fill()
      
      p.remainingLife--
      p.radius -= 0.25
      p.startX += p.speed.x
      p.startY += p.speed.y
    }
  }
}
