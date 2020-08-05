export default class Strategy {
  SCATTER_RADIUS = 100
	CONE_ASPECT_RATIO = 1.5
  RING_COUNT = 5
  
  getStrategies () {
    const strategies = []
    strategies.push(this.createSphere.bind(this))
    strategies.push(this.createTorus.bind(this))
    return strategies
  }

  createSphere () {
    const cosTheta = Math.random() * 2 - 1,
      sinTheta = Math.sqrt(1 - cosTheta * cosTheta),
      phi = Math.random() * 2 * Math.PI
			
    return {
      x: this.SCATTER_RADIUS * sinTheta * Math.cos(phi),
      y: this.SCATTER_RADIUS * sinTheta * Math.sin(phi),
      z: this.SCATTER_RADIUS * cosTheta,
      hue: Math.round(phi / Math.PI * 30)
    }
  }

  createTorus () {
    const theta = Math.random() * Math.PI * 2,
      x = this.SCATTER_RADIUS + this.SCATTER_RADIUS / 6 * Math.cos(theta),
      y = this.SCATTER_RADIUS / 6 * Math.sin(theta),
      phi = Math.random() * Math.PI * 2
		
    return {
      x: x * Math.cos(phi),
      y: y,
      z: x * Math.sin(phi),
      hue: Math.round(phi / Math.PI * 30)
    }
  }

  createCone () {
    const status = Math.random() > 1 / 3
    const phi = Math.random() * Math.PI * 2
    const rate = Math.tan(30 / 180 * Math.PI) / this.CONE_ASPECT_RATIO
    let x
    let y
		
    if (status){
      y = this.SCATTER_RADIUS * (1 - Math.random() * 2)
      x = (this.SCATTER_RADIUS - y) * rate
    } else {
      y = -this.SCATTER_RADIUS
      x = this.SCATTER_RADIUS * 2 * rate * Math.random()
    }
    return {
      x: x * Math.cos(phi),
      y: y,
      z: x * Math.sin(phi),
      hue: Math.round(phi / Math.PI * 30)
    }
  }

  createVase () {
    const theta = Math.random() * Math.PI,
      x = Math.abs(this.SCATTER_RADIUS * Math.cos(theta) / 2) + this.SCATTER_RADIUS / 8,
      y = this.SCATTER_RADIUS * Math.cos(theta) * 1.2,
      phi = Math.random() * Math.PI * 2
		
    return {
      x: x * Math.cos(phi),
      y: y,
      z: x * Math.sin(phi),
      hue: Math.round(phi / Math.PI * 30)
    }
  }
}
