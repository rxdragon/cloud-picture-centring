<template>
  <div class="grade-box">
    <div class="photo-panel">
      <div class="panel-title">
        <span>照片评分</span>
        <span class="score-box">总分：{{ photoInfoData.score }}</span>
      </div>
      <photo-list need-preload :photo-data="photoInfoData.photoInfo.photoVersion" />
    </div>
    <div class="info-grid">
      <!-- 问题标签 -->
      <div class="panel-info" v-if="photoInfoData.issueLabel.length">
        <div class="panel-title">问题标签</div>
        <div class="panel-content">
          <div class="issue-class-box panel-row" v-for="issueClass in photoInfoData.issueLabel" :key="issueClass.id">
            <div class="label-title">{{ issueClass.name }}</div>
            <div class="label-box">
              <el-tag size="medium" v-for="issueItem in issueClass.child" :key="issueItem.id">{{ issueItem.name }}</el-tag>
            </div>
          </div>
        </div>
      </div>
      <!-- 订单信息 -->
      <div class="panel-info">
        <div class="panel-title">订单信息</div>
        <div class="panel-content">
          <div class="base-info panel-row">
            <span class="order-info"><span class="order-info-title">流水号：</span>{{ photoInfoData.streamInfo.streamNum }}</span>
            <span class="order-info"><span class="order-info-title">产品名称：</span>{{ photoInfoData.productInfo.productName }}</span>
          </div>
          <div class="base-info panel-row">
            <span class="order-info">
              <span class="order-info-title">修图标准：</span>{{ photoInfoData.productInfo.type | toRetouchClass }}
              <div class="standard-icon">
                <div :class="`iconmap-standard-${photoInfoData.productInfo.type}`" />
              </div>
            </span>
            <span class="order-info"><span class="order-info-title">修图师：</span>{{ photoInfoData.streamInfo.retoucher }}</span>
            <span class="order-info"><span class="order-info-title">修图组长：</span>{{ photoInfoData.streamInfo.retoucherLeader }}</span>
          </div>
          <div class="retouch-require panel-row">
            <el-tag size="medium">眼睛增大幅度：{{ photoInfoData.streamInfo.requireLabel.eye | toLabelName }}</el-tag>
            <el-tag size="medium">瘦脸幅度：{{ photoInfoData.streamInfo.requireLabel.face | toLabelName }}</el-tag>
            <el-tag v-if="photoInfoData.streamInfo.requireLabel.pimples" size="medium">祛痣</el-tag>
          </div>
          <div class="retouch-remark panel-row">
            <div class="remark-title">修图备注：</div>
            <div class="remark-content">{{ photoInfoData.streamInfo.retouchRemark }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PhotoList from '@/components/PhotoList'

export default {
  name: 'GradeBox',
  components: { PhotoList },
  props: {
    isGrade: { type: Boolean }, // 是否是打分使用
    photoInfo: { type: Object, default: () => ({}) } // 照片数据
  },
  data () {
    return {
      routeName: this.$route.name // 路由名字
    }
  },
  computed: {
    photoInfoData () {
      return this.photoInfo
    }
  }
}
</script>

<style lang="less">
@import "~@/styles/variables.less";

.grade-box {
  .photo-panel {
    margin-bottom: 32px;
    border-bottom: 1px solid @borderColor;

    .panel-title {
      margin-bottom: 20px;

      .score-box {
        float: right;
      }
    }

    .photo-box {
      margin-bottom: 20px;
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 32px 48px;
  }

  .panel-info {
    .panel-title {
      margin-bottom: 20px;
    }

    .panel-content {
      height: calc(~'100% - 44px');
      padding: 0 20px;
      background-color: #fafafa;
      border-radius: 4px;

      .issue-class-box {
        display: flex;

        .label-title {
          flex-shrink: 0;
          margin: 0 20px 0 0;
          font-size: 14px;
          font-weight: 600;
          line-height: 28px;
          color: #303133;
        }

        .label-box {
          margin-bottom: -10px;

          .el-tag {
            margin: 0 10px 10px 0;
            font-size: 12px;
            font-weight: 400;
            color: #fff;
            background: #000;
            border-radius: 4px;
            opacity: 0.6;
          }
        }
      }

      .base-info {
        .order-info {
          display: inline-block;
          margin-right: 32px;
        }
      }

      .panel-row {
        padding: 20px 0;
        font-size: 14px;
        line-height: 22px;
        color: #303133;
        border-bottom: 1px solid @borderColor;

        .order-info {
          .order-info-title {
            display: inline-block;
          }
        }
      }

      .panel-row:nth-last-child(1) {
        border: none;
      }

      .retouch-require {
        border-bottom: 1px solid @borderColor;

        & > span {
          margin-right: 12px;
        }
      }

      .retouch-remark {
        display: flex;
        align-items: flex-start;

        .remark-title {
          width: 70px;
        }

        .remark-content {
          width: calc(~'100% - 70px');
          white-space: pre-line;

          .content-el-tag {
            margin-right: 10px;
          }
        }
      }
    }
  }

  .audit-info {
    .audit-content {
      .radio-box {
        display: flex;
        align-items: center;

        .el-radio {
          margin-right: 20px;
        }

        .sameOpinion-item {
          margin-right: 40px;
        }
      }

      .correct-remark {
        padding-top: 20px;
      }
    }

    .issue-label {
      padding: 10px;

      .issue-content {
        .el-select {
          width: 100%;
        }
      }

      .issue-remark {
        margin-top: 10px;
      }
    }

    .audit-content-finish {
      padding: 20px;

      .audit-opinion {
        .audit-tag {
          margin-right: 21px;
        }
      }

      .audit-remark {
        margin-top: 10px;
        font-size: 14px;
        line-height: 22px;
        color: #303133;
      }
    }
  }

  .flakiness-info {
    .issue-label {
      padding-top: 20px;

      .issue-content {
        .issue-label-box {
          margin-bottom: 10px;
        }

        .el-select {
          width: 100%;
        }
      }
    }

    .panel-content {
      padding: 20px;
    }

    .flakiness-remark {
      margin-top: 10px;
      font-size: 14px;
      font-weight: 400;
      line-height: 22px;
      color: #303133;
    }
  }

  .button-box {
    margin-top: 20px;
    text-align: left;
  }
}
</style>
