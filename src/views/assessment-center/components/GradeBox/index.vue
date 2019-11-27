<template>
  <div class="grade-box">
    <div class="photo-panel">
      <div class="panel-title">订单照片</div>
      <photo-list :photo-data="photoInfoData.photoVersion" />
    </div>
    <!-- 订单信息 -->
    <div class="panel-info">
      <div class="panel-title">订单信息</div>
      <div class="panel-content">
        <div class="base-info panel-row">
          <template v-if="isGrade">
            <span>修图标准：{{ photoInfoData.retouchStandard | toRetouchClass }}</span>
            <span>产品名称：{{ photoInfoData.productName }}</span>
          </template>
          <template v-else>
            <span>修图标准：{{ photoInfoData.retouchStandard | toRetouchClass }}</span>
            <span>拍摄产品：{{ photoInfoData.productName }}</span>
            <span>流水号：{{ photoInfoData.streamNum }}</span>
            <span>修图师：{{ photoInfoData.retouchName }}</span>
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
        <div v-if="photoInfoData.reworkReason" class="retouch-remark panel-row">
          <div class="remark-title">重修原因：</div>
          <div class="remark-content">{{ photoInfoData.reworkReason }}</div>
        </div>
        <div v-if="photoInfoData.reviewerNote" class="retouch-remark panel-row">
          <div class="remark-title">审核备注：</div>
          <div class="remark-content">{{ photoInfoData.reviewerNote }}</div>
        </div>
        <div v-if="photoInfoData.isPlant" class="plant-info panel-row">
          <el-tag size="medium" type="success">审核种草</el-tag>
          <div class="retouch-remark">
            <div class="remark-title">种草原因：</div>
            <div class="remark-content">{{ photoInfoData.grassReason }}</div>
          </div>
        </div>
        <div v-if="photoInfoData.isPull" class="weed-info panel-row">
          <el-tag size="medium" type="danger">审核拔草</el-tag>
          <div class="retouch-remark">
            <div class="remark-title">拔草原因：</div>
            <div class="remark-content">{{ photoInfoData.grassReason }}</div>
          </div>
        </div>
        <div v-if="!photoInfoData.isPlant && !photoInfoData.isPull && !isGreen" class="plant-info panel-row">
          <el-tag size="medium" type="success">不种不拔</el-tag>
        </div>
        <div v-if="isGreen" class="panel-row">
          <div class="green">绿色通道</div>
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
              :rows="2"
              placeholder="请输入纠偏备注，非必填"
            />
          </div>
        </div>
      </div>
      <div v-else class="audit-content-finish panel-content">
        <div class="audit-opinion">
          <el-tag v-if="photoInfoData.commitInfo.audit_correction === 'same'" size="medium">意见相同</el-tag>
          <el-tag v-if="photoInfoData.commitInfo.audit_correction === 'different'" size="medium">意见不同</el-tag>
          <el-tag v-if="photoInfoData.commitInfo.audit_glass === 'none'" size="medium">不种不拔</el-tag>
          <el-tag v-if="photoInfoData.commitInfo.audit_glass === 'plant'" size="medium" type="success">种草</el-tag>
          <el-tag v-if="photoInfoData.commitInfo.audit_glass === 'pull'" size="medium" type="danger">拔草</el-tag>
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
                :rows="3"
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
        </div>
        <div class="flakiness-remark">
          <div v-if="photoInfoData.commitInfo.film_tag" class="retouch-remark">
            <div class="remark-title">问题标签：</div>
            <div class="remark-content">
              <el-tag
                v-for="(tags, tagsIndex) in photoInfoData.commitInfo.film_tag"
                :key="tagsIndex"
                size="medium"
                type="danger"
                class="content-el-tag"
              >
                {{ tags }}
              </el-tag>
            </div>
          </div>
          <div class="retouch-remark">
            <div class="remark-title">备注：</div>
            <div class="remark-content">{{ photoInfoData.commitInfo.evaluation_note || '暂无备注' }}</div>
          </div>
        </div>
      </div>
    </div>
    <!-- 提交按钮 -->
    <div v-if="isGrade" class="button-box">
      <el-button type="primary" @click="commitHistory">提交评价</el-button>
    </div>
  </div>
