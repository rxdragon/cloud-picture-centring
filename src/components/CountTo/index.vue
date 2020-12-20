<template>
  <div class="count-to">
    {{ endValue }}
  </div>
</template>

<script>
import anime from 'animejs'
export default {
  name: 'CountTo',
  props: {
    endValue: { type: [String, Number], required: true },
    decimals: { type: Boolean }, // 是否是小数动画
    decimalsCount: { type: [String, Number], default: 2 }, // 3位小树
    showPoint: { type: Boolean } // 是否显示小数点
  },
  watch: {
    endValue (newValue, oldValue) {
      const myObject = { prop: Number(oldValue) }
      anime({
        targets: myObject,
        prop: Number(newValue),
        easing: 'linear',
        round: this.showPoint ? 100 : 1,
        update: () => {
          if (this.decimals) {
            let data = myObject.prop
            const maxNum = Math.pow(10, Number(this.decimalsCount) - 1)
            data = +data < maxNum ? ('0' + String(data)) : data
            if (!this.$el) return
            this.$el.innerHTML = data
          } else {
            if (!this.$el) return
            this.$el.innerHTML = this.showPoint ? myObject.prop.toFixed(2) : myObject.prop
          }
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.count-to {
  display: inline-block;
}
</style>
