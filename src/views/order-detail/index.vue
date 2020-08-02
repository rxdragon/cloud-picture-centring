<template>
  <div class="order-detail page-class">
    <div class="header">
      <h3>修图详情</h3>
      <!-- <el-button type="primary" v-if="qualityNum" @click="showComplain">我要申诉</el-button> -->
      <!-- todo qualityNum暂时没有,有了以后再修改 -->
      <el-button type="primary" @click="showComplain">我要申诉</el-button>
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
    <el-dialog
      class="complain-dialog"
      title="我要申诉"
      width="700px"
      :visible.sync="dialogComplainVisible"
    >
      <div class="complain-item">
        <span class="item-name">申诉类型</span>
        <el-select v-model="complainType" placeholder="请选择">
          <el-option
            v-for="item in complainOptions"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
      <p class="complain-photo-title">选择问题照片</p>
      <div class="complain-photos">
        <rework-photo v-for="(photo) in photos" :photo-item="photo" :key="photo.id"></rework-photo>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="info" @click="cancelComplain">取消</el-button>
        <el-button type="primary" @click="submitComplain">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import PhotoDetail from './components/PhotoDetail'
import OrderInfo from './components/OrderInfo'
import ReworkPhoto from './components/ReworkPhoto'
import * as AdminManage from '@/api/adminManage'
import * as Commonality from '@/api/commonality.js'

export default {
  name: 'OrderDetail',
  components: { PhotoDetail, OrderInfo, ReworkPhoto },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      streamId: '', // 流水id
      orderData: {}, // 订单信息
      photos: [],
      qualityNum: this.$route.query.qualityNum, // 质量问题数量
      dialogComplainVisible: false,
      complainType: 'rework', // 申诉信息
      complainOptions: [
        {
          value: 'rework',
          name: '门店退单问题'
        }
      ]
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
    },
    /**
     * @description 显示申诉弹窗
     */
    showComplain () {
      this.dialogComplainVisible = true
    },
    /**
     * @description 提交申诉
     */
    submitComplain () {
      let checkFail = false
      let checkArr = []
      let req = {
        streamId: this.streamId,
        photoAppeals: [],
        type: this.complainType
      }
      this.photos.forEach(photoItem => {
        if (photoItem.reworkChecked) {
          checkArr.push(photoItem.id)
          if (!photoItem.complainReason) {
            checkFail = true
            return
          }
          req.photoAppeals.push({
            photo_id: photoItem.id,
            desc: photoItem.complainReason
          })
        }
      })
      if (!checkArr.length) {
        this.$newMessage.warning('还没有勾选任何照片')
        return
      }
      if (checkFail) {
        this.$newMessage.warning('因未勾选问题照片or没有填写问题描述则需要进行提示：请填写完整申诉问题!')
        return
      }
      this.dialogComplainVisible = false
    },
    /**
     * @description 取消申诉
     */
    cancelComplain () {
      this.dialogComplainVisible = false
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

  .complain-dialog {
    .dialog-footer {
      display: flex;
      justify-content: center;
    }

    .complain-item {
      margin-bottom: 20px;

      .item-name {
        margin-right: 10px;
      }
    }

    .complain-photos {
      height: 300px;
      overflow-y: auto;
    }

    .complain-photo-title {
      margin-bottom: 10px;
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