</template>

<script>
import PhotoList from '@/components/PhotoList'
import IssueLabelBox from '@SelectBox/IssueLabelBox'

import * as AssessmentCenter from '@/api/assessmentCenter'
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
    /**
     * @description 获取评价参数
     */
    getCommitparams () {
      if (!this.weedOpinion && !this.sameOpinion && !this.isGreen) {
        this.$newMessage.warning('请完成纠偏选项')
        return false
      }
      if (!this.weedOpinion && this.sameOpinion === 'different') {
        this.$newMessage.warning('请完成纠偏选项')
        return false
      }
      if (!this.flakinessEvaluate) {
        this.$newMessage.warning('请完成成片评价')
        return false
      }
      const req = {
        uuid: this.photoInfoData._id,
        photoId: this.photoInfoData.photoData.id,
        filmEvaluation: this.flakinessEvaluate
      }

      if (this.sameOpinion) {
        req.auditCorrection = this.sameOpinion
        const glassArray = ['plant', 'pull', 'none']
        req.auditGlass = this.sameOpinion === 'same' ? glassArray[this.checkPlantState - 1] : this.weedOpinion
      }
      if (this.correctRemark) { req.auditNote = this.correctRemark }
      if (this.issueRemark) { req.evaluationNote = this.issueRemark }
      if (!this.photoInfoData.isReturn && !this.photoInfoData.isGreen) {
        req.evaluationNote = this.correctRemark || this.issueRemark
      }
      if (this.issueLabel.length && this.flakinessEvaluate === 'pull') { req.filmTag = this.issueLabel }
      return req
    },
    /**
     * @description 提交评价
     */
    commitHistory () {
      const req = this.getCommitparams()
      if (!req) return
      this.$store.dispatch('setting/showLoading', this.routeName)
      AssessmentCenter.commitHistory(req)
        .then(msg => {
          this.$emit('finsihed', true)
        })
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
    }

    .photo-box {
      margin-bottom: 20px;
    }
  }

  .panel-info {
    margin-bottom: 32px;

    .panel-title {
      margin-bottom: 20px;
    }

    .panel-content {
      background-color: #fafafa;
      border-radius: 4px;
      padding: 0 20px;

      .panel-row {
        padding: 20px 0;
        font-size: 14px;
        color: #303133;
        line-height: 22px;
        border-bottom: 1px solid @borderColor;

        & > span {
          margin-right: 48px;
        }
      }

      .panel-row:nth-last-child(1) {
        border: none;
        margin-bottom: -10px;
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
        align-items: center;

        .remark-title {
          width: 70px;
        }

        .remark-content {
          width: 632px;
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

    .plant-info {
      & > .el-tag {
        font-weight: bold;
        display: inline-block;
        margin-bottom: 10px;
      }
    }

    .weed-info {
      & > .el-tag {
        font-weight: bold;
        display: inline-block;
        margin-bottom: 10px;
      }
    }
  }

  .audit-info {
    .audit-content {
      .radio-box {
        padding: 10px;
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
        padding: 10px;
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

      .audit-opinion.el-tag {
        margin-right: 21px;
      }

      .audit-remark {
        font-size: 14px;
        color: #303133;
        line-height: 22px;
        margin-top: 10px;
      }
    }
  }

  .flakiness-info {
    .flakiness-radio-box {
      padding: 10px;
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

    .panel-content {
      padding: 20px;
    }

    .flakiness-finish {
      .el-tag {
        margin-right: 21px;
      }
    }

    .flakiness-remark {
      margin-top: 8px;
      font-size: 14px;
      font-weight: 400;
      color: #303133;
      line-height: 22px;

      .retouch-remark {
        margin-bottom: 8px;
      }
    }
  }

  .button-box {
    text-align: left;
  }
}
</style>
