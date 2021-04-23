<template>
  <div class="order-info">
    <div class="table-panel panel-order">
      <div class="content-title">流水号</div>
      <div class="content-title">摄影产品</div>
      <div class="content-title">摄影师</div>
      <div class="content-title">修图师</div>
    </div>
    <div class="table-panel panel-order">
      <div class="panel-content">{{ orderData.streamNum }}</div>
      <div class="panel-content">
        <div class="standard-box">
          {{ orderData.productName }}
          <div class="standard-icon">
            <div :class="`iconmap-standard-${orderData.retouchStandard}`" />
          </div>
        </div>
      </div>
      <div class="panel-content">{{ orderData.photographerName }}</div>
      <div class="panel-content">{{ orderData.retoucher }}</div>
    </div>
    <!--修图要求 -->
    <div class="panel-require">
      <div class="panel-title">修图要求</div>
      <div class="panel-main">
        <div v-if="orderData.requireLabel" class="panel-require-concent">
          <el-tag size="medium">眼睛增大幅度：{{ orderData.requireLabel.eye | toLabelName }}</el-tag>
          <el-tag size="medium">瘦脸幅度：{{ orderData.requireLabel.face | toLabelName }}</el-tag>
          <el-tag v-if="orderData.requireLabel.pimples" size="medium">祛痣</el-tag>
        </div>
        <div class="panel-main-content">
          <span class="title">修图备注：</span>
          <span class="content">{{ orderData.retouchRemark }}</span>
        </div>
        <div class="panel-main-content" v-if="orderData.retouchNotice">
          <span class="title">修图注意事项：</span>
          <span class="content retouch-notice">{{ orderData.retouchNotice }}</span>
        </div>
        <div class="panel-main-content" v-if="orderData.retouchBackImg">
          <span class="title">修图底色：</span>
          <span class="content require-impression-color">
            <span class="impression-name">{{ orderData.retouchBackImgName }}</span>
            <ReferencePhoto :streamNum="orderData.streamNum" downMsg="下载底色图" :src="orderData.retouchBackImg" />
          </span>
        </div>

        <div v-if="orderData.backgroundColor" class="panel-main-content">
          <span class="title">背景图要求：</span>
          <div class="content require-background-color">
            <img :src="orderData.backgroundColor" alt="">
            <el-button type="text" @click="downPhoto(orderData.backgroundColor)">下载背景图</el-button>
          </div>
        </div>
        <div v-if="orderData.referencePhoto" class="panel-main-content">
          <span class="title">参考图：</span>
          <div class="content require-reference-photo">
            <el-image
              class="reference-img"
              fit="contain"
              :src="orderData.referencePhoto"
              :preview-src-list="[orderData.referencePhoto]"
            >
            </el-image>
            <el-button type="text" @click="downPhoto(orderData.referencePhoto)">下载参考图</el-button>
          </div>
        </div>
      </div>
    </div>
    <div class="panel-require" v-if="appealInfo.appealStatusDesc">
      <div class="panel-title">申诉信息</div>
      <div class="panel-main">
        <div class="panel-main-content">
          <span class="title">申诉类型：</span>
          <span class="content">{{ appealInfo.appealTypeName }}</span>
          <span
            v-if="appealInfo.appealType === APPEAL_TYPE.TIMEOUT"
            class="content"
          >沙漏时长：{{ orderData.hourGlassAllTime }}
          </span>
          <span
            v-if="appealInfo.appealType === APPEAL_TYPE.TIMEOUT"
            class="content"
          >修图时长：{{ orderData.retouchAllTime }}
          </span>
        </div>
        <div
          class="panel-main-content"
          v-if="appealInfo.appealType === APPEAL_TYPE.TIMEOUT && checkType"
        >
          <span class="title">申诉理由：</span>
          <span class="content">{{ appealInfo.desc }}</span>
        </div>
        <div class="panel-main-content">
          <span class="title">处理状态：</span>
          <span class="content">{{ appealInfo.appealStatusDesc }}</span>
          <span>初审人：</span>
          <span class="content">{{ appealInfo.firstInfo.staffName }}</span>
          <span>初审时间：</span>
          <span class="content">{{ appealInfo.firstInfo.time }}</span>
          <span>复审人：</span>
          <span class="content">{{ appealInfo.secondInfo.staffName }}</span>
          <span>复审时间：</span>
          <span class="content">{{ appealInfo.secondInfo.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DownIpc from '@electronMain/ipc/DownIpc'
import { APPEAL_TYPE } from '@/utils/enumerate'
import ReferencePhoto from '@/components/ReferencePhoto'

export default {
  name: 'orderData',
  components: { ReferencePhoto },
  props: {
    orderData: { type: Object, required: true },
    appealInfo: { type: Object, required: true }
  },
  data () {
    return {
      APPEAL_TYPE,
      checkType: this.$route.query.type // 审核类型
    }
  },
  methods: {
    downPhoto (url) {
      const savePath = `/${this.orderData.streamNum}`
      const data = {
        url,
        path: savePath
      }
      this.$newMessage.success('已添加一张照片到下载')
      DownIpc.addDownloadFile(data)
    }
  }
}
</script>

<style lang="less" scoped>

.order-info {
  .table-panel {
    display: grid;
    justify-items: center;
    width: 100%;
  }

  .panel-order {
    grid-template-columns: repeat(4, 1fr);
  }

  .panel-grade {
    display: flex;
  }

  .content-title {
    width: 100%;
    padding: 17px 20px;
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
    color: #303133;
    text-align: left;
    background-color: #fafafa;
  }

  .panel-content {
    width: 100%;
    padding: 21px 20px;
    font-size: 14px;
    font-weight: 400;
    line-height: 14px;
    color: #606266;
    text-align: left;
    border-bottom: 1px solid #f2f6fc;
  }

  .panel-require {
    margin-top: 24px;

    .panel-main {
      padding: 20px;
      margin-top: 12px;
      background-color: #fafafa;
      border-radius: 4px;

      .panel-require-concent {
        padding-bottom: 20px;
        border-bottom: 1px solid @borderColor;

        .el-tag {
          margin-right: 12px;
        }
      }

      .panel-main-content {
        display: flex;
        padding: 20px 0;
        font-size: 14px;
        font-weight: 400;
        line-height: 22px;
        color: #303133;
        border-bottom: 1px solid @borderColor;

        .title {
          width: 90px;
        }

        .content {
          margin-right: 40px;
        }

        .require-background-color {
          display: flex;
          align-items: center;

          img {
            width: 50px;
            height: 50px;
            margin-right: 10px;
          }
        }

        .require-impression-color {
          display: flex;

          .impression-name {
            margin-right: 12px;
          }
        }

        .require-reference-photo {
          display: flex;
          align-items: flex-end;

          .reference-img {
            width: 200px;
            height: 200px;
          }
        }

        .retouch-notice {
          word-break: break-all;
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
