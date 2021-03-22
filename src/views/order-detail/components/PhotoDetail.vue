<template>
  <div class="photo-detail">
    <!-- 图片列表 -->
    <photo-list need-preload :show-special-effects="false"  :photo-data="photoVersionList"  />
    <div v-if="hasStoreReturnReason" class="panel-box">
      <div class="panel-title">门店退回</div>
      <div class="panel-main">
        <div class="panel-content content-one">
          <div class="content-title">局部退回标记：</div>
          <div
            v-for="(reasonItem, index) in reworkPhoto.storePartReworkReason"
            :key="index"
          >
            <div
              v-for="(reasonManageItem, index) in reasonItem.reasonManage"
              :key="index"
              :class="['reason-item', reasonManageItem.cancel ? 'del' : '']"
            >
              <span>{{ reasonManageItem.name }}</span>
              <span v-if="reasonManageItem.cancel">(已删除)</span>
            </div>
          </div>
        </div>
        <div class="panel-content content-one">
          <div class="content-title">局部退回备注：</div>
          <div>
            <span
              v-for="(storePartReworkReason, index) in reworkPhoto.storePartReworkReason"
              :key="index"
              class="content-part-note"
            >
              {{ storePartReworkReason.note }}
            </span>
          </div>
        </div>
        <div class="panel-content content-one">
          <div class="content-title">整体退回标记：</div>
          <div>
            <div
              v-for="(reasonItem, index) in reworkPhoto.storeReworkReasonManage"
              :key="index"
              :class="['reason-item', reasonItem.cancel ? 'del' : '']"
            >
              <span>{{ reasonItem.name }}</span>
              <span v-if="reasonItem.cancel">(已删除)</span>
            </div>
          </div>
        </div>
        <div class="panel-content content-one">
          <div class="content-title">整体退回备注：</div>
          {{ reworkPhoto.storeReworkNote }}
        </div>
      </div>
    </div>
    <div v-if="hasCheckTags" class="panel-box">
      <div class="panel-title">
        <span>{{ evaluationTypeCn }}</span>
        <span>总分：{{ photoData.checkPoolScore }}</span>
      </div>
      <div class="panel-main" v-if="photoData.checkPoolTags.length">
        <div class="issue-class-box panel-row">
          <el-tag
            class="type-tag"
            size="medium"
            v-for="labelItem in photoData.checkPoolTags"
            :key="labelItem.id"
            :class="labelItem.type"
          >
            {{ labelItem.name }}
          </el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PhotoList from '@/components/PhotoList'
import PreviewModel from '@/model/PreviewModel'

import { SPOT_CHECK_MAP } from '@/utils/enumerate'
import { mapGetters } from 'vuex'

export default {
  name: 'PhotoDetail',
  components: { PhotoList },
  props: {
    photoItem: { type: Object, required: true },
    evaluationType: { type: String }
  },
  data () {
    return {
      photoVersionList: []
    }
  },
  computed: {
    ...mapGetters(['imgDomain']),
    photoData () {
      return this.photoItem
    },
    // 退回的那个照片
    reworkPhoto () {
      let realReworkPhoto = this.photoItem.realReworkPhoto || {}
      if (Object.keys(realReworkPhoto).length) {
        realReworkPhoto = new PreviewModel(realReworkPhoto)
      }
      return realReworkPhoto
    },
    // 判断是否有退单标记
    hasStoreReturnReason () {
      return Object.keys(this.reworkPhoto).length
    },
    // 是否云学院打分
    hasCheckTags () {
      const hasEvaluatorScore = this.photoData.checkPoolScore
      return hasEvaluatorScore
    },
    // 抽查类型
    evaluationTypeCn () {
      if (!this.evaluationType) return ''
      return this.evaluationType === SPOT_CHECK_MAP.CHECK_POOL_SPOT
        ? '云学院评分'
        : '修修兽评分'
    }
  },
  created () {
    this.initPhotoList()
  },
  methods: {
    initPhotoList () {
      this.photoVersionList = this.photoItem.photoVersion
    }
  }
}
</script>

<style lang="less" scoped>

@panelTitleWidth: 185px;

.photo-detail {
  .panel-box {
    margin-top: 20px;
    font-size: 14px;
    color: #303133;

    .issue-class-box {
      display: flex;
      flex-wrap: wrap;
      padding: 20px 0 10px !important;

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
    }

    .panel-row {
      padding: 20px 0;
      font-size: 14px;
      line-height: 22px;
      color: #303133;

      .order-info {
        .order-info-title {
          display: inline-block;
        }
      }
    }

    .panel-main {
      padding: 0 20px;
      margin-top: 12px;
      background-color: #fafafa;
      border-radius: 4px;

      .panel-content {
        padding: 10px 0;

        .problem-item {
          margin-right: 16px;
          margin-bottom: 4px;
        }

        .reason-item {
          display: inline-block;
          padding: 4px 10px;
          margin-right: 16px;
          margin-bottom: 4px;
          font-size: 12px;
          color: #4669fb;
          background: rgba(237, 240, 255, 1);
          border: 1px solid rgba(181, 195, 253, 1);
          border-radius: 4px;

          &.del {
            color: #919199;
            background: rgba(212, 212, 217, 1);
            border: none;
          }
        }
      }

      .content-one {
        display: flex;
        border-bottom: 1px solid @borderColor;
      }

      .content-title {
        flex-shrink: 0;
        width: 120px;
      }

      .content-part-note {
        margin-right: 16px;
        margin-bottom: 4px;
      }
    }
  }

  .photo-list {
    display: flex;
    flex-wrap: wrap;
    margin-top: 20px;
    margin-right: -24px;

    .photo-box {
      width: 241px;
      margin-right: 24px;
      margin-bottom: 24px;
    }

    .empty {
      width: 30%;
    }
  }
}
</style>
