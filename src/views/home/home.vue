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
      <div class="logo-img iconmap-cloud-logo-big" />
      <div class="logo-desc">欢迎来到缦图云端修图中心</div>
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

  .logo-tip {
    width: min-content;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);

    .logo-img {
      width: 360px;
      height: 90px;
    }

    .logo-desc {
      font-size:30px;
      font-family:PingFangSC-Regular,PingFang SC;
      font-weight:400;
      color:rgba(48,49,51,1);
      line-height:38px;
      margin-top: 28px;
    }
  }
}
</style>

