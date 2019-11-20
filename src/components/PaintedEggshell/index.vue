<template>
  <div class="painted-eggshell">
    <canvas id="live2dcanvas" width="280" height="300" />
  </div>
</template>

<script>
import { L2Dwidget } from 'live2d-widget'
export default {
  name: 'PaintedEggshell',
  data () {
    return {
      modelObj: {
        whiteCat: 'live2dw/live2d-widget-model-tororo/assets/tororo.model.json',
        blackCat: 'live2dw/live2d-widget-model-hijiki/assets/hijiki.model.json',
        dog: 'live2dw/live2d-widget-model-wanko/assets/wanko.model.json'
      }
    }
  },
  mounted () {
    this.showModel()
  },
  methods: {
    /**
     * @description 展示模型
     */
    showModel () {
      const modelArr = ['whiteCat', 'blackCat', 'dog']
      const randomKey = new Date().getTime() % 3
      const dir = this.modelObj[modelArr[randomKey]]
      L2Dwidget.init(this.getOptions(dir))
    },
    /**
     * @dedescription 获取参数
     */
    getOptions (dir) {
      dir = dir || 'live2dw/live2d-widget-model-tororo/assets/tororo.model.json'
      return {
        tagMode: false,
        model: { jsonPath: dir },
        display: {
          position: 'right',
          width: 280,
          height: 300,
          vOffset: 0
        },
        mobile: { show: true },
        log: false
      }
    }
  }
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
