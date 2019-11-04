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
import Mousetrap from 'mousetrap'
import { throttle } from '@/utils/throttle.js'
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
      console.log('刷新')
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
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  --boxShadow: '';
}

#App {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
