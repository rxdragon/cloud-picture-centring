<template>
  <div class="workbench-switch">
    <el-button
      :class="showWorkbench && 'active'"
      @click="turnOnWorkbench"
      class="icon-button"
      icon="el-icon-receiving"
    >
    </el-button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as Setting from '@/indexDB/getSetting.js'
import { WORKBENCH_LOCATION } from '@/utils/enumerate'
import { WINDOW_NAME } from '@/electronMain/window/WindowEnumerate'

export default {
  name: 'WorkbenchSwitch',
  data () {
    return {
    }
  },
  computed: {
    ...mapGetters(['showWorkbench', 'workbenchLocation']),
  },
  async mounted () {
    if (this.showWorkbench && this.workbenchLocation === WORKBENCH_LOCATION.WINDOW) {
      const url = `${window.location.origin}/workbench.html`
      await this.$ipcRenderer.sendSync('workbench-window', url)
    }
  },
  methods: {
    async turnOnWorkbench () {
      const value = !this.showWorkbench
      await this.$store.dispatch('setting/setShowWorkbench', value)
      const data = Boolean(value) ? 1 : 0
      await Setting.updateSetting('showWorkbench', data)

      if (this.workbenchLocation === WORKBENCH_LOCATION.WINDOW) {
        if (value) {
          const url = `${window.location.origin}/workbench.html`
          await this.$ipcRenderer.sendSync('workbench-window', url)
        } else {
          const windowName = WINDOW_NAME.WORKBENCH
          this.$ipcRenderer.sendSync('close-window', windowName)
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.workbench-switch {
  margin-right: 6px;
}

.icon-button {
  width: 24px;
  height: 24px;
  padding: 0;

  &.active {
    color: @blue;
    background-color: @blue !important;
  }
}
</style>
