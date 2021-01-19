<template>
  <div class="home">
    <div class="logo-tip">
      <div class="logo-img home-logo" />
      <div class="logo-desc">
        <span class="black">欢迎来到</span>
        <span class="desc">缦图云端修图中心</span>
        <el-button @click="test">测试</el-button>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Home',
  data () {
    return {
      days: 0,
      retouchPhoto: 0,
      lottieAnimation: null,
      show: false
    }
  },
  methods: {
    async test () {
      const url = `${window.location.origin}/workbench.html`
      await this.$ipcRenderer.sendSync('workbench-window', url)
    }
  }
}
</script>
<style lang="less" scoped>
.home {
  position: relative;
  height: @homeHeight;

  .logo-tip {
    position: absolute;
    top: 50%;
    left: 50%;
    width: min-content;
    transform: translateX(-50%) translateY(-50%);

    .logo-img {
      width: 568px;
      height: 391px;
    }

    .logo-desc {
      margin-top: 26px;
      font-family: @pingFang;
      font-size: 30px;
      font-weight: 600;
      line-height: 38px;
      color: #131923;
      text-align: center;

      .desc {
        color: @blue;
      }
    }
  }
}
</style>

