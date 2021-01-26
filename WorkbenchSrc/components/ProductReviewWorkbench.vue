<template>
  <div class="product-review-workbench">
    <div class="product-item">
      待审核产品：{{ waitCheck }}
    </div>
    <div class="product-item">
      今日新增待审核：{{ todayWaitCheck }}
    </div>
  </div>
</template>

<script>
import * as WorkbenchApi from '@/api/workbenchApi'

export default {
  name: 'ProductReviewWorkbench',
  data () {
    return {
      waitCheck: 0,
      todayWaitCheck: 0
    }
  },
  created () {
    this.initPollingInfo()
  },
  destroyed () {
    if (window.polling.getProductInfo) {
      clearTimeout(window.polling.getProductInfo)
    }
  },
  methods: {
    /**
     * @description 获取待审核产品
     */
    async getProductInfo () {
      const { waitCheck, todayWaitCheck } = await WorkbenchApi.getProductInfo()
      this.waitCheck = waitCheck
      this.todayWaitCheck = todayWaitCheck
    },
    /**
     * @description 初始化信息
     */
    async initPollingInfo () {
      await this.getProductInfo()
      window.polling.getProductInfo = setTimeout(async () => {
        await this.initPollingInfo()
      }, 5000)
    }
  }
}
</script>

<style lang="less" scoped>
.product-review-workbench {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  padding: 12px 20px;

  .product-item {
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    color: var(--baseColor);
  }
}
</style>
