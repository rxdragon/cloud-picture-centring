<template>
  <div class="online-workbench">
    <!-- 在线看片数量 -->
    <div class="online-info">
      <div class="online-title">在线看片：</div>
      <div class="online-content">
        <div class="info-item">
          <div class="info-value">{{ waitDeal }}单</div>
          <div class="info-label">待处理</div>
        </div>
        <div class="info-item">
          <div class="info-value">{{ needOtherPhoto }}单</div>
          <div class="info-label">待上传其他成片</div>
        </div>
        <div class="info-item">
          <div class="info-value">{{ todayPhoto }}张</div>
          <div class="info-label">看片张数</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as WorkbenchApi from '@/api/workbenchApi'

export default {
  name: 'OnlineWorkbench',
  data () {
    return {
      waitDeal: 0,
      needOtherPhoto: 0,
      todayPhoto: 0
    }
  },
  created () {
    this.initPollingInfo()
  },
  destroyed () {
    if (window.polling.getOnlineInfo) {
      clearTimeout(window.polling.getOnlineInfo)
    }
  },
  methods: {
    /**
     * @description 获取基本信息
     */
    async getInfoData () {
      const { waitDeal, needOtherPhoto, todayPhoto } = await WorkbenchApi.getOnlineInfo()
      this.waitDeal = waitDeal
      this.needOtherPhoto = needOtherPhoto
      this.todayPhoto = todayPhoto
    },
    /**
     * @description 初始化信息
     */
    async initPollingInfo () {
      await this.getInfoData()
      window.polling.getOnlineInfo = setTimeout(async () => {
        await this.initPollingInfo()
      }, 5000)
    }
  }
}
</script>

<style lang="less" scoped>
.online-info {
  padding: 12px 20px;
  border-bottom: 1px solid var(--borderColor);

  .online-title {
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    color: var(--baseColor);
  }

  .online-content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);

    .info-item {
      text-align: center;

      .info-value {
        font-size: 14px;
        font-weight: 600;
        line-height: 20px;
        color: var(--baseColor);
      }

      .info-label {
        font-size: 12px;
        font-weight: 400;
        line-height: 17px;
        color: #909399;
      }
    }
  }
}
</style>
