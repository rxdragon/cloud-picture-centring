<template>
  <div id="App">
    <router-view />
    <painted-eggshell />
  </div>
</template>

<script>
import PaintedEggshell from '@/components/PaintedEggshell'

import { clearAllStorage } from '@/utils/sessionTool'
export default {
  name: 'App',
  components: { PaintedEggshell },
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
  overflow: hidden;
}

#App {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
