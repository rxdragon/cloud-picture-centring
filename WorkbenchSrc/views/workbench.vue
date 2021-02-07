<template>
  <div class="workbench" :class="darkMode && 'dark-workbench'">
    <div class="workbench-title">
      <div class="plugin-left">
        <transition name="fade" mode="out-in">
          <el-button type="text" v-if="darkMode" @click="toggleMode('sunny')">
            <i class="el-icon-sunny"></i>
          </el-button>
          <el-button type="text" v-else @click="toggleMode('moon')">
            <i class="el-icon-moon"></i>
          </el-button>
        </transition>
      </div>
      缦图工作台
      <div class="plugin-button">
        置顶
        <el-switch
          :value="isStickTop"
          active-color="#4669FB"
          @change="onStickTopChange"
          inactive-color="#C0C4CC"
        >
        </el-switch>
      </div>
    </div>
    <div class="workbench-content">
      <retouch-workbench v-if="hasRetouchWorkbench" :isStickTop="isStickTop" :dark="darkMode" />
      <online-workbench v-if="hasOnlineWorkbench" :dark="darkMode" />
      <product-review-workbench v-if="hasProductReview" :dark="darkMode" />
    </div>
  </div>
</template>

<script>
import * as SessionTool from '@/utils/sessionTool.js'
import * as Setting from '@/indexDB/getSetting.js'
import { getWorkbenchInfo, updateWorkbenchInfo } from '@/indexDB/index'

import ProductReviewWorkbench from '../components/ProductReviewWorkbench'
import OnlineWorkbench from '../components/OnlineWorkbench'
import RetouchWorkbench from '../components/RetouchWorkbench'

import { WINDOW_NAME } from '../../src/electronMain/window/WindowEnumerate'
import { WORKBENCH_LOCATION } from '@/utils/enumerate'

export default {
  name: 'workbench',
  components: { ProductReviewWorkbench, OnlineWorkbench, RetouchWorkbench },
  data () {
    return {
      isStickTop: false, // 是否置顶
      darkMode: false, // 是否暗黑模式
      hasRetouchWorkbench: false, // 是否含有修图板块
      hasOnlineWorkbench: false, // 是否含有在线看片权限
      hasProductReview: false, // 是否含有产品审核权限
    }
  },
  async created () {
    const { mode } = await getWorkbenchInfo()
    this.darkMode = mode === 'moon'
    this.judgeInPermission()
    this.judgeInWindow()
  },
  methods: {
    /**
     * @description 判断权限
     */
    judgeInPermission () {
      const savePermission = SessionTool.getUserPermission()
      this.hasRetouchWorkbench = savePermission.find(item => item.name === 'workbench.retouch_info.get')
      this.hasOnlineWorkbench = savePermission.find(item => item.name === 'workbench.picture_online_info.get')
      this.hasProductReview = savePermission.find(item => item.name === 'workbench.product_check.get')
    },
    /**
     * @description 判断是否在新的窗口
     */
    judgeInWindow () {
      const windowUrl = window.location.href
      this.isStickTop = windowUrl.includes(`${WINDOW_NAME.WORKBENCH}.html`)
    },
    /**
     * @description 监听是否置顶变化
     */
    async onStickTopChange (value) {
      if (value) {
        await this.$nextTick()
        this.stickTop()
      } else {
        this.closeStickWindow()
      }
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
    async closeStickWindow () {
      const windowName = WINDOW_NAME.WORKBENCH
      await Setting.updateSetting('workbenchLocation', WORKBENCH_LOCATION.APP)
      this.$ipcRenderer.sendSync('close-window', windowName)
    },
    /**
     * @description 切换模式
     */
    toggleMode (mode) {
      this.darkMode = mode === 'moon'
      updateWorkbenchInfo({ mode })
    }
  }
}
</script>

<style lang="less" scoped>
.workbench {
  --baseColor: #303133;
  --descColor: #606266;
  --borderColor: #f2f6fc;

  position: relative;
  width: 400px;
  overflow: hidden;
  font-size: 14px;
  color: var(--baseColor);
  user-select: none;
  background-color: #fff;
  border-radius: 10px;
  opacity: 1;
  transition: all 0.3s;

  &::after {
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    width: 4px;
    height: 100%;
    content: '';
    background-color: @blue;
  }

  .workbench-title {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 52px;
    font-weight: 600;
    line-height: 20px;
    border-bottom: 1px solid var(--borderColor);

    .plugin-button {
      position: absolute;
      top: 0;
      right: 16px;
      font-weight: 400;
      line-height: 52px;
    }

    .plugin-left {
      position: absolute;
      top: 0;
      left: 16px;
      font-weight: 400;
      line-height: 52px;

      .el-icon-sunny {
        color: @orange;
      }
    }
  }
}

.dark-workbench {
  --baseColor: #c0c4cc;
  --descColor: #909399;
  --borderColor: rgba(242, 246, 252, 0.2);

  background: #303133;
}
</style>
