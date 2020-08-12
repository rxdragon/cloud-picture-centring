export default class Particle {
  SPRING = 0.01
	FRICTION = 0.9
	FOCUS_POSITION = 300
  COLOR = 'hsl(%hue 100% 70%)'

  constructor (center) {
    this.center = center
    this.init()
  }

  init () {
    this.x = 0
    this.y = 0
    this.z = 0
    this.vx = 0
    this.vy = 0
    this.vz = 0
    this.color
  }
  setAxis (axis){
    this.translating = true
    this.nextX = axis.x
    this.nextY = axis.y
    this.nextZ = axis.z
    this.hue = axis.hue
  }

  rotateX (angle){
    const sin = Math.sin(angle),
      cos = Math.cos(angle),
      nextY = this.nextY * cos - this.nextZ * sin,
      nextZ = this.nextZ * cos + this.nextY * sin,
      y = this.y * cos - this.z * sin,
      z = this.z * cos + this.y * sin
			
    this.nextY = nextY
    this.nextZ = nextZ
    this.y = y
    this.z = z
  }

  rotateY (angle){
    const sin = Math.sin(angle),
      cos = Math.cos(angle),
      nextX = this.nextX * cos - this.nextZ * sin,
      nextZ = this.nextZ * cos + this.nextX * sin,
      x = this.x * cos - this.z * sin,
      z = this.z * cos + this.x * sin
			
    this.nextX = nextX
    this.nextZ = nextZ
    this.x = x
    this.z = z
  }

  rotateZ (angle){
    const sin = Math.sin(angle),
      cos = Math.cos(angle),
      nextX = this.nextX * cos - this.nextY * sin,
      nextY = this.nextY * cos + this.nextX * sin,
      x = this.x * cos - this.y * sin,
      y = this.y * cos + this.x * sin
			
    this.nextX = nextX
    this.nextY = nextY
    this.x = x
    this.y = y
  }

  getAxis3D (){
    this.vx += (this.nextX - this.x) * this.SPRING
    this.vy += (this.nextY - this.y) * this.SPRING
    this.vz += (this.nextZ - this.z) * this.SPRING
		
    this.vx *= this.FRICTION
    this.vy *= this.FRICTION
    this.vz *= this.FRICTION
		
    this.x += this.vx
    this.y += this.vy
    this.z += this.vz
		
    return {x: this.x, y: this.y, z: this.z}
  }
  
  getAxis2D (theta){
    const axis = this.getAxis3D(),
      scale = this.FOCUS_POSITION / (this.FOCUS_POSITION + axis.z)
			
    return {x: this.center.x + axis.x * scale, y: this.center.y - axis.y * scale, color: this.COLOR.replace('%hue', this.hue + theta)}
  }
}
