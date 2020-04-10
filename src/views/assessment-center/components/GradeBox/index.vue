<template>
  <div class="grade-box">
    <div class="photo-panel">
      <div class="panel-title">订单照片</div>
      <photo-list :need-preload="isGrade" :photo-data="photoInfoData.photoVersion" />
    </div>
    <div class="info-grid">
      <!-- 订单信息 -->
      <div class="panel-info">
        <div class="panel-title">订单信息</div>
        <div class="panel-content">
          <div class="base-info panel-row">
            <span class="order-info">
              <span class="order-info-title">修图标准：</span>{{ photoInfoData.retouchStandard | toRetouchClass }}
              <div class="standard-icon">
                <div :class="`iconmap-standard-${photoInfoData.retouchStandard}`" />
              </div>
            </span>
            <span class="order-info"><span class="order-info-title">产品名称：</span>{{ photoInfoData.productName }}</span>
            <template v-if="!isGrade">
              <span class="order-info"><span class="order-info-title">修图师：</span>{{ photoInfoData.retouchName }}</span>
              <span class="order-info"><span class="order-info-title">修图组长：</span>{{ photoInfoData.retouchLeaderName }}</span>
              <span class="order-info"><span class="order-info-title">流水号：</span>{{ photoInfoData.streamNum }}</span>
            </template>
          </div>
          <div class="retouch-require panel-row">
            <el-tag size="medium">眼睛增大幅度：{{ photoInfoData.retouchRequire.eye | toLabelName }}</el-tag>
            <el-tag size="medium">瘦脸幅度：{{ photoInfoData.retouchRequire.face | toLabelName }}</el-tag>
            <el-tag v-if="photoInfoData.retouchRequire.pimples" size="medium">祛痣</el-tag>
          </div>
          <div class="retouch-remark panel-row">
            <div class="remark-title">修图备注：</div>
            <div class="remark-content">{{ photoInfoData.retouchNote }}</div>
          </div>
        </div>
      </div>
      <!-- 审核信息 -->
      <div class="panel-info check-info">
        <div class="panel-title">审核信息</div>
        <div class="panel-content">
          <div class="retouch-remark panel-row">
            <div class="remark-title">重修原因：</div>
            <div class="remark-content">{{ photoInfoData.reworkReason || '暂无重修原因' }}</div>
          </div>
          <div class="retouch-remark panel-row">
            <div class="remark-title">审核备注：</div>
            <div class="remark-content">{{ photoInfoData.reviewerNote || '暂无审核备注' }}</div>
          </div>
          <div v-if="photoInfoData.isPlant" class="plant-info panel-row">
            <el-tag size="medium" type="success">审核种草</el-tag>
            <div class="retouch-remark">
              <div class="remark-title">原因：</div>
              <div class="remark-content">{{ photoInfoData.grassReason || '暂无种草原因' }}</div>
            </div>
          </div>
          <div v-if="photoInfoData.isPull" class="weed-info panel-row">
            <el-tag size="medium" type="danger">审核拔草</el-tag>
            <div class="retouch-remark">
              <div class="remark-title">原因：</div>
              <div class="remark-content">{{ photoInfoData.grassReason || '暂无拔草原因' }}</div>
            </div>
          </div>
          <div v-if="!photoInfoData.isPlant && !photoInfoData.isPull && !isGreen" class="plant-info panel-row">
            <el-tag size="medium" type="success">不种不拔</el-tag>
          </div>
          <div v-if="isGreen" class="panel-row">
            <el-tag size="medium" effect="dark" type="success">绿色通道</el-tag>
          </div>
        </div>
      </div>
      <!-- 审核纠偏 -->
      <div v-if="!isGreen" class="panel-info audit-info">
        <div class="panel-title">审核纠偏</div>
        <div v-if="isGrade" class="audit-content">
          <div class="radio-box">
            <div class="sameOpinion-box">
              <el-radio v-model="sameOpinion" class="sameOpinion-item" label="same">意见相同</el-radio>
              <el-radio v-model="sameOpinion" label="different">意见不同</el-radio>
            </div>
            <div v-if="sameOpinion === 'different'" class="different-opinion">
              <el-radio v-if="checkPlantState !== 1" v-model="weedOpinion" label="plant">种草</el-radio>
              <el-radio v-if="checkPlantState !== 2" v-model="weedOpinion" label="pull">拔草</el-radio>
              <el-radio v-if="checkPlantState !== 3" v-model="weedOpinion" label="none">不种不拔</el-radio>
            </div>
          </div>
          <!-- 标签 -->
          <div v-if="flakinessEvaluate === 'pull' && !photoInfoData.isReturn" class="issue-label">
            <div class="issue-content">
              <issue-label-box v-model="issueLabel" multiple placeholder="请选择问题标签（非必选）" />
            </div>
          </div>
          <div class="correct-remark">
            <div class="correct-content">
              <el-input
                v-model="correctRemark"
                type="textarea"
                :rows="5"
                placeholder="请输入纠偏备注，非必填"
              />
            </div>
          </div>
        </div>
        <div v-else class="audit-content-finish panel-content">
          <div class="audit-opinion">
            <el-tag v-if="photoInfoData.commitInfo.audit_correction === 'same'" class="audit-tag" size="medium">意见相同</el-tag>
            <el-tag v-if="photoInfoData.commitInfo.audit_correction === 'different'" class="audit-tag" size="medium">意见不同</el-tag>
            <el-tag v-if="photoInfoData.commitInfo.audit_glass === 'none'" class="audit-tag" size="medium">不种不拔</el-tag>
            <el-tag v-if="photoInfoData.commitInfo.audit_glass === 'plant'" class="audit-tag" size="medium" type="success">种草</el-tag>
            <el-tag v-if="photoInfoData.commitInfo.audit_glass === 'pull'" class="audit-tag" size="medium" type="danger">拔草</el-tag>
          </div>
          <div class="audit-remark retouch-remark">
            <div class="remark-title">纠偏备注：</div>
            <div class="remark-content">{{ photoInfoData.commitInfo.audit_note || '暂无备注' }}</div>
          </div>
        </div>
      </div>
      <!-- 成片评价 -->
      <div class="panel-info flakiness-info">
        <div v-if="!isGrade || photoInfoData.isReturn || isGreen" class="panel-title">成片评价</div>
        <template v-if="isGrade && (photoInfoData.isReturn || isGreen)">
          <div class="flakiness-radio-box">
            <el-radio v-model="flakinessEvaluate" label="plant">种草</el-radio>
            <el-radio v-model="flakinessEvaluate" label="pull">拔草</el-radio>
            <el-radio v-model="flakinessEvaluate" label="none">通过</el-radio>
          </div>
          <div class="issue-label">
            <div class="issue-content">
              <!-- 标签 -->
              <issue-label-box v-if="flakinessEvaluate === 'pull'" v-model="issueLabel" multiple placeholder="请选择问题标签（非必选）" />
              <!-- 备注 -->
              <div class="issue-remark">
                <el-input
                  v-model="issueRemark"
                  type="textarea"
                  :rows="5"
                  placeholder="请输入纠偏备注，非必填"
                />
              </div>
            </div>
          </div>
        </template>
        <div v-else-if="!isGrade" class="panel-content">
          <div class="flakiness-finish">
            <el-tag v-if="photoInfoData.commitInfo.film_evaluation === 'plant'" size="medium" type="success">种草</el-tag>
            <el-tag v-if="photoInfoData.commitInfo.film_evaluation === 'pull'" size="medium" type="danger">拔草</el-tag>
            <el-tag v-if="photoInfoData.commitInfo.film_evaluation === 'none'" size="medium">不种不拔</el-tag>
          </div>
          <div class="flakiness-remark">
            <div v-if="photoInfoData.commitInfo.film_tag" class="retouch-remark">
              <div class="remark-title">问题标签：</div>
              <div class="remark-content">
                <el-tag
                  v-for="(tags, tagsIndex) in photoInfoData.commitInfo.film_tag"
                  :key="tagsIndex"
                  size="mini"
                  type="danger"
                  class="content-el-tag"
                >
                  {{ tags }}
                </el-tag>
              </div>
            </div>
            <div class="retouch-remark">
              <div class="remark-title">成片备注：</div>
              <div class="remark-content">{{ photoInfoData.commitInfo.evaluation_note || '暂无备注' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PhotoList from '@/components/PhotoList'
import IssueLabelBox from '@SelectBox/IssueLabelBox'

export default {
  name: 'GradeBox',
  components: { PhotoList, IssueLabelBox },
  props: {
    isGrade: { type: Boolean }, // 是否是打分使用
    photoInfo: {
      type: Object,
      default: () => {
        return {}
      }
    } // 照片数据
  },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      sameOpinion: '', // 意见是否相同 same 相同 different 不同
      weedOpinion: '', // 意见不同评价
      correctRemark: '', // 纠偏评价
      flakinessEvaluate: '', // 成片评价
      issueLabel: [], // 问题标签
      issueRemark: '' // 成片备注
    }
  },
  computed: {
    // 审核种草状态 1 种草 2 拔草 3 不种不拔
    checkPlantState () {
      if (this.photoInfoData.isPlant) return 1
      if (this.photoInfoData.isPull) return 2
      return 3
    },
    photoInfoData () {
      return this.photoInfo
    },
    // 是否是绿色通道
    isGreen () {
      return this.photoInfoData.isGreen
    }
  },
  watch: {
    sameOpinion (value) {
      if (!this.photoInfoData.isReturn && value === 'same') {
        const glassArray = ['plant', 'pull', 'none']
        this.flakinessEvaluate = glassArray[this.checkPlantState - 1]
      }
      if (!this.photoInfoData.isReturn && value === 'different') {
        this.flakinessEvaluate = this.weedOpinion
      }
    },
    weedOpinion (value) {
      if (!this.photoInfoData.isReturn && this.sameOpinion === 'different') {
        this.flakinessEvaluate = value
      }
    }
  },
  methods: {
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
    }

    .photo-box {
      margin-bottom: 20px;
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
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

      .base-info {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
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
            width: 70px;
          }
        }
      }

      .panel-row:nth-last-child(1) {
        border: none;
      }

      .retouch-require {
        border-top: 1px solid @borderColor;
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

  .check-info {
    color: #9c9c9c;

    .title {
      color: #333;
    }

    .plant-info,
    .weed-info {
      display: flex;

      .el-tag {
        display: inline-block;
        margin-right: 12px;
        font-weight: bold;
      }

      .retouch-remark {
        line-height: 28px;

        .remark-title {
          width: 42px;
        }

        .remark-content {
          width: calc(~'100% - 42px');
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

    .flakiness-finish {
      .el-tag {
        margin-right: 21px;
      }
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
