<template>
  <div id="App">
    asd
  </div>
</template>

<script>
import { getXStreamId } from '@/utils/sessionTool' // get token from cookie
import * as SessionTool from '@/utils/sessionTool.js'

export default {
  name: 'App',
  async created () {
    const hasXStreamId = getXStreamId() // 获取token
    const savePermission = SessionTool.getUserPermission()
    console.log(savePermission)
  }
}
</script>
