<template>
  <div class="order-info-module">
    <div class="panel-title">照片信息</div>
    <div class="panel-content">
      <div class="base-info panel-row">
        <span class="order-info" v-if="infoData.photoIndex">
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
      <div class="retouch-remark panel-row" v-if="showOtherNote">
        <div class="remark-title">订单备注：</div>
        <div class="remark-content">{{ infoData.streamInfo.orderNote || '-' }}</div>
      </div>
      <div class="retouch-remark panel-row" v-if="showOtherNote">
        <div class="remark-title">化妆备注：</div>
        <div class="remark-content">{{ infoData.streamInfo.dresserNote || '-' }}</div>
      </div>
      <div class="retouch-remark panel-row" v-if="showOtherNote">
        <div class="remark-title">摄影备注：</div>
        <div class="remark-content">{{ infoData.streamInfo.photographyNote || '-' }}</div>
      </div>
      <div class="retouch-remark panel-row">
        <div class="remark-title">修图备注：</div>
        <div class="remark-content">{{ infoData.streamInfo.retouchRemark || '-' }}</div>
      </div>
      <div class="retouch-remark panel-row" v-if="infoData.streamInfo.retouchNotice">
        <div class="remark-title">修图注意事项：</div>
        <div class="remark-content retouch-notice">{{ infoData.streamInfo.retouchNotice || '-' }}</div>
      </div>
      <div class="retouch-remark panel-row" v-if="orderInfo.streamInfo.retouchBackImg">
        <div class="remark-title">修图底色：</div>
        <div class="impression-box">
          <span>{{ orderInfo.streamInfo.retouchBackImgName }}</span>
          <reference-photo :src="orderInfo.streamInfo.retouchBackImg" downMsg="下载" :streamNum="orderInfo.streamInfo.streamNum" />
        </div>
      </div>

      <div class="retouch-remark panel-row">
        <div class="remark-title">特效备注：</div>
        <div class="remark-content">{{ specialEfficacy }}</div>
      </div>
      <div class="retouch-remark panel-row" v-if="orderInfo.streamInfo.referencePhoto">
        <div class="remark-title">参考图：</div>
        <reference-photo :src="orderInfo.streamInfo.referencePhoto" :streamNum="orderInfo.streamInfo.streamNum" />
      </div>
    </div>
  </div>
</template>

<script>
import ReferencePhoto from '@/components/ReferencePhoto'

export default {
  name: 'OrderInfoModule',
  components: { ReferencePhoto },
  props: {
    orderInfo: { type: Object, required: true },
    showOtherNote: { type: Boolean, defautl: false }
  },
  computed: {
    infoData () {
      return this.orderInfo
    },
    // 特效备注
    specialEfficacy () {
      const tempSpecialEfficacy = _.get(this.infoData, 'photoData.tags.values.special_efficacy')
      return tempSpecialEfficacy || '无需特效'
    }
  }
}
</script>

<style lang="less" scoped>
.order-info-module {
  padding: 14px 12px;
  font-size: 12px;
  color: #eee;
  border-bottom: 1px solid #666;

  .panel-title {
    display: flex;
    align-items: center;
    margin-bottom: 10px !important;
    font-size: 14px;
    font-weight: 500;
    color: #eee;

    &::before {
      display: inline-block;
      width: 2px;
      height: 16px;
      margin-right: 6px;
      content: '';
      background-color: #4669fb;
    }
  }

  .order-info {
    display: block;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
    color: #eee;
  }

  .retouch-require {
    margin-top: 10px;

    .require-tag {
      font-size: 14px;
      font-weight: 400;
      line-height: 22px;
      color: #eee;
    }
  }

  .retouch-remark {
    display: flex;
    margin-bottom: 10px;

    .remark-title {
      width: 90px;
    }

    .remark-content {
      width: calc(100% - 80px);
    }

    .retouch-notice {
      word-break: break-all;
    }

    .impression-box {
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
