<template>
  <div class="order-info">
    <div class="table-panel panel-order" :class="showWorkInfo && 'panel-order-retoucher'">
      <div class="content-title">流水号</div>
      <div class="content-title">所属机构</div>
      <div class="content-title">拍摄产品</div>
      <div class="content-title">摄影师</div>
      <div class="content-title" v-if="showWorkInfo">门店</div>
      <div class="content-title">照片数量</div>
    </div>
    <div class="table-panel panel-order">
      <div class="panel-content">{{ orderInfo.streamNum }}</div>
      <div class="panel-content">{{ orderInfo.photographerOrg }}</div>
      <div class="panel-content">{{ orderInfo.productName }}</div>
      <div class="panel-content">{{ orderInfo.photographerName }}</div>
      <div class="panel-content" v-if="showWorkInfo">{{ orderInfo.storeName }}</div>
      <div class="panel-content">{{ orderInfo.photoNum }}</div>
    </div>
    <template v-if="!isWorkBoardInfo">
      <div class="table-panel panel-grade">
        <div class="content-title">修图总时长</div>
        <div class="content-title">超时</div>
        <div class="content-title">重修次数</div>
        <div class="content-title">门店退回次数</div>
        <div class="content-title">审核用时</div>
        <div class="content-title">门店评价</div>
        <div class="content-title">顾客满意度</div>
      </div>
      <div class="table-panel panel-grade">
        <div class="panel-content">{{ orderInfo.retouchAllTime }}</div>
        <div class="panel-content">{{ orderInfo.overTime }}</div>
        <div class="panel-content">{{ orderInfo.reworkNum }}</div>
        <div class="panel-content">{{ orderInfo.storeReworkNum }}</div>
        <div class="panel-content">{{ orderInfo.reviewTime }}</div>
        <div class="panel-content">
          <show-evaluate :evaluate="orderInfo.store_evaluate" />
        </div>
        <div class="panel-content">{{ orderInfo.retoucherNpsAvg }}</div>
      </div>
    </template>
    <template v-else>
      <div class="table-panel panel-grade">
        <div class="content-title">修图标准</div>
        <div class="content-title">当前状态</div>
        <div class="content-title">修图师</div>
        <div v-if="orderInfo.reviewerName" class="content-title">审核人</div>
      </div>
      <div class="table-panel panel-grade">
        <div class="panel-content">
          <div class="standard-box">
            {{ orderInfo.retouchStandard | toRetouchClass }}
            <div class="standard-icon">
              <div :class="`iconmap-standard-${orderInfo.retouchStandard}`" />
            </div>
          </div>
        </div>
        <div class="panel-content">{{ orderInfo.streamState | toStreamState }}</div>
        <div class="panel-content">{{ orderInfo.retoucherName }}</div>
        <div v-if="orderInfo.reviewerName" class="panel-content">{{ orderInfo.reviewerName }}</div>
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
        <div class="panel-main-content" v-if="orderInfo.retouchNotice">
          <span class="title">修图注意事项：</span>
          <span class="content">{{ orderInfo.retouchNotice }}</span>
        </div>
        <div class="panel-main-content" v-if="orderInfo.retouchBackImg">
          <span class="title">修图底色：</span>
          <span class="content require-impression-color">
            <span class="impression-name">{{ orderInfo.retouchBackImgName }}</span>
            <ReferencePhoto :streamNum="orderInfo.streamNum" downMsg="下载底色图" :src="orderInfo.retouchBackImg" />
          </span>
        </div>
        <!-- 背景图要求 -->
        <div v-if="orderInfo.backgroundColor" class="panel-main-content">
          <span class="title">背景图要求：</span>
          <div class="content require-background-color">
            <ReferencePhoto :streamNum="orderInfo.streamNum" downMsg="下载背景图" :src="orderInfo.backgroundColor" />
          </div>
        </div>
        <!-- 参考图 -->
        <div v-if="orderInfo.referencePhoto" class="panel-main-content">
          <span class="title">参考图：</span>
          <div class="content require-reference-photo">
            <ReferencePhoto :streamNum="orderInfo.streamNum" :src="orderInfo.referencePhoto" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DownIpc from '@electronMain/ipc/DownIpc'
import ShowEvaluate from '@/components/ShowEvaluate'
import ReferencePhoto from '@/components/ReferencePhoto'

import { mapGetters } from 'vuex'

export default {
  name: 'OrderInfo',
  components: { ShowEvaluate, ReferencePhoto },
  props: {
    orderData: { type: Object, required: true },
    isWorkBoardInfo: { type: Boolean }
  },
  computed: {
    ...mapGetters(['showWorkInfo']),
    orderInfo () {
      return this.orderData
    }
  },
  methods: {
    downPhoto (url) {
      const savePath = `/${this.orderInfo.streamNum}`
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
  }

  .panel-order {
    grid-template-columns: repeat(6, 1fr);
  }

  .panel-order-retoucher {
    grid-template-columns: repeat(6, 1fr);
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
          width: 120px;
        }

        .content {
          width: 632px;
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
      }

      .panel-last-content {
        padding-bottom: 0;
        border: none;
      }
    }
  }
}
</style>
