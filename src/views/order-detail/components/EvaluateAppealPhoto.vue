<template>
  <div class="evaluate-photo module-panel">
    <!-- 照片区域 -->
    <div class="photo-area">
      <el-checkbox v-model="photoItem.reworkChecked">
        <photo-box
          :src="reworkImg"
          :show-special-effects="false"
          :show-store-part-rework-reason="false"
          contain-photo
          show-label-info
        />
      </el-checkbox>
    </div>
    <!-- 抽片信息 -->
    <div class="info-area">
      <!-- 抽查评分 -->
      <div class="info-item">
        <p class="info-title">抽查评分: </p>
        <div class="info-content">
          <span class="evaluate-score">{{ photoItem.checkPoolScore }}分</span>
        </div>
      </div>
      <!-- 评价标签 -->
      <div class="info-item">
        <el-tag
          v-for="item in photoItem.checkPoolTags"
          :key="item.id"
          size="medium"
          class="label-tag"
          :class="item.type"
        >
          {{ item.name }}
        </el-tag>
      </div>

      <!-- 问题描述 -->
      <div v-show="photoItem.reworkChecked" class="issue-describe info-item">
        <p class="info-title">问题描述(必填)：</p>
        <el-input
          type="textarea"
          placeholder="问题描述,最多100个字符"
          :rows="4"
          v-model="photoItem.appealReason"
          maxlength="100"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import PhotoBox from '@/components/PhotoBox'

export default {
  name: 'EvaluateAppealPhoto',
  components: { PhotoBox },
  props: {
    photoItem: { type: Object, required: true }
  },
  computed: {
    ...mapGetters(['imgCompressDomain']),
    reworkImg () {
      return this.imgCompressDomain + this.photoItem.originalPhoto.path
    },
  }
}
</script>

<style lang="less" scoped>

@panelTitleWidth: 185px;

.evaluate-photo {
  display: flex;
  margin-bottom: 24px;
  background-color: #f5f7fa;
  box-shadow: none;

  .red {
    color: @red;
  }

  .photo-area {
    position: relative;
    flex-shrink: 0;
    width: 240px;
    height: 240px;
    margin-right: 24px;
    border: 1px solid transparent;

    &.photo-area-checked {
      box-sizing: border-box;
      border: 1px solid @blue;
    }

    .el-checkbox {
      width: 100%;
      height: 100%;

      & /deep/ .el-checkbox__input {
        position: absolute;
        right: 12px;
        bottom: 12px;
        z-index: 99;
      }

      .photo {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top;
        border-radius: 5px;
      }
    }
  }

  .info-area {
    width: 100%;
    padding-top: 12px;

    .info-item {
      display: flex;
      align-items: flex-start;
      margin-right: 10px;
      margin-bottom: 14px;

      .info-title {
        display: block;
        flex-shrink: 0;
        margin-right: 12px;
        font-size: 16px;
        font-weight: 600;
        line-height: 24px;
        color: #303133;

        &.red {
          color: @red;
        }
      }

      .info-content {
        font-size: 14px;

        &.check-tag-box {
          margin-right: -10px;
          margin-bottom: -4px;

          .tag-item {
            margin-right: 10px;
            margin-bottom: 4px;
          }
        }

        .evaluate-score {
          font-size: 16px;
          font-weight: 600;
          line-height: 24px;
        }
      }

      &.issue-describe {
        flex-direction: column;

        .info-title {
          margin-bottom: 14px;
        }
      }

      .label-tag {
        margin-right: 10px;

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

    .type-tag {
      margin-right: 10px;

      &.plant {
        color: #fff;
        background-color: @panGreen;
        border-color: @panGreen;
      }

      &.pull {
        color: #fff;
        background-color: @red;
        border-color: @red;
      }

      &.none {
        color: #fff;
        background-color: @blue;
        border-color: @blue;
      }
    }
  }
}
</style>
