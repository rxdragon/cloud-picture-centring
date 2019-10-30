<template>
  <div id="App">
    <router-view />
    <painted-eggshell v-if="showCat"/>
    <el-button class="test-box" @click="test">开关</el-button>
  </div>
</template>

<script>
import PaintedEggshell from '@/components/PaintedEggshell'

import { clearAllStorage } from '@/utils/sessionTool'
export default {
  name: 'App',
  components: { PaintedEggshell },
  data () {
    return {
      showCat: false
    }
  },
  mounted () {
    this.$ipcRenderer.on('closed-win', (e, item) => {
      clearAllStorage()
    })
  },
  methods: {
    test() {
      this.showCat = !this.showCat
    }
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

.test-box {
  position: fixed;
  left: 0;
  top: 30px;
}
</style>
