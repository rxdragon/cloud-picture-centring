<template>
  <div class="guest-info">
    <div class="header" :class="headerClass">
      <h3>客片详情</h3>
      <div class="button-box">
        <el-button v-if="!gradeInfo.attitude" type="primary" @click="onSubmitAttitude">照片标记提交</el-button>
      </div>
    </div>
    <el-scrollbar ref="scrollContainer" :vertical="false" class="scroll-container" @wheel.native="handleScroll">
      <!-- 订单信息 -->
      <div class="panel-box module-panel">
        <div class="order-info">
          <div class="panel-title">订单信息</div>
          <div class="panel-content">
            <div class="order-title content-title">
              <span>订单号</span>
              <span>流水号</span>
              <span>产品名称</span>
              <span>顾客姓名</span>
            </div>
            <div class="order-value content-value">
              <span>{{ orderNum }}</span>
              <span>{{ streamNum }}</span>
              <span>{{ productName }}</span>
              <span>没数据</span>
            </div>
            <div class="panel-title require-box">备注信息</div>
            <div class="panel-main">
              <div class="panel-main-content">
                <span class="title">订单备注：</span>
                <span class="content">{{ orderMark }}</span>
              </div>
              <div class="panel-main-content">
                <span class="title">化妆备注：</span>
                <span class="content">{{ dresserMark }}</span>
              </div>
              <div class="panel-main-content">
                <span class="title">摄影备注：</span>
                <span class="content">{{ photographerRemark }}</span>
              </div>
              <div class="panel-main-content">
                <span class="title">修图备注：</span>
                <span class="content">{{ retouchMark }}</span>
              </div>
            </div>
          </div>
        </div>
        <!-- 工作人员 -->
        <div class="work-staff">
          <div class="panel-title">工作人员</div>
          <div class="panel-content">
            <div class="work-title content-title">
              <span>门店</span>
              <span>摄影师</span>
              <span>化妆师</span>
            </div>
            <div class="work-value content-value">
              <span>{{ workerInfo.storeName }}</span>
              <span>{{ workerInfo.photographer }}</span>
              <span>没数据</span>
            </div>
          </div>
          <div class="panel-content">
            <div class="work-staff-title content-title">
              <span>修图师</span>
              <span>修图组</span>
              <span>审核人</span>
              <span>看片师</span>
              <span>看片评价修图师</span>
            </div>
            <div class="work-staff-value content-value">
              <span>{{ workerInfo.retoucher || '-' }}</span>
              <span>{{ workerInfo.retouchGroup || '-' }}</span>
              <span>{{ workerInfo.reviewer }}</span>
              <span>{{ workerInfo.watcherName }}</span>
              <span class="check-evaluate">
                <span><i v-for="i in workerInfo.storeEvaluateStar" :key="i" style="color: #ff9900" class="el-icon-star-on" /></span>
                <span>评语：{{ workerInfo.storeEvaluateReason }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <!-- 照片信息 -->
      <div class="panel-box module-panel">
        <div class="panel-title">照片信息</div>
        <photo-list need-grade :grade-info="gradeInfo" :photo-data="photoVersion" @gradeChange="onGradeChange" />
      </div>
    </el-scrollbar>
  </div>
</template>

<script>
import PhotoList from '@/components/PhotoList'

import * as GuestPhoto from '@/api/guestPhoto'
export default {
  name: 'GuestInfo',
  components: { PhotoList },
  data () {
    return {
      uuid: '',
      orderNum: '-',
      streamNum: '-',
      productName: '-',
      labelTag: {},
      photographerRemark: '', // 摄影备注
      retouchMark: '', // 修图备注
      orderMark: '', // 订单备注
      dresserMark: '', // 化妆备注
      workerInfo: {}, // 工作信息
      photoVersion: [], // 照片版本
      gradeInfo: {}, // 打分数据
      attitudeValue: '',
      headerClass: '' // 导航栏样式
    }
  },
  computed: {
    scrollWrapper () {
      return this.$refs.scrollContainer.$refs.wrap
    }
  },
  activated () {
    const { uuid } = this.$route.query
    this.uuid = uuid
    this.getPhotoInfo()
  },
  methods: {
    /**
     * @description 处理滚动
     */
    handleScroll (e) {
      this.headerClass = this.scrollWrapper.scrollTop !== 0 ? 'header-fixed' : ''
    },
    /**
     * @description 获取客片池详情
     */
    async getPhotoInfo () {
      try {
        const reqData = { photoUuid: this.uuid }
        this.$store.dispatch('setting/showLoading', this.$route.name)
        const data = await GuestPhoto.getPhotoInfo(reqData)
        this.orderNum = data.orderNum
        this.streamNum = data.streamNum
        this.productName = data.productName
        this.labelTag = data.labelTag
        this.photographerRemark = data.photographerRemark
        this.retouchMark = data.retouchMark
        this.orderMark = data.orderMark
        this.dresserMark = data.dresserMark
        this.workerInfo = data.workerInfo
        this.photoVersion = data.photoVersion
        this.gradeInfo = { ...data.attitude }
        this.$store.dispatch('setting/hiddenLoading', this.$route.name)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.$route.name)
      }
    },
    /**
     * @description 监听点赞
     */
    onGradeChange (gradeType) {
      this.attitudeValue = gradeType
    },
    /**
     * @description 提交【踩/赞】
     */
    async onSubmitAttitude () {
      try {
        const findPassPhoto = this.photoVersion.find(photoItem => photoItem.version === 'complete_photo')
        if (!findPassPhoto) {
          this.$newMessage.warning('未获取到审核通过照片的照片')
          return false
        }
        if (!this.attitudeValue) {
          this.$newMessage.warning('未进行点赞操作')
          return false
        }
        const reqData = {
          photoId: findPassPhoto.photo_id,
          attitude: this.attitudeValue
        }
        await GuestPhoto.submitAttitude(reqData)
        this.$newMessage.success('提交成功')
        this.getPhotoInfo()
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.$route.name)
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";
.guest-info {
  .header {
    line-height: 40px;
  }

  .header-fixed {
    box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.08);
    width: calc(~'100% + 56px');
    margin-left: -28px;
    padding: 0 28px 24px;
    position: relative;
    z-index: 100;
  }

  .scroll-container {
    height: @orderScrollContainerHeight;

    .el-scrollbar__wrap{
      overflow-x:hidden;
    }
  }

  .module-panel {
    margin-bottom: 24px;

    .panel-title {
      margin-bottom: 16px;
    }
  }

  .panel-box {
    .panel-content {
      .content-title {
        &>span {
          font-size:14px;
          font-weight:500;
          color:#303133;
          line-height:22px;
          text-align: left;
          padding: 17px 20px;
          background-color: #FAFAFA;
        }
      }

      .content-value {
        &>span {
          font-size:14px;
          font-weight:400;
          color:#606266;
          line-height:14px;
          padding: 20px 21px;
          border-bottom: 1px solid #F2F6FC;
        }
      }

      .require-box {
        margin-top: 20px;
      }

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
          border-top: 1px solid #EBEEF5;
          display: flex;

          &:nth-of-type(1) {
            border: none;
          }

          .title {
            width: 70px;
          }

          .content {
            width: 632px;
          }
        }
      }

      .order-title,
      .order-value{
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
      }

      .mark-value {
        grid-template-columns: 1fr;
      }

      .work-title,
      .work-value {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
      }

      .work-staff-title,
      .work-staff-value {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 2fr;
        align-items: center;

        .check-evaluate {
          display: flex;
          flex-direction: column;
          padding: 13px 21px;
        }
      }
    }
  }

  .order-info {
    margin-bottom: 32px;
  }

  .button-box {
    text-align: center;
  }
}
</style>
