<template>
  <div class="workbench">
    <el-button v-if="!isInWindow" @click="stickTop">置顶</el-button>
    <div class="workbench-title">缦图云端工作台</div>
    <el-button v-if="isInWindow" @click="closeWindow">取消置顶</el-button>
    <product-review-workbench />
    <online-workbench />
    <retouch-workbench />
    <el-button @click="down">下载</el-button>
  </div>
</template>

<script>
import * as SessionTool from '@/utils/sessionTool.js'
import * as Setting from '@/indexDB/getSetting.js'

import ProductReviewWorkbench from '../components/ProductReviewWorkbench'
import OnlineWorkbench from '../components/OnlineWorkbench'
import RetouchWorkbench from '../components/RetouchWorkbench'
import DownIpc from '@electronMain/ipc/DownIpc'

import { WINDOW_NAME } from '../../src/electronMain/window/WindowEnumerate'
import { WORKBENCH_LOCATION } from '@/utils/enumerate'

export default {
  name: 'workbench',
  components: { ProductReviewWorkbench, OnlineWorkbench, RetouchWorkbench },
  data () {
    return {
      isInWindow: false
    }
  },
  async created () {
    const savePermission = SessionTool.getUserPermission()
    console.error(savePermission)
    this.judgeInWindow()

  },
  methods: {
    /**
     * @description 判断是否在新的窗口
     */
    judgeInWindow () {
      const windowUrl = window.location.href
      this.isInWindow = windowUrl.includes(`${WINDOW_NAME.WORKBENCH}.html`)
    },
    /**
     * @description 置顶
     */
    stickTop () {
      this.$emit('stick')
    },
    /**
     * @description 关闭窗口
     */
    async closeWindow () {
      const windowName = WINDOW_NAME.WORKBENCH
      await Setting.updateSetting('workbenchLocation', WORKBENCH_LOCATION.APP)
      this.$ipcRenderer.sendSync('close-window', windowName)
    },
    down () {
      // TODO 更改下载地址
      const data = {
        url: 'https://cloud-dev.cdn-qn.hzmantu.com/compress/2020/06/17/ljj3UXg3uaY_C0DJ4kBsitaVV8UJ.jpg',
        path: ''
      }

      // 判断从那里下载文件
      if (this.isInWindow) {
        this.$ipcRenderer.sendSync('other-window-down', data)
      } else {
        DownIpc.addDownloadFile(data)
      }
    }
  }
}
</script>
