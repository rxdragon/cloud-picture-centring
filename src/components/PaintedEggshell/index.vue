<template>
  <div class="painted-eggshell">
    <canvas id="live2dcanvas" width="280" height="250" />
  </div>
</template>

<script>
import { L2Dwidget } from 'live2d-widget'
export default {
  name: 'PaintedEggshell',
  data () {
    return {
      configs: {
        tagMode: false,
        debug: false,
        model: { jsonPath: 'live2dw/live2d-widget-model-tororo/assets/tororo.model.json' },
        display: {
          position: 'right',
          width: 280,
          height: 250,
          vOffset: 20
        },
        mobile: { show: true },
        log: false
      }
    }
  },
  mounted () {
    L2Dwidget.init(this.configs)
  },
  methods: {}
}
</script>

<style lang="less" scoped>
.painted-eggshell {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 9999;
}
</style>
