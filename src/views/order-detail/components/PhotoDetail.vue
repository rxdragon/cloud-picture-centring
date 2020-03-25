<template>
  <div class="photo-detail">
    <!-- 重修 -->
    <div v-if="rework" class="return-data">
      <div class="panel-box danger-box">
        <div class="content-title">重修{{ photoData.reworkNum }}次</div>
        <div class="panel-content">{{ photoData.tags && photoData.tags.values && photoData.tags.values.rework_reason || '暂无重修理由' }}</div>
      </div>
    </div>
    <!-- 审核 -->
    <div class="check-data">
      <div v-if="photoData.grass === 'plant'" class="panel-box plant-box">
        <div class="content-title">审核种草</div>
        <div class="panel-content">{{ photoData.tags && photoData.tags.values&&photoData.tags.values.grass_reason || '暂无审核种草理由' }}</div>
      </div>
      <div v-if="photoData.grass === 'pull'" class="panel-box danger-box">
        <div class="content-title">审核拔草</div>
        <div class="panel-content">{{ photoData.tags && photoData.tags.values&&photoData.tags.values.grass_reason || '暂无审核拔草理由' }}</div>
      </div>
    </div>
    <div v-if="storeRework" class="store-return">
      <div class="panel-box danger-box">
        <div class="content-title">门店退回</div>
        <div class="panel-content">{{ storeReworkReason || '暂无退回原因' }}</div>
      </div>
    </div>
    <!-- 纠偏 -->
    <div v-if="photoData.tags && photoData.tags.values && photoData.tags.values.audit_correction" class="correct-data">
      <div class="panel-box primary-box">
        <div class="content-title">{{ [photoData.tags.values.audit_correction, photoData.spotGrass] | toAuditChange }}</div>
        <div class="panel-content">{{ photoData.tags.values.audit_note || '暂无纠偏理由' }}</div>
      </div>
    </div>
    <!-- 抽查 -->
    <div class="spot-data">
      <div v-if="photoData.filmEvaluation === 'plant'" class="panel-box plant-box">
        <div class="content-title">抽查种草</div>
        <div class="panel-content">{{ photoData.tags && photoData.tags.values.evaluation_note || '暂无抽查理由' }}</div>
      </div>
      <div v-if="photoData.filmEvaluation === 'pull'" class="panel-box danger-box">
        <div class="content-title">抽查拔草</div>
        <div class="panel-content">{{ photoData.tags && photoData.tags.values.evaluation_note || '暂无抽查理由' }}</div>
      </div>
    </div>
    <!-- 图片列表 -->
    <div class="photo-list">
      <div v-for="(photo, photoIndex) in photoData.photoVersion" :key="photoIndex" class="photo-box">
        <photo-box :tags="photoData.tags" :is-lekima="photo.isLekima" preview photo-name downing :src="photo.path">
          <template v-slot:title>
            <span class="lable-title">{{ photo.version | toPhotoVerName }}</span>
          </template>
        </photo-box>
      </div>
    </div>
  </div>
</template>

<script>
import PhotoBox from '@/components/PhotoBox'

export default {
  name: 'PhotoDetail',
  components: { PhotoBox },
  filters: {
    toAuditChange (values) {
      switch (values[0]) {
        case 'same':
          return '纠偏-意见相同'
        case 'none':
          return '纠偏-意见不同-不种不拔'
        case 'different':
          if (values[1] === 'plant') {
            return '纠偏-意见不同-种草'
          } else if (values[1] === 'pull') {
            return '纠偏-意见不同-拔草'
          } else {
            return '异常'
          }
        default:
          return '-'
      }
    }
  },
  props: {
    photoItem: { type: Object, required: true }
  },
  data () {
    return {}
  },
  computed: {
    photoData () {
      return this.photoItem
    },
    storeReworkReason () {
      return this.photoData.tags &&
        this.photoData.tags.values &&
        this.photoData.tags.values.store_rework_reason
    },
    // 是够重修
    rework () {
      if (this.photoData.tags && this.photoData.tags.statics) {
        const isRework = this.photoData.tags.statics.includes('return_photo')
        return isRework
      } else {
        return false
      }
    },
    // 是否门店退回
    storeRework () {
      return this.photoData.tags &&
        this.photoData.tags.statics &&
        this.photoData.tags.statics.includes('store_rework')
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";
@panelTitleWidth: 185px;

.photo-detail {
  .panel-box {
    display: flex;
    padding: 0;
    margin-bottom: 16px;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
    color: #606266;
    border: 1px solid #eee;
    border-radius: 4px;
    box-shadow: none;

    .content-title {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-items: center;
      width: @panelTitleWidth;
      padding: 13px 14px;
      text-align: center;
    }

    .panel-content {
      display: flex;
      align-items: center;
      width: calc(~'100% - @{panelTitleWidth}');
      padding: 13px 14px;
    }
  }

  .photo-list {
    display: flex;
    flex-wrap: wrap;
    margin-top: 20px;

    .photo-box {
      width: 241px;
      margin-right: 24px;
      margin-bottom: 24px;
    }

    .empty {
      width: 30%;
    }
  }

  .danger-box {
    border: 1px solid @bdRed;

    .content-title {
      color: @red;
      background-color: @bgRed;
    }

    .panel-content {
      border-left: 1px solid @bdRed;
    }
  }

  .primary-box {
    border: 1px solid @bdBlue;

    .content-title {
      color: @blue;
      background-color: @bgBlue;
    }

    .panel-content {
      border-left: 1px solid @bdBlue;
    }
  }

  .plant-box {
    border: 1px solid @bdGreen;

    .content-title {
      color: @green;
      background-color: @bgGreen;
    }

    .panel-content {
      border-left: 1px solid @bdGreen;
    }
  }
}
</style>
