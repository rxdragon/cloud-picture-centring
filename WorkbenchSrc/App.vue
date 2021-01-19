<template>
  <div id="App">
    <div class="workbench-title">缦图云端工作台</div>
    <product-review-workbench />
    <online-workbench />
    <retouch-workbench />
  </div>
</template>

<script>
import { getXStreamId } from '@/utils/sessionTool' // get token from cookie
import * as SessionTool from '@/utils/sessionTool.js'

import ProductReviewWorkbench from './components/ProductReviewWorkbench'
import OnlineWorkbench from './components/OnlineWorkbench'
import RetouchWorkbench from './components/RetouchWorkbench'

export default {
  name: 'App',
  components: { ProductReviewWorkbench, OnlineWorkbench, RetouchWorkbench },
  async created () {
    const hasXStreamId = getXStreamId() // 获取token
    const savePermission = SessionTool.getUserPermission()
    console.log(savePermission)
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
