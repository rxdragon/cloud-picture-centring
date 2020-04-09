<template>
  <div class="order-info-module">
    <div class="panel-title">照片信息</div>
    <div class="panel-content">
      <div class="base-info panel-row">
        <span class="order-info">
          <span class="order-info-title">照片编号：</span>
          {{ infoData.photoIndex }}
        </span>
        <span class="order-info">
          <span class="order-info-title">修图标准：</span>{{ infoData.productInfo.type | toRetouchClass }}
          <div class="standard-icon">
            <div :class="`iconmap-standard-${infoData.productInfo.type}`" />
          </div>
        </span>
        <span class="order-info"><span class="order-info-title">产品名称：</span>{{ infoData.productInfo.productName }}</span>
      </div>
      <div class="retouch-require panel-row">
        <div class="require-tag">眼睛增大幅度：{{ infoData.streamInfo.requireLabel.eye | toLabelName }}</div>
        <div class="require-tag">瘦脸幅度：{{ infoData.streamInfo.requireLabel.face | toLabelName }}</div>
        <div v-if="infoData.streamInfo.requireLabel.pimples" class="require-tag">祛痣</div>
      </div>
      <div class="retouch-remark panel-row">
        <div class="remark-title">修图备注：</div>
        <div class="remark-content">{{ infoData.streamInfo.retouchRemark || '-' }}</div>
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
  padding: 14px 18px;
  font-size: 12px;
  color: #eee;
  border-bottom: 1px solid #666;

  .panel-title {
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    &::before {
      content: '';
      display: inline-block;
      width: 2px;
      height: 16px;
      background-color: #4669fb;
      margin-right: 6px;
    }
  }

  .order-info {
    display: block;
    font-size: 14px;
    font-weight: 400;
    color: #eee;
    line-height: 22px;
  }

  .retouch-require {
    margin-top: 10px;

    .require-tag {
      font-size: 14px;
      font-weight: 400;
      color: #eee;
      line-height: 22px;
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
