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
          <div class="stream-state" :class="{'wrap': isRework}">
            <div class="stream-num">{{ orderData.streamNum }}</div>
            <el-tag v-if="orderData.isCheckReturn" size="mini" type="danger">审核退回</el-tag>
            <el-tag v-if="orderData.isStoreReturn" size="mini" type="danger">门店退回</el-tag>
          </div>
        </div>
        <div class="institution">{{ orderData.photographerName }}</div>
        <div class="institution">{{ orderData.photographer }}</div>
        <div class="type">{{ orderData.type | toRetouchClass }}</div>
        <div v-if="isRework" class="retoucher">{{ orderData.retoucherName }}</div>
        <div class="product">{{ orderData.productName }}</div>
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
        <div v-if="orderData.reviewerNote" class="require-remark">
          <span>审核备注：</span>
          <div class="remark-content">{{ orderData.reviewerNote }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
          waitTime: '暂无信息'
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
    }
  },
  mounted () {},
  methods: {}
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";

.order-info {
  .table-info {
    border-radius: 4px;
    overflow: hidden;
    margin-top: 10px;
  }

  .panel-require-concent {
    margin-top: 12px;
    padding: 20px;
    background-color: #fafafa;
    border-radius: 4px;
    overflow: hidden;
    padding-bottom: 0;

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
        width: 70px;
        color: #303133;
        font-size: 14px;
      }

      .remark-content {
        color: #303133;
        font-size: 14px;
        width: 632px;
        white-space: pre-wrap;
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
      background-color: #fafafa;
      font-size: 14px;
      color: #303133;
      text-align: left;
      padding: 17px 20px;
      box-sizing: border-box;
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
    border-bottom: 1px solid #fafafa;
    margin-bottom: 40px;

    & > div {
      background-color: #fff;
    }
  }

  .panel-require {
    padding: 10px 0;
  }

  .panel-remark-concent {
    background-color: #fff;
    padding: 10px 0;
  }
}
</style>
