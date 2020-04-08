<template>
  <div class="painted-eggshell">
    <div class="live2d-widget">
      <canvas id="live2dcanvas" width="280" height="300" />
    </div>
  </div>
</template>

<script>
const L2Dwidget = require('live2d-widget').L2Dwidget
export default {
  name: 'PaintedEggshell',
  data () {
    return {
      modelObj: {
        whiteCat: './live2d_models/tororo/tororo.model.json',
        blackCat: './live2d_models/hijiki/hijiki.model.json',
        dog: './live2d_models/wanko/wanko.model.json'
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
      if (Object.keys(L2Dwidget.config).length) {
        L2Dwidget.config.model.jsonPath = dir
        L2Dwidget.init()
      } else {
        L2Dwidget.init(this.getOptions(dir))
      }
    },
    /**
     * @dedescription 获取参数
     */
    getOptions (dir) {
      return {
        tagMode: true,
        model: { jsonPath: dir },
        display: {
          position: 'right',
          width: 280,
          height: 300
        },
        dialog: { enable: true },
        mobile: { show: true },
        log: true
      }
    }
  }
}
</script>

<style lang="less" scoped>
.painted-eggshell {
  position: fixed;
  right: 0;
  bottom: 0;
  z-index: 9999;
}
</style>
