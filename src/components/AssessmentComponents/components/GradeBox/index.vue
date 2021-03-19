<template>
  <div class="grade-box">
    <!-- 列表 -->
    <div class="grid-list">
      <!-- 照片信息 -->
      <div class="photo-panel">
        <div class="panel-title">
          <span>照片评分</span>
          <el-tag
            v-if="photoInfoData.isReevaluatePhoto"
            class="grade-again-tag"
            type="danger"
            size="medium"
          >
            已重评
          </el-tag>
        </div>
        <photo-list
          class="grade-photo-list"
          need-preload
          showOrderInfo
          :photo-data="photoVersionList"
          :order-info="photoInfoData"
        />
      </div>
      <!-- 订单信息 -->
      <div class="order-panel panel-info">
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
            <el-tag
              v-if="photoInfoData.streamInfo.requireLabel.pimples"
              size="medium"
            >
              祛痣
            </el-tag>
          </div>
          <div class="retouch-remark panel-row">
            <div class="remark-title">修图备注：</div>
            <div class="remark-content">{{ photoInfoData.streamInfo.retouchRemark }}</div>
          </div>
          <div class="reference-photo panel-row" v-if="photoInfoData.streamInfo.referencePhoto">
            <span class="order-info-title">参考图：</span>
            <el-image
              fit="contain"
              :src="photoInfoData.streamInfo.referencePhoto"
              :preview-src-list="[photoInfoData.streamInfo.referencePhoto]"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 评价信息 -->
    <div class="panel-info">
      <div class="panel-title">
        <span>评价信息</span>
        <div class="score-box">
          <el-button
            v-if="showSpotRecheck"
            size="mini"
            type="primary"
            @click="afreshGrade"
          >
            重新评分
          </el-button>
        </div>
      </div>
      <div class="panel-content">
        <div class="grade-score panel-row">
          <span class="order-info"><span class="order-info-title">总分：</span>{{ photoInfoData.score }}</span>
          <span class="order-info"><span class="order-info-title">评分人：</span>{{ photoInfoData.takeInfo.gradeStaff }}</span>
          <span class="order-info" v-if="photoInfoData.isReevaluatePhoto"><span class="order-info-title">复评人：</span>{{ photoInfoData.takeInfo.reevaluate }}</span>
        </div>
        <div v-if="photoInfoData.labelTag.length" class="issue-class-box panel-row">
          <el-tag
            :class="['type-tag', item.type]"
            size="medium"
            v-for="(item, index) in photoInfoData.labelTag"
            :key="index"
          >
            {{ item.name }}
          </el-tag>
        </div>
      </div>
    </div>
    
    <grade-preview
      v-if="gradeInfo && showGradePreview"
      :photo-version="showPhotoVersion"
      @submit="submitData"
      ref="grade-preview"
      :show.sync="showGradePreview"
      :info="gradeInfo"
    />
  </div>
</template>

<script>
import PhotoList from '@/components/PhotoList'
import GradePreview from '../GradePreview/index.vue'
import * as AssessmentCenter from '@/api/assessmentCenter.js'
import { mapGetters } from 'vuex'
import { PHOTO_VERSION } from '@/utils/enumerate'

export default {
  name: 'GradeBox',
  components: { PhotoList, GradePreview },
  inject: ['cloudType'],
  props: {
    photoInfo: { type: Object, default: () => ({}) } // 照片数据
  },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      gradeInfo: null,
      showGradePreview: false, // 是否显示大概概览
      showPhotoVersion: '' // 展示图片版本
    }
  },
  computed: {
    ...mapGetters(['showSpotRecheck']),
    photoInfoData () {
      return this.photoInfo
    },
    photoVersionList () {
      const photoVersionInfo = this.photoInfo.photoInfo.photoSpotCheckVersion
      photoVersionInfo.forEach(versionItem => {
        versionItem.phototag = this.photoInfo.photoData.tags
      })
      return photoVersionInfo
    }
  },
  methods: {
    /**
     * @description 重新评分
     */
    async submitData (sendData) {
      try {
        const req = {
          photoId: this.photoInfo.photo_id,
          uuid: this.photoInfo._id,
          picUrl: sendData.markPhotoImg,
          tags: sendData.lableId,
          axiosType: this.cloudType
        }
        await AssessmentCenter.updateCommitHistory(req)
        this.$newMessage.success('重新评价成功')
        this.gradeInfo = null
      } finally {
        this.$emit('updateList')
      }
    },
    /**
     * @description 打开重新评价窗口
     */
    afreshGrade () {
      this.showPhotoVersion = PHOTO_VERSION.FIRST_PHOTO
      this.gradeInfo = this.photoInfo
      this.showGradePreview = true
    }
  }
}
</script>

<style lang="less">

.grade-box {
  .grid-list {
    display: flex;
    margin-bottom: 50px;
  }

  .photo-panel {
    flex-shrink: 0;
    width: 542px;

    .panel-title {
      display: flex;
      align-items: center;
      margin-bottom: 20px;

      .score-box {
        margin-left: auto;

        .el-button {
          margin-right: 12px;
        }
      }

      .grade-again-tag {
        margin-left: 12px;
      }
    }

    .photo-box {
      margin-right: 18px;
      margin-bottom: 0;
    }

    .photo-main {
      display: flex;

      .photo-list {
        flex-shrink: 0;
      }
    }
  }

  .order-panel {
    width: 100%;
  }

  .panel-info {
    .panel-title {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .panel-content {
      height: calc(~'100% - 44px');
      padding: 0 20px;
      background-color: #fafafa;
      border-radius: 4px;

      .grade-score {
        .order-info {
          margin-right: 54px;
          font-weight: 600;
          color: #303133;
        }
      }

      .issue-class-box {
        display: flex;
        flex-wrap: wrap;

        .label-title {
          flex-shrink: 0;
          margin: 0 20px 0 0;
          font-size: 14px;
          font-weight: 600;
          line-height: 28px;
          color: #303133;
        }

        .type-tag {
          margin-right: 10px;
          margin-bottom: 10px;

          &.plant {
            color: #38bc7f;
            background-color: #ecf7f2;
            border-color: #7fd9af;
          }

          &.pull {
            color: #ff3974;
            background-color: #fff0f0;
            border-color: #f99ab7;
          }

          &.middle,
          &.small {
            color: #ff8f00;
            background-color: #fff7ed;
            border-color: #ffce90;
          }
        }

        .label-box {
          margin-bottom: -10px;

          .el-tag {
            margin: 0 10px 10px 0;
            font-size: 12px;
            font-weight: 400;
            border-radius: 4px;
          }
        }
      }

      .base-info {
        .order-info {
          display: inline-block;
          margin-right: 32px;
        }
      }

      .reference-photo {
        & /deep/ .el-image {
          width: 60px;
          height: 60px;
        }
      }

      .panel-row {
        display: flex;
        align-items: center;
        min-height: 60px;
        font-size: 14px;
        line-height: 22px;
        color: #303133;
        border-bottom: 1px solid @borderColor;

        .order-info {
          .order-info-title {
            display: inline-block;
          }
        }

        &.reference-photo {
          height: 85px;
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
