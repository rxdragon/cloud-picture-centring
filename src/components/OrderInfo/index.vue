<template>
  <div class="order-info module-panel">
    <div class="panel-title">
      照片信息
    </div>
    <div class="table-info">
      <div class="table-panel" :class="{'table-panel-rework': isRework}">
        <div class="caid">流水号</div>
        <div class="institution">机构</div>
        <div class="institution">摄影师</div>
        <div class="type">修图标准</div>
        <div v-if="isRework" class="retoucher">修图师</div>
        <div class="product">拍摄产品</div>
        <div class="wait-time">顾客等待时间</div>
        <div class="photo-count">照片数量</div>
      </div>
      <div class="table-panel table-panel-concent" :class="{'table-panel-rework': isRework}">
        <div class="caid">
          <div class="stream-state" :class="{'wrap': reworkTwice}">
            <div class="stream-num">{{ orderData.streamNum }}</div>
            <el-tag v-if="orderData.isCheckReturn" size="mini" type="danger">审核退回</el-tag>
            <el-tag v-if="orderData.isStoreReturn" size="mini" type="danger">门店退回</el-tag>
          </div>
        </div>
        <div class="institution">{{ orderData.photographerName }}</div>
        <div class="institution">{{ orderData.photographer }}</div>
        <div class="type">
          <div class="standard-box">
            {{ orderData.type || orderData.productInfo.type | toRetouchClass }}
            <div class="standard-icon">
              <div :class="`iconmap-standard-${orderData.type || orderData.productInfo.type}`" />
            </div>
          </div>
        </div>
        <div v-if="isRework" class="retoucher">{{ orderData.retoucherName }}</div>
        <div class="product">{{ orderData.productName || orderData.productInfo.productName }}</div>
        <div class="wait-time">{{ orderData.waitTime }}</div>
        <div class="photo-count">{{ orderData.photoNum }}</div>
      </div>
      <div class="panel-title">
        修图要求
      </div>
      <div class="panel-require-concent">
        <div class="require-label">
          <el-tag size="medium">眼睛增大幅度：{{ orderData.requireLabel.eye | toLabelName }}</el-tag>
          <el-tag size="medium">瘦脸幅度：{{ orderData.requireLabel.face | toLabelName }}</el-tag>
          <el-tag v-if="orderData.requireLabel.pimples" size="medium">祛痣</el-tag>
        </div>
        <div class="require-remark">
          <span>修图备注：</span>
          <div class="remark-content">{{ orderData.retouchRemark }}</div>
        </div>
        <div v-if="orderData.backgroundColor" class="require-remark">
          <span>背景图要求：</span>
          <div class="remark-content require-background-color">
            <img :src="orderData.backgroundColor" alt="">
            <el-button type="text" @click="downbackground">下载背景图</el-button>
          </div>
        </div>
        <div v-if="orderData.reviewerNote" class="require-remark">
          <span>审核备注：</span>
          <div class="remark-content">{{ orderData.reviewerNote }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DownIpc from '@electronMain/ipc/DownIpc'

export default {
  name: 'OrderInfo',
  props: {
    orderData: {
      type: Object,
      default: () => {
        return {
          streamNum: '暂无信息',
          type: '暂无信息',
          photographerName: '暂无信息',
          productName: '暂无信息',
          photoNum: '暂无信息',
          waitTime: '暂无信息',
          productInfo: {}
        }
      }
    },
    showRetouch: { type: Boolean }
  },
  data () {
    return {}
  },
  computed: {
    isRework () {
      return (this.orderData.isCheckReturn || this.orderData.isStoreReturn) && this.showRetouch
    },
    reworkTwice () {
      return this.orderData.isCheckReturn || this.orderData.isStoreReturn
    }
  },
  methods: {
    downbackground () {
      const savePath = `/${this.orderData.streamNum}`
      const data = {
        url: this.orderData.backgroundColor,
        path: savePath
      }
      this.$newMessage.success('已添加一张照片到下载')
      DownIpc.addDownloadFile(data)
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";

.order-info {
  .table-info {
    margin-top: 10px;
    overflow: hidden;
    border-radius: 4px;
  }

  .panel-require-concent {
    padding: 20px;
    padding-bottom: 0;
    margin-top: 12px;
    overflow: hidden;
    background-color: #fafafa;
    border-radius: 4px;

    .require-label {
      padding-bottom: 20px;

      .el-tag {
        margin-right: 12px;
      }
    }

    .require-remark {
      display: flex;
      padding: 20px 0;
      border-top: 1px solid #dddfe6;

      & > span {
        width: 90px;
        font-size: 14px;
        color: #303133;
      }

      .remark-content {
        width: 632px;
        font-size: 14px;
        color: #303133;
        white-space: pre-wrap;
      }

      .require-background-color {
        display: flex;
        align-items: center;

        img {
          width: 50px;
          height: 50px;
          margin-right: 10px;
        }
      }
    }
  }

  .table-panel {
    display: grid;
    grid-template-columns: 4fr 2fr 2fr 2fr 2fr 2fr 2fr;

    .stream-state {
      .el-tag:nth-last-of-type(1) {
        margin-left: 12px;
      }

      .stream-num {
        display: inline-block;
      }

      &.wrap {
        .stream-num {
          display: block;
        }
      }
    }

    & > div {
      box-sizing: border-box;
      padding: 17px 20px;
      font-size: 14px;
      color: #303133;
      text-align: left;
      background-color: #fafafa;
    }
  }

  .table-panel-rework {
    grid-template-columns: 4fr 2fr 2fr 2fr 2fr 2fr 3fr 2fr;

    .stream-state {
      .el-tag:nth-last-of-type(1) {
        margin-left: 0;
      }

      .el-tag:nth-last-of-type(2) {
        margin-right: 12px;
      }
    }
  }

  .table-panel-concent {
    margin-bottom: 20px;
    border-bottom: 1px solid #fafafa;

    & > div {
      background-color: #fff;
    }
  }

  .panel-require {
    padding: 10px 0;
  }

  .panel-remark-concent {
    padding: 10px 0;
    background-color: #fff;
  }
}
</style>
