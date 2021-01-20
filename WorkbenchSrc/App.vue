<template>
  <div id="App">
    <div class="workbench-title">缦图云端工作台</div>
    <el-button @click="closeWindow">关闭窗口</el-button>
    <product-review-workbench />
    <online-workbench />
    <retouch-workbench />
  </div>
</template>

<script>
import * as SessionTool from '@/utils/sessionTool.js'

import ProductReviewWorkbench from './components/ProductReviewWorkbench'
import OnlineWorkbench from './components/OnlineWorkbench'
import RetouchWorkbench from './components/RetouchWorkbench'
import { WINDOW_NAME } from '../src/electronMain/window/WindowEnumerate'

export default {
  name: 'App',
  components: { ProductReviewWorkbench, OnlineWorkbench, RetouchWorkbench },
  async created () {
    const savePermission = SessionTool.getUserPermission()
    console.error(savePermission)
  },
  methods: {
    /**
     * @description 关闭窗口
     */
    closeWindow () {
      const windowName = WINDOW_NAME.WORKBENCH
      this.$ipcRenderer.sendSync('close-window', windowName)
    }
  }
}
</script>

<style lang="less" scoped>
#App {
  -webkit-app-region: drag;
}
</style>

<style lang="less">
body {
  padding: 0;
  margin: 0;
  overflow: hidden;
}
</style>
