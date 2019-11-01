<template>
  <div class="order-info">
    <div class="table-panel panel-order">
      <div class="content-title">流水号</div>
      <div class="content-title">所属机构</div>
      <div class="content-title">拍摄产品</div>
      <div class="content-title">照片数量</div>
    </div>
    <div class="table-panel panel-order">
      <div class="panel-content">{{ orderInfo.streamNum }}</div>
      <div class="panel-content">{{ orderInfo.photographerOrg }}</div>
      <div class="panel-content">{{ orderInfo.productName }}</div>
      <div class="panel-content">{{ orderInfo.photoNum }}</div>
    </div>
    <template v-if="!isWorkBoardInfo">
      <div class="table-panel panel-grade">
        <div class="content-title">重修次数</div>
        <div class="content-title">审核种草</div>
        <div class="content-title">审核拔草</div>
        <div class="content-title">抽查种草</div>
        <div class="content-title">抽查拔草</div>
        <div class="content-title">修图用时</div>
        <div class="content-title">超时</div>
        <div class="content-title">审核用时</div>
      </div>
      <div class="table-panel panel-grade">
        <div class="panel-content">{{ orderInfo.reworkNum }}</div>
        <div class="panel-content">{{ orderInfo.plantNum }}</div>
        <div class="panel-content">{{ orderInfo.pullNum }}</div>
        <div class="panel-content">{{ orderInfo.checkPlantNum }}</div>
        <div class="panel-content">{{ orderInfo.checkPullNum }}</div>
        <div class="panel-content">{{ orderInfo.retouchAllTime }}</div>
        <div class="panel-content">{{ orderInfo.overTime }}</div>
        <div class="panel-content">{{ orderInfo.reviewTime }}</div>
      </div>
    </template>
    <template v-else>
      <div class="table-panel panel-grade">
        <div class="content-title">修图类型</div>
        <div class="content-title">摄影师</div>
        <div class="content-title">当前状态</div>
        <div class="content-title">修图师</div>
      </div>
      <div class="table-panel panel-grade">
        <div class="panel-content">{{ orderInfo.retouchStandard | toRetouchClass }}</div>
        <div class="panel-content">{{ orderInfo.photographer }}</div>
        <div class="panel-content">{{ orderInfo.streamState | toStreamState }}</div>
        <div class="panel-content">{{ orderInfo.retoucherName }}</div>
      </div>
    </template>
    <!--修图要求 -->
    <div class="panel-require">
      <div class="panel-title">修图要求</div>
      <div class="panel-main">
        <div v-if="orderInfo.requireLabel" class="panel-require-concent">
          <el-tag size="medium">眼睛增大幅度：{{ orderInfo.requireLabel.eye | toLabelName }}</el-tag>
          <el-tag size="medium">瘦脸幅度：{{ orderInfo.requireLabel.face | toLabelName }}</el-tag>
          <el-tag v-if="orderInfo.requireLabel.pimples" size="medium">祛痣</el-tag>
        </div>
        <div class="panel-main-content">
          <span class="title">修图备注：</span>
          <span class="content">{{ orderInfo.retouchRemark }}</span>
        </div>
        <div class="panel-main-content panel-last-content">
          <span class="title">审核备注：</span>
          <span class="content">{{ orderInfo.reviewerNote }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderInfo',
  props: {
    orderData: { type: Object, required: true },
    isWorkBoardInfo: { type: Boolean }
  },
  computed: {
    orderInfo () {
      return this.orderData
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";

.order-info {
  .table-panel {
    display: grid;
    justify-items: center;
  }

  .panel-order {
    grid-template-columns: repeat(4, 1fr);
  }

  .panel-grade {
    display: flex;
  }

  .content-title {
    padding: 17px 20px;
    width: 100%;
    background-color: #FAFAFA;
    font-size:14px;
    font-weight:500;
    color:#303133;
    line-height:22px;
    text-align: left;
  }

  .panel-content {
    padding: 21px 20px;
    width: 100%;
    font-size:14px;
    font-weight:400;
    color:#606266;
    line-height:14px;
    text-align: left;
    border-bottom: 1px solid #F2F6FC;
    margin-bottom: 24px;
  }

  .panel-require {
    .panel-main {
      background-color: #FAFAFA;
      border-radius: 4px;
      padding: 20px;
      margin-top: 12px;

      .panel-require-concent {
        padding-bottom: 20px;
        border-bottom: 1px solid #EBEEF5;

        .el-tag {
          margin-right: 12px;
        }
      }

      .panel-main-content {
        font-size:14px;
        font-weight:400;
        color:#303133;
        line-height:22px;
        padding: 20px 0;
        border-bottom: 1px solid #EBEEF5;
        display: flex;

        .title {
          width: 70px;
        }

        .content {
          width: 632px;
        }
      }

      .panel-last-content {
        padding-bottom: 0;
        border: none;
      }
    }
  }
}
</style>
