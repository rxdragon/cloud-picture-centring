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
  </div>
</template>

<script>
import PhotoDetail from './components/PhotoDetail'
import OrderInfo from './components/OrderInfo'
import * as AdminManage from '@/api/adminManage'
import * as Commonality from '@/api/commonality.js'

export default {
  name: 'OrderDetail',
  components: { PhotoDetail, OrderInfo },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      streamId: '', // 流水id
      orderData: {}, // 订单信息
      photos: []
    }
  },
  computed: {
    // 是否是工作看板详情
    isWorkBoardInfo () {
      return Boolean(this.$route.query.workBoardStreamNum)
    }
  },
  created () {
    // 有流水号id
    if (this.$route.query.streamId) {
      this.streamId = this.$route.query.streamId
      if (this.$route.query.searchOther) {
        this.getModifyRetouchQuotaInfo()
      } else {
        this.getStreamInfo()
      }
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
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    },
    /**
     * @description 获取修改他人记录订单详情
     */
    async getModifyRetouchQuotaInfo () {
      try {
        const req = { streamId: this.streamId }
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await Commonality.getModifyRetouchQuotaInfo(req)
        this.orderData = data.orderData
        this.photos = data.photos
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
