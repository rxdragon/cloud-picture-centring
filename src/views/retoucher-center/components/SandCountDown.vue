<template>
  <div class="sand-count-down">
    <span :class="sandClass">
      <template v-if="isOver">超时：</template>
      {{ sandTime | toTimeFormat }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'SandCountDown',
  props: {
    sandGlass: { type: [Object, String], required: true }
  },
  data () {
    return {
      goalTime: { // 目标时间
        green: 0,
        red: 0
      }, // 目标沙漏时间
      overTime: 0, // 超时时间
      sandTime: 0, // 沙漏时间
      sandClass: '', // 沙漏样式
      isOver: false
    }
  },
  created () {
    this.overTime = +this.sandGlass.over_time
    this.isOver = this.overTime > 0
    const nowDate = Math.ceil(new Date().getTime() / 1000)
    this.goalTime.green = this.sandGlass.green_time + nowDate
    this.goalTime.red = this.sandGlass.green_time + this.sandGlass.orange_time + nowDate
    this.countDown()
  },
  methods: {
    /**
     * @description 时间倒计时
     */
    countDown () {
      let time = 0
      const nowDate = Math.ceil(new Date().getTime() / 1000)
      if (this.goalTime.green - nowDate > 0) {
        time = this.goalTime.green - nowDate
        this.sandClass = ''
      } else if (this.goalTime.red - nowDate > 0) {
        time = this.goalTime.red - nowDate
        this.sandClass = 'warning-color'
      } else {
        time = nowDate - this.goalTime.red + this.overTime
        this.isOver = true
        this.sandClass = 'danger-color'
      }
      this.sandTime = time
      setTimeout(this.countDown, 1000)
    }
  }
}
</script>
