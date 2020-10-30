<template>
  <div class="order-detail page-class">
    <div class="header">
      <h3>修图详情</h3>
      <el-button
        type="primary"
        v-if="showAppealAccess && needAppeal && !orderData.currentStreamAppeal"
        @click="showAppeal"
      >
        我要申诉
      </el-button>
      <el-button
        type="info"
        disabled
        v-if="showAppealAccess && needAppeal && orderData.currentStreamAppeal"
      >
        申诉中
      </el-button>
    </div>
    <div class="order module-panel">
      <div class="panel-title">照片信息</div>
      <order-info :is-work-board-info="isWorkBoardInfo" :order-data="orderData" />
    </div>

    <!-- 圣诞拼接信息 -->
    <div class="christmas-photos module-panel" v-if="christmasSplicePhotos.length">
      <div class="photo-panel-title panel-title">
        <span>圣诞拼接照</span>
        <div class="button-box">
          <el-button type="primary" size="small" @click="oneRenamePhoto">
            一键下载
          </el-button>
        </div>
      </div>
      <div class="photo-panel">
        <div
          v-for="(photoItem, photoIndex) in christmasSplicePhotos"
          :key="photoIndex"
          class="photo-box"
        >
          <photo-box
            downing
            photo-name
            preload-photo
            show-joint-label
            :stream-num="orderData.streamNum"
            :rename="photoItem.position"
            :src="photoItem.path"
          />
        </div>
      </div>
    </div>

    <!-- 照片列表 -->
    <div v-for="(photoItem, photoIndex) in photos" :key="photoIndex" class="photo-list module-panel">
      <div class="panel-title">照片{{ photoIndex + 1 }}</div>
      <photo-detail :photo-item="photoItem" />
    </div>
    <el-dialog
      class="appeal-dialog"
      title="我要申诉"
      width="910px"
      :visible.sync="dialogAppealVisible"
    >
      <div class="appeal-item">
        <span class="item-name">申诉类型</span>
        <el-select v-model="appealType" placeholder="请选择">
          <el-option
            v-for="item in appealOptions"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
      <p class="appeal-photo-title">选择问题照片</p>
      <div class="appeal-photos">
        <rework-photo v-for="(photo) in appealPhotos" :photo-item="photo" :key="photo.id"></rework-photo>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="info" @click="cancelAppeal">取消</el-button>
        <el-button type="primary" @click="submitAppeal">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import PhotoDetail from './components/PhotoDetail'
import OrderInfo from './components/OrderInfo'
import ReworkPhoto from './components/ReworkPhoto'
import store from '@/store' // vuex
import DownIpc from '@electronMain/ipc/DownIpc'
import PhotoBox from '@/components/PhotoBox'

import { mapGetters } from 'vuex'

import * as AdminManage from '@/api/adminManage'
import * as Commonality from '@/api/commonality.js'
import * as Appeal from '@/api/appeal.js'
import * as PhotoTool from '@/utils/photoTool'


export default {
  name: 'OrderDetail',
  components: { PhotoDetail, OrderInfo, ReworkPhoto, PhotoBox },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      streamId: '', // 流水id
      orderData: {}, // 订单信息
      christmasSplicePhotos: [], // 圣诞拼接照信息
      photos: [],
      dialogAppealVisible: false,
      appealType: 'rework', // 申诉信息
      appealOptions: [
        {
          value: 'rework',
          name: '门店退单问题'
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['showAppealAccess']),
    retoucherIsSelf () {
      return store.getters.userInfo.id === this.orderData.retoucherJobNum
    },
    // 是否是工作看板详情
    isWorkBoardInfo () {
      return Boolean(this.$route.query.workBoardStreamNum)
    },
    appealPhotos () {
      return this.photos.filter(item => item.qualityType === 'quality' && !item.isRollBack)
    },
    needAppeal () {
      return this.photos.some(item => item.qualityType === 'quality' && !item.isRollBack) && this.retoucherIsSelf
    }
  },
  created () {
    this.init()
  },
  methods: {
    /**
     * @description 初始化
     */
    init () {
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
    /**
     * @description 获取订单详情
     */
    async getStreamInfo () {
      try {
        const req = { streamId: this.streamId }
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await Commonality.getStreamInfo(req)
        this.christmasSplicePhotos = data.christmasSplicePhotos || []
        this.orderData = data.orderData
        this.photos = data.photos
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
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
        this.christmasSplicePhotos = data.christmasSplicePhotos || []
        this.orderData = data.orderData
        this.photos = data.photos
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 显示申诉弹窗
     */
    showAppeal () {
      this.dialogAppealVisible = true
    },
    /**
     * @description 提交申诉
     */
    async submitAppeal () {
      let checkFail = false
      const checkArr = []
      const req = {
        streamId: this.streamId,
        photoAppeals: [],
        type: this.appealType
      }
      this.photos.forEach(photoItem => {
        if (photoItem.reworkChecked) {
          checkArr.push(photoItem.id)
          if (!photoItem.appealReason) {
            checkFail = true
            return
          }
          req.photoAppeals.push({
            photo_id: photoItem.id,
            desc: photoItem.appealReason
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
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        await Appeal.addAppeal(req)
        this.$newMessage.success('申诉成功')
        this.dialogAppealVisible = false
        this.init()
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 取消申诉
     */
    cancelAppeal () {
      this.dialogAppealVisible = false
    },
    /**
     * @description 一键下载重命名成片
     */
    oneRenamePhoto () {
      const savePath = `/${this.orderData.streamNum}`
      const photoArr = this.christmasSplicePhotos.map(photoItem => {
        const ext = PhotoTool.getFilePostfix(photoItem.path)
        const rename = `${photoItem.position}${ext}`
        return {
          url: photoItem.path,
          path: savePath,
          rename
        }
      })
      DownIpc.addDownloadFiles(photoArr)
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

  .christmas-photos {
    margin: 20px 0;

    .photo-panel-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;

      .button-box {
        display: flex;
        align-items: center;

        .el-button {
          margin-left: 24px;
        }
      }
    }

    .photo-panel {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      margin-right: -24px;

      .photo-box {
        width: 253px;
        margin-right: 24px;
        margin-bottom: 24px;
        cursor: pointer;
        transition: all 0.3s;

        .handle-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .progress {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 241px;
          height: 241px;
        }

        .error-photo {
          color: @red;
        }
      }
    }
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

  .appeal-dialog {
    .dialog-footer {
      display: flex;
      justify-content: center;
    }

    .appeal-item {
      margin-bottom: 20px;

      .item-name {
        margin-right: 10px;
        font-size: 16px;
        font-weight: 500;
      }
    }

    .appeal-photos {
      height: 300px;
      overflow-y: auto;
    }

    .appeal-photo-title {
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 500;
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
