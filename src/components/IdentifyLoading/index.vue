<template>
  <div ref="identifyLoading" class="identify-loading">
  </div>
</template>

<script>
import lottie from 'lottie-web'
import animationData from './lf30_editor_7P9xu6.json'

export default {
  name: 'IdentifyLoading',
  mounted () {
    const element = this.$refs['identifyLoading']
    lottie.loadAnimation({
      container: element, // the dom element that will contain the animation
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: animationData // the path to the animation json
    })
  }
}
</script>

<style lang="less" scoped>
.identify-loading {
  width: 80%;
  height: 80%;
}
</style>
