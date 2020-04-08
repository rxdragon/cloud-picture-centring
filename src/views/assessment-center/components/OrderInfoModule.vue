<template>
  <div class="order-info-module">
    <div class="panel-title">订单信息</div>
    <div class="panel-content">
      <div class="base-info panel-row">
        <span class="order-info">
          <span class="order-info-title">修图标准：</span>{{ orderInfo.retouchStandard | toRetouchClass }}
          <div class="standard-icon">
            <div :class="`iconmap-standard-${orderInfo.retouchStandard}`" />
          </div>
        </span>
        <span class="order-info"><span class="order-info-title">产品名称：</span>{{ orderInfo.productName }}</span>
      </div>
      <div class="retouch-require panel-row">
        <div class="require-tag">眼睛增大幅度：{{ orderInfo.retouchRequire.eye | toLabelName }}</div>
        <div class="require-tag">瘦脸幅度：{{ orderInfo.retouchRequire.face | toLabelName }}</div>
        <div v-if="orderInfo.retouchRequire.pimples" class="require-tag">祛痣</div>
      </div>
      <div class="retouch-remark panel-row">
        <div class="remark-title">修图备注：</div>
        <div class="remark-content">{{ orderInfo.retouchNote }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderInfoModule',
  props: {
    orderInfo: { type: Object, required: true }
  },
  computed: {
    infoData () {
      return this.orderInfo
    }
  }
}
</script>

<style lang="less" scoped>
.order-info-module {
  padding: 12px;
  font-size: 12px;
  color: #eee;

  .panel-title {
    font-size: 14px;
    font-weight: 500;
  }

  .order-info {
    display: block;
  }

  .retouch-require {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .require-tag {
      font-size: 12px;
      color: #79bbff;
    }
  }

  .retouch-remark {
    display: flex;
    align-items: center;

    .remark-title {
      width: 60px;
    }

    .remark-content {
      width: calc(100% - 80px);
    }
  }
}
</style>
