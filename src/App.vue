<template>
  <div id="App">
    <router-view />
  </div>
</template>

<script>
import { clearAllStorage } from '@/utils/sessionTool'
export default {
  name: 'App',
  mounted () {
    this.$ipcRenderer.on('closed-win', (e, item) => {
      clearAllStorage()
    })
  }
}
</script>

<style lang="less">
body {
  margin: 0;
  padding: 0;
}

#App {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
