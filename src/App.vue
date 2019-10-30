<template>
  <div id="App">
    <router-view />
    <painted-eggshell v-if="showCat" />
  </div>
</template>

<script>
import PaintedEggshell from '@/components/PaintedEggshell'
import { mapGetters } from 'vuex'
import { clearAllStorage } from '@/utils/sessionTool'
export default {
  name: 'App',
  components: { PaintedEggshell },
  computed: {
    ...mapGetters(['showCat'])
  },
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
