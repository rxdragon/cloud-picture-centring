<template>
  <div class="timeout-area">
    <div v-if="canAppeal">
      <p class="info-item">沙漏预计时长：{{ orderData.hourGlassAllTime }}</p>
      <p class="info-item">实际修图时长：{{ orderData.retouchAllTime }}</p>
      <div class="info-item">
        <p class="info-title">问题描述(必填)：</p>
        <el-input
          type="textarea"
          placeholder="问题描述,最多100个字符"
          v-model="orderData.timeoutAppealReason"
          maxlength="100"
        />
      </div>
    </div>
    <p v-else class="not-timeout">{{ reasonText }}</p>
  </div>
</template>

<script>
import { APPEAL_TYPE } from '@/utils/enumerate.js'

export default {
  name: 'TimeoutAppeal',
  props: {
    orderData: { type: Object, required: true }
  },
  computed: {
    canAppeal () {
      let canAppeal = true

      this.orderData.currentStreamAppeals.forEach(item => { // 是否在申诉中
        if (item.type === APPEAL_TYPE.TIMEOUT) canAppeal = false
      })
      if (this.orderData.timeoutRollbackLog) canAppeal = false
      if (this.orderData.overTimeNum <= 0) canAppeal = false
      return canAppeal
    },
    reasonText () {
      let reasonText = '沙漏未超时'
      this.orderData.currentStreamAppeals.forEach(item => { // 是否在申诉中
        if (item.type === APPEAL_TYPE.TIMEOUT) reasonText = '该流水存在进行中的沙漏申诉'
      })
      if (this.orderData.timeoutRollbackLog) reasonText = '申诉超时已通过'
      return reasonText
    }
  }
}
</script>

<style lang="less" scoped>
.timeout-area {
  .info-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 10px;
  }

  .info-title {
    width: 100px;
    font-size: 14px;
    color: #303133;
  }

  .not-timeout {
    font-size: 16px;
    font-weight: 500;
  }
}
</style>
