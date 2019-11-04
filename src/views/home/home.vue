<template>
  <div class="home">
    <div v-if="upload" id="app">
      <div class="onUpload">
        <p>检查到版本更新</p>
        <p class="version">版本号: <span>{{ upload }}</span></p>
        <button @click="doUpgrade">立即更新</button>
      </div>
    </div>
    <div class="logo-tip">
      <div class="logo-img home-logo" />
      <div class="logo-desc">
        <span class="black">欢迎来到</span>
        <span class="desc">缦图云端修图中心</span>
      </div>
    </div>
  </div>
</template>

<script>
const { ipcRenderer } = window.require('electron')

export default {
  name: 'Home',
  data () {
    return {
      upload: '' // 是否有版本更新
    }
  },
  mounted () {
    ipcRenderer.on('version:find-new', (event, info) => {
      this.upload = info.newVersion
    })
  },
  methods: {
    async doUpgrade () {
      await ipcRenderer.send('version:do-upgrade')
      this.$newMessage.success('更新成功')
    }
  }
}
</script>
<style lang="less" scoped>
@import "~@/styles/variables.less";

.home {
  position: relative;
  height: @homeHeight;
  margin-top: -88px;

  .logo-tip {
    width: min-content;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);

    .logo-img {
      width: 568px;
      height: 391px;
    }

    .logo-desc {
      font-size: 30px;
      font-family: @pingFang;
      font-weight: 600;
      color: #131923;
      line-height: 38px;
      text-align: center;
      margin-top: 26px;

      .desc {
        color: #4669fb;
      }
    }
  }
}
</style>

