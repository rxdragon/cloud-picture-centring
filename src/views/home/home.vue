<template>
  <div class="Home">
    <div v-if="upload" id="app">
      <div class="onUpload">
        <p>检查到版本更新</p>
        <p class="version">版本号: <span>{{ upload }}</span></p>
        <button @click="doUpgrade">立即更新</button>
      </div>
    </div>
    你好！测试版本
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
<style src="./home.less" lang="less"></style>

<style lang="less" scoped>
.photo {
  width: 200px;
}
</style>

