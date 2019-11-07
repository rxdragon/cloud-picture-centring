<template>
  <div class="login-animation">
    <div id="bm"></div>
  </div>
</template>

<script>
import lottie from 'lottie-web'
import * as animationData from './demo.json'
export default {
  name: 'LoginAnimation',
  mounted () {
    const animation = lottie.loadAnimation({
      container: document.getElementById('bm'),
      renderer: 'svg',
      loop: false,
      autoplay: true,
      animationData: animationData.default
    })
    animation.onComplete = () => {
      this.$router.push('/')
    }
  }
}
</script>

<style lang="less" scoped>
#bm {
  -webkit-app-region: drag;
  width: 100vw;
  height: 100vh;
}
</style>