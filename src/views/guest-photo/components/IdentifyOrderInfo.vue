<template>
  <div class="identify-order-info">
    <div class="order-info">
      <div class="info-title">订单信息</div>
      <el-row class="info-main" :gutter="20" type="flex">
        <el-col :span="8">
          <div class="info-label">订单号：</div>
          <div class="info-value">{{ orderInfo.externalNum }}</div>
        </el-col>
        <el-col :span="8">
          <div class="info-label">流水单号：</div>
          <div class="info-value">{{ streamInfo.streamNum }}</div>
        </el-col>
        <el-col :span="8">
          <div class="info-label">拍摄门店：</div>
          <div class="info-value">{{ orderInfo.storeName }}</div>
        </el-col>
      </el-row>
    </div>
    <div class="photo-info">
      <div class="info-title">照片信息</div>
      <el-row class="info-main" :gutter="20" type="flex">
        <el-col :span="8">
          <div class="info-label">摄影师：</div>
          <div class="info-value">{{ orderInfo.photographerStaffName }}</div>
        </el-col>
        <el-col :span="8">
          <div class="info-label">修图师：</div>
          <div class="info-value">{{ `${streamInfo.retoucher}(${streamInfo.retoucherJobNum})` }}</div>
        </el-col>
        <el-col :span="8">
          <div class="info-label">修图主管：</div>
          <div class="info-value">{{ streamInfo.retoucherLeader }}</div>
        </el-col>
        <el-col :span="8">
          <div class="info-label">是否有退单记录：</div>
          <div class="info-value">{{ photoInfo.isStoreReturn ? '是' : '否' }}</div>
        </el-col>
        <el-col :span="8">
          <div class="info-label">退回次数：</div>
          <div class="info-value">{{ streamInfo.storeReturnNum }}</div>
        </el-col>
        <el-col class="tags-box" :span="24">
          <div class="info-label">退回标记：</div>
          <div class="info-value info-tags">
            <div class="tags-class">
              <div class="tags-items">
                <el-tag
                  size="mini"
                  class="tag-item"
                  v-for="(tagItem, tagIndex) in photoInfo.storePartReworkReasonTags"
                  :key="tagIndex"
                >
                  {{ tagItem }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-col>
        <el-col class="tags-box" :span="24">
          <div class="info-label">退回原因：</div>
          <div class="info-value">{{ photoInfo.storeReworkReason }}</div>
        </el-col>
        <el-col class="tags-box" :span="24">
          <div class="info-label">退回备注：</div>
          <div class="info-value">{{ photoInfo.storeReworkNote }}</div>
        </el-col>
        <el-col class="tags-box" :span="8">
          <div class="info-label">技术评分：</div>
          <div class="info-value">{{ photoInfo.checkPoolScore }}</div>
        </el-col>
        <el-col class="tags-box" :span="8">
          <div class="info-label">评分人：</div>
          <div class="info-value">{{ photoInfo.checkEvaluator }}</div>
        </el-col>
        <el-col class="tags-box" :span="24">
          <div class="info-label">问题标记：</div>
          <div class="info-value info-tags" v-if="photoInfo.checkPoolTags.length">
            <div class="tags-class" v-for="tagClass in photoInfo.checkPoolTags" :key="tagClass.id">
              <span class="tags-name">{{ tagClass.name }}：</span>
              <div class="tags-items">
                <el-tag v-for="tagItem in tagClass.child" :key="tagItem.id" size="mini">
                  {{ tagItem.name }}
                </el-tag>
              </div>
            </div>
          </div>
          <div class="info-value" v-else>-</div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IdentifyOrderInfo',
  props: {
    orderData: { type: Object, required: true }
  },
  computed: {
    streamInfo () {
      return this.orderData.streamInfo
    },
    orderInfo () {
      return this.orderData.orderInfo
    },
    photoInfo () {
      return this.orderData.photoInfo
    }
  }
}
</script>

<style lang="less">
.identify-order-info {
  .order-info {
    margin-bottom: 20px;
  }

  .info-title {
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 500;
  }

  .info-main {
    flex-wrap: wrap;
    margin-bottom: -12px;

    .el-col {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    }

    .tags-box {
      align-items: flex-start;
    }

    .info-label {
      flex-shrink: 0;
      font-size: 14px;
      font-weight: 400;
      color: #3e3e3e;
    }

    .info-value {
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #6e6e6e;
    }

    .info-tags {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: -12px;

      .tags-class {
        display: flex;

        .tags-name {
          flex-shrink: 0;
        }

        .tags-items {
          display: flex;
          flex-wrap: wrap;
          margin-bottom: -12px;

          .el-tag {
            margin: 0 12px 12px 0;
          }
        }
      }
    }
  }
}
</style>
