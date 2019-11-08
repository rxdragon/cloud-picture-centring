<template>
  <div id="App">
    <transition name="app-transform" mode="out-in">
      <router-view />
    </transition>
    <painted-eggshell v-if="showCat" />
  </div>
</template>

<script>
import PaintedEggshell from '@/components/PaintedEggshell'
import { mapGetters } from 'vuex'
import { clearAllStorage } from '@/utils/sessionTool'
import { throttle } from '@/utils/throttle.js'
import Mousetrap from 'mousetrap'
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
    const throttleRefresh = throttle(this.refresh, 5000)
    Mousetrap.bind('command+r', () => {
      throttleRefresh()
      return false
    }, 'keydown')
  },
  methods: {
    /**
     * @description 刷新
     */
    refresh () {
      const view = this.$route
      this.$store.dispatch('tagsView/delCachedView', view).then(() => {
        const { fullPath } = view
        this.$nextTick(() => {
          this.$router.replace({
            path: '/redirect' + fullPath
          })
        })
      })
    }
  }
}
</script>

<style lang="less">
html {
  background-color: #f2f6fc;
}

body {
  margin: 0;
  padding: 0;
  overflow: hidden;

  --boxShadow: '';
  --navbarMainLeft: 120px;
}

#App {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
