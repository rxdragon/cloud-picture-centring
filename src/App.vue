<template>
  <div id="App">
    <transition name="app-transform" mode="out-in">
      <router-view />
    </transition>
    <painted-eggshell v-if="showCat" />
    <div class="workbench-module" v-if="showWorkbenchInApp">
      <workbench @stick="onStickTop" />
    </div>
  </div>
</template>

<script>
import PaintedEggshell from '@/components/PaintedEggshell'
import DownIpc from '@electronMain/ipc/DownIpc'
import { mapGetters } from 'vuex'
import { clearAllStorage } from '@/utils/sessionTool'
import { throttle } from '@/utils/throttle.js'
import { WORKBENCH_LOCATION } from '@/utils/enumerate'
import { WINDOW_NAME } from '@/electronMain/window/WindowEnumerate'
import { initShowWorkbenc, initWorkbenchLocation, updateWorkbenchInfo } from '@/indexDB/index'

import * as Setting from '@/indexDB/getSetting.js'

import Mousetrap from 'mousetrap'
import variables from '@/styles/variables.less'
import workbench from '../WorkbenchSrc/views/workbench'

export default {
  name: 'App',
  components: { PaintedEggshell, workbench },
  computed: {
    ...mapGetters(['showCat', 'isRetoucher', 'lineState', 'showWorkbench', 'workbenchLocation', 'name']),
    showWorkbenchInApp () {
      return this.showWorkbench && this.workbenchLocation === WORKBENCH_LOCATION.APP && Boolean(this.name)
    }
  },
  created () {
    if (this.$isDev) {
      document.body.style.setProperty('--subMenuBg', variables.devSubMenuBg)
      document.body.style.setProperty('--menuBg', variables.devMenuBg)
    }
  },
  mounted () {
    this.initElectronIpc()
  },
  methods: {
    /**
     * @description 注册electron事件
     */
    initElectronIpc () {
      // 监听关闭窗口
      this.$ipcRenderer.on('closed-win', (e, item) => {
        clearAllStorage()
      })

      this.$ipcRenderer.on(`${WINDOW_NAME.WORKBENCH}-close`, async (e, item) => {
        await initShowWorkbenc()
        await initWorkbenchLocation()
      })

      // 通过主窗口下载
      this.$ipcRenderer.on(`main-window-down`, async (e, data) => {
        DownIpc.addDownloadFile(data)
      })

      // 拦截刷新
      const throttleRefresh = throttle(this.refresh, 5000)
      Mousetrap.bind('command+r', () => {
        throttleRefresh()
        return false
      }, 'keydown')
    },
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
    },
    /**
     * @description 置顶
     */
    async onStickTop () {
      const workbenchDom = document.querySelector('.workbench-module')
      let height = 400
      let width = 400
      if (workbenchDom) {
        height = workbenchDom.clientHeight
        width = workbenchDom.clientWidth
      }

      updateWorkbenchInfo({ width, height })

      // 更新工作台打开模式
      await this.$store.dispatch('setting/setWorkbenchLocation', WORKBENCH_LOCATION.WINDOW)
      await Setting.updateSetting('workbenchLocation', WORKBENCH_LOCATION.WINDOW)

      // 开启窗口
      const url = `${window.location.origin}/workbench.html`
      await this.$ipcRenderer.sendSync('workbench-window', { url, width, height })
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

.workbench-module {
  position: fixed;
  right: 24px;
  bottom: 34px;
  z-index: 9999;
  width: 400px;
  border-radius: 10px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
}
</style>
