<template>
  <div class="progress-box">
    <el-progress
      :text-inside="true"
      :format="format"
      :stroke-width="26"
      :percentage="percentage"
    />
  </div>
</template>

<script>
export default {
  name: 'ProgressBox',
  props: {
    spotNum: { type: Number, required: true }
  },
  data () {
    return {
      percentage: 0,
      interval: null
    }
  },
  computed: {
    num () {
      if (this.percentage === 0) {
        return 0
      } else if (this.percentage === 100) {
        return this.spotNum
      } else {
        const showNum = this.spotNum * (this.percentage / 100)
        return Math.floor(showNum, 0)
      }
    }
  },
  created () {
    const timeAddCount = 2.5
    this.interval = setInterval(() => {
      this.percentage += timeAddCount
      if (this.percentage === 100) {
        clearInterval(this.interval)
        this.interval = null
      }
    }, 100)
  },
  methods: {
    format (percentage) {
      return `${this.num}张`
    }
  }
}
</script>
