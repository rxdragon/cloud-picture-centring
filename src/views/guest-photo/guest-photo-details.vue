<template>
  <div class="guest-photo-details">
    <div class="header">
      <h3>客片详情</h3>
    </div>
    <div class="panel-box module-panel">
      <div class="panel-title">照片标记信息</div>
      <div class="tabel-box">
        <div class="tabel-title">
          <span>产品名称</span>
          <span>修图师</span>
          <span>修图组长</span>
          <span />
        </div>
        <div class="tabel-value">
          <span>{{ productName }}</span>
          <span>
            {{ retoucher }}
            <el-tag>{{ retouchGroup }}</el-tag>
          </span>
          <span>{{ retoucherLeader }}</span>
          <span />
        </div>
      </div>
      <div class="evaluate-info">
        <div class="panel-title">评价信息</div>
        <div v-if="attitudeType" class="panel-content">
          <i v-if="attitudeType === 'good'" :class="`${attitudeType}-photo`" class="iconfont icon-like-press" />
          <i v-if="attitudeType === 'bad'" :class="`${attitudeType}-photo`" class="iconfont icon-unlike-press" />
          评价人：{{ evaluateName }}
        </div>
      </div>
    </div>
    <div class="panel-box module-panel">
      <div class="panel-title">照片信息</div>
      <photo-list :photo-data="photoVersion" />
    </div>
  </div>
</template>

<script>
import PhotoList from '@/components/PhotoList'

import * as GuestPhoto from '@/api/guestPhoto.js'

export default {
  name: 'GuestPhotoDetails',
  components: { PhotoList },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      uuid: '',
      productName: '', // 产品名称
      retoucher: '', // 修图师
      retoucherLeader: '', // 修图师组长
      retouchGroup: '', // 修图组
      photoVersion: [], // 照片版本
      evaluateName: '-', // 评价姓名
      attitudeType: ''// 赞or踩
    }
  },
  created () {
    const { uuid } = this.$route.query
    this.uuid = uuid
    this.getAttitudePhotoInfo()
  },
  methods: {
    /**
     * @description 获取赞或踩客片详情
     */
    async getAttitudePhotoInfo () {
      try {
        const reqData = { photoUuid: this.uuid }
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await GuestPhoto.getAttitudePhotoInfo(reqData)
        this.productName = data.productName
        this.retoucher = data.retoucher
        this.retoucherLeader = data.retoucherLeader
        this.retouchGroup = data.retouchGroup
        this.photoVersion = data.photoVersion
        this.attitudeType = data.attitude.attitude
        this.evaluateName = data.attitude.name
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        throw new Error(error)
      }
    }
  }
}
</script>

<style lang="less">
.guest-photo-details {
  .module-panel {
    margin-bottom: 24px;

    .panel-title {
      margin-bottom: 16px;
    }
  }

  .panel-box {
    .tabel-box {
      .tabel-title,
      .tabel-value {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
      }

      .tabel-title {
        border-bottom: 1px solid #EBEEF5;

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

      .tabel-value {
        &>span {
          font-size:14px;
          font-weight:400;
          color:#606266;
          line-height:14px;
          padding: 20px 21px;
          border-bottom: 1px solid #F2F6FC;
        }
      }
    }

    .evaluate-info {
      margin-top: 20px;
      font-size:14px;
      font-weight:500;
      color:#303133;
      line-height:22px;
      text-align: left;

      .good-photo {
        color: #FF8F00;
      }

      .bad-photo {
        color: #909399;
      }

      .iconfont {
        font-size: 23px;
        margin-right: 12px;
      }

      .panel-content {
        display: flex;
        align-items: center;
        font-size:14px;
        font-family:PingFangSC-Regular,PingFangSC;
        font-weight:400;
        color:#303133;
        line-height:22px;
      }
    }
  }
}
</style>
