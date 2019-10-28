<template>
  <div class="order-detail">
    <div class="header">
      <h3>修图详情</h3>
    </div>
    <div class="order module-panel">
      <div class="panel-title">照片信息</div>
      <order-info :is-work-board-info="isWorkBoardInfo" :order-data="orderData" />
    </div>
    <!-- 照片列表 -->
    <div v-for="(photoItem, photoIndex) in photos" :key="photoIndex" class="photo-list module-panel">
      <div class="panel-title">订单照片{{ photoIndex + 1 }}</div>
      <photo-detail :photo-item="photoItem" />
    </div>
    <!-- 看片师评价 -->
    <div v-if="storeEvaluateStream" class="check-evaluate module-panel">
      <div class="panel-title">审核评价</div>
      <div class="tabel-panel">
        <div class="panel-content">
          <el-rate
            v-model="storeEvaluateStream.store_evaluate_star"
            disabled
            :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
          />
        </div>
        <div class="require-box">
          <span class="require-title">修图评语：</span>
          <span class="require-content">{{ storeEvaluateStream.store_evaluate_reason }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import OrderInfo from './components/OrderInfo'
import PhotoDetail from './components/PhotoDetail'
import * as AdminManage from '@/api/adminManage'
import * as Commonality from '@/api/commonality.js'

export default {
  name: 'OrderDetail',
  components: { OrderInfo, PhotoDetail },
  data () {
    return {
      streamId: '', // 流水id
      orderId: '', // 订单id
      orderData: {}, // 订单信息
      photos: [],
      storeEvaluateStream: null // 看片评分
    }
  },
  computed: {
    // 是否是工作看板详情
    isWorkBoardInfo () {
      return Boolean(this.$route.query.workBoardStreamNum)
    }
  },
  created () {
    // 有订单号id
    if (this.$route.query.orderId) {
      this.orderId = this.$route.query.orderId
    }
    // 有流水号id
    if (this.$route.query.streamId) {
      this.streamId = this.$route.query.streamId
      this.getStreamInfo()
    }
    // 工作看板id
    if (this.$route.query.workBoardStreamNum) {
      this.streamId = this.$route.query.workBoardStreamNum
      this.getWorkBoardStreamInfo()
    }
  },
  methods: {
    /**
     * @description 获取订单详情
     */
    async getStreamInfo () {
      const req = { streamId: this.streamId }
      this.$store.dispatch('setting/showLoading')
      const data = await Commonality.getStreamInfo(req)
      this.orderData = data.orderData
      this.photos = data.photos
      this.storeEvaluateStream = data.storeEvaluateStream
      this.$store.dispatch('setting/hiddenLoading')
    },
    /**
     * @description 获取工作看板数据
     */
    async getWorkBoardStreamInfo () {
      const req = { streamNum: this.streamId }
      this.$store.dispatch('setting/showLoading')
      const data = await AdminManage.getStreamInfo(req)
      this.orderData = data.orderData
      this.photos = data.photos
      this.$store.dispatch('setting/hiddenLoading')
    }
  }
}
</script>

<style lang="less" scoped>
 @import "~@/styles/variables.less";

.order-detail {
  .panel-title {
    margin-bottom: 16px;
  }

  .order {
    margin-bottom: 24px;
  }

  .photo-list {
    margin-bottom: 24px;
  }

  .check-evaluate {
    .tabel-panel {
      background-color: #FAFAFA;
      border-radius: 4px;
      padding: 26px 20px;

      .panel-content {
        text-align: left;
        padding-bottom: 24px;
        border-bottom: 1px solid #EBEEF5;
      }

      .require-box {
        margin-top: 16px;
        font-size:14px;
        font-weight:400;
        color:#303133;
        line-height:22px;
        display: flex;

        .require-title {
          width: 70px;
          display: inline-block;
        }

        .require-content {
          width: 500px;
          display: inline-block;
        }
      }
    }
  }
}
</style>

<style lang="less">
.el-rate {
  height: auto;
}

.el-rate__icon {
  font-size:30px;
}
</style>
