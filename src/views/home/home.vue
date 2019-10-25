<template>
  <div class="Home">
    <div v-if="upload" id="app">
      <div class="onUpload">
        <p>检查到版本更新</p>
        <p class="version">版本号: <span>{{ upload }}</span></p>
        <button @click="doUpgrade">立即更新</button>
      </div>
    </div>
    <photo-box stream-num="C2019123123" downing src="10c8033841f4f1b557222102055d0301.jpg" />
    你好！
  </div>
</template>

<script>
import PhotoBox from '@/components/PhotoBox'
const { ipcRenderer } = window.require('electron')

export default {
  name: 'Home',
  components: { PhotoBox },
  data () {
    return {
      upload: ''
    }
  },
  created () {},
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

