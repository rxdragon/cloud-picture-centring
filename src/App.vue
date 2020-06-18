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
import variables from '@/styles/variables.less'
export default {
  name: 'App',
  components: { PaintedEggshell },
  computed: {
    ...mapGetters(['showCat', 'isRetoucher', 'lineState'])
  },
  created () {
    if (this.$isDev) {
      document.body.style.setProperty('--subMenuBg', variables.devSubMenuBg)
      document.body.style.setProperty('--menuBg', variables.devMenuBg)
    }
    this.$ipcRenderer.on('get-photoshop-memory:res', (e, item) => {
      const res = item.stdout
      let rowList = res.split('\n')
      rowList = rowList.filter(item => item)
      const tableData = rowList.map(item => {
        const colArr = item.split(' ')
        return {
          PID: colArr[0],
          CPU: colArr[1] / 100,
          MEM: colArr[2] / 100,
          VSZ: colArr[3],
          RSS: colArr[4],
          PPID: colArr[5],
        }
      })
      console.error(tableData)
    })
    this.$ipcRenderer.send('get-photoshop-memory')
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
  padding: 0;
  margin: 0;
  overflow: hidden;

  --menuBg: @menuBg;
  --subMenuBg: @subMenuBg;
  --boxShadow: '';
  --navbarMainLeft: 120px;
}

#App {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
