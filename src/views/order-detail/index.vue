<template>
  <div class="order-detail page-class">
    <div class="header">
      <h3>修图详情</h3>
    </div>
    <div class="order module-panel">
      <div class="panel-title">照片信息</div>
      <order-info :is-work-board-info="isWorkBoardInfo" :order-data="orderData" />
    </div>
    <!-- 照片列表 -->
    <div v-for="(photoItem, photoIndex) in photos" :key="photoIndex" class="photo-list module-panel">
      <div class="panel-title">照片{{ photoIndex + 1 }}</div>
      <photo-detail :photo-item="photoItem" />
    </div>
    <!-- 看片师评价 -->
    <div v-if="storeEvaluateStream" class="check-evaluate module-panel">
      <div class="panel-title">门店评价</div>
      <div class="tabel-panel">
        <div class="tabel-title">顾客满意度评价</div>
        <div class="tabel-title">看片师评价</div>
        <div class="tabel-title">看片师评语</div>
      </div>
      <div class="tabel-panel content-box">
        <div class="tabel-content">{{ retoucherNpsAvg }}</div>
        <div class="tabel-content">
          <el-rate
            v-model="storeEvaluateStream.store_evaluate_star"
            disabled
            :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
          />
        </div>
        <div class="tabel-content">{{ storeEvaluateStream.store_evaluate_reason || '暂无评语' }}</div>
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
      routeName: this.$route.name, // 路由名字
      streamId: '', // 流水id
      orderId: '', // 订单id
      orderData: {}, // 订单信息
      photos: [],
      storeEvaluateStream: null, // 看片评分
      retoucherNpsAvg: '-分'
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
      try {
        const req = { streamId: this.streamId }
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await Commonality.getStreamInfo(req)
        this.orderData = data.orderData
        this.photos = data.photos
        this.storeEvaluateStream = data.storeEvaluateStream
        this.retoucherNpsAvg = data.retoucherNpsAvg
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    },
    /**
     * @description 获取工作看板数据
     */
    async getWorkBoardStreamInfo () {
      try {
        const req = { streamNum: this.streamId }
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await AdminManage.getStreamInfo(req)
        this.orderData = data.orderData
        this.photos = data.photos
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";

.order-detail {
  .panel-title {
    margin-bottom: 20px;
  }

  .order {
    margin-bottom: 24px;
  }

  .photo-list {
    margin-bottom: 24px;
  }

  .check-evaluate {
    padding: 26px 20px;

    .tabel-panel {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      align-items: flex-start;
      background-color: #fafafa;
      border-radius: 4px;

      .tabel-title {
        padding: 17px 20px;
        font-size: 14px;
        font-weight: 500;
        line-height: 22px;
        color: #303133;
        text-align: left;
      }

      .tabel-content {
        padding: 21px 20px;
        font-size: 14px;
        font-weight: 400;
        line-height: 24px;
        color: #606266;
        text-align: left;
        background-color: #fff;
      }

      .panel-content {
        text-align: center;
        border-bottom: 1px solid @borderColor;
      }
    }

    .content-box {
      border-bottom: 1px solid #f2f6fc;
    }
  }
}
</style>

<style lang="less">
.el-rate {
  height: auto;
}

.el-rate__icon {
  font-size: 24px;
}
</style>
