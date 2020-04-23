<template>
  <div class="photo-detail">
    <!-- 图片列表 -->
    <div class="photo-list">
      <div v-for="(photo, photoIndex) in photoData.otherPhotoVersion" :key="photoIndex" class="photo-box">
        <photo-box
          :tags="photoData.tags"
          :is-lekima="photo.isLekima"
          :preview="!showMark(photo.version)"
          :show-store-mark="showMark(photo.version)"
          photo-name
          downing
          :stream-num="photoData.stream_num"
          :pre-list="preList(photo)"
          :pre-index="0"
          :src="photo.path"
        >
          <template v-slot:title>
            <span class="lable-title">{{ photo.version | toPhotoVerName }}</span>
          </template>
        </photo-box>
      </div>
    </div>
    <div v-if="hasStoreReturnReason" class="panel-box">
      <div class="panel-title">门店退回</div>
      <div class="panel-main">
        <div class="panel-content content-one">退回标记：<span v-for="(reasonItem, index) in StoreReturnReason" :key="index" class="reason-item">{{ reasonItem }}</span></div>
        <div class="panel-content">退回备注：{{ wholeNote + ' ' + partNote || '暂无备注' }}</div>
      </div>
    </div>
    <div v-if="hcsCheckTags" class="panel-box">
      <div class="panel-title">云学院评价</div>
      <div class="panel-main">
        <div class="panel-content content-one">总分：{{ checkScore }}</div>
        <div class="panel-content">问题标记：<span v-for="(tagItem, index) in checkTag" :key="index" class="reason-item">{{ tagItem }}</span>
        <span v-if="!checkTag.length">暂无标记</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PhotoBox from '@/components/PhotoBox'

export default {
  name: 'PhotoDetail',
  components: { PhotoBox },
  props: {
    photoItem: { type: Object, required: true }
  },
  data () {
    return {
    }
  },
  computed: {
    photoData () {
      return this.photoItem
    },
    // 判断是否有退单标记
    hasStoreReturnReason () {
      return _.get(this.photoData, 'tags.values.store_rework_reason') || _.get(this.photoData, 'tags.values.store_part_rework_reason') || false
    },
    // 是否云学院打分
    hcsCheckTags () {
      return _.get(this.photoData, 'tags.values.score') || _.get(this.photoData, 'tags.values.check_pool_tags') || false
    },
    // 云学院评分
    checkScore () {
      return _.get(this.photoData, 'tags.values.score') || 0
    },
    // 云学院标记
    checkTag () {
      const tagArr = _.get( this.photoData, 'tags.values.check_pool_tags') || []
      const tagFilter = tagArr.map(item => {
        return item.name
      })
      return tagFilter
    },
    // 整体备注
    wholeNote () {
      return _.get( this.photoData, 'tags.values.store_rework_note') || ''
    },
    // 局部备注数组
    partNote () {
      let note = ''
      const partArr = _.get( this.photoData, 'tags.values.store_part_rework_reason') || []
      partArr.forEach(item => {
        note += item.note + ' '
      })
      return note
    },
    // 退单标记 包括整体标记和局部标记
    StoreReturnReason () {
      const wholeReason = _.get( this.photoData, 'tags.values.store_rework_reason', '').split('+')
      const partArr = _.get( this.photoData, 'tags.values.store_part_rework_reason') || []
      let partReason = []
      partArr.forEach(item => {
        partReason = [...item.reason.split('+'),...partReason]
      })
      return wholeReason.concat(partReason)
    },
    showMark () {
      return function (version) {
        return version === 'complete_photo'
      }
    },
    // 门店退回标记与照片封装
    preList () {
      return function (item) {
        if (item.version !== 'complete_photo') {
          return []
        }
        // 深拷贝
        let itemCopy = JSON.parse(JSON.stringify(item))
        const originPhoto = this.photoData.otherPhotoVersion.find(item => item.version === 'original_photo')
        itemCopy.returnPhotoPath = item.path
        itemCopy.path = originPhoto.path
        return [itemCopy]
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";
@panelTitleWidth: 185px;

.photo-detail {
  .panel-box {
    margin-top: 20px;
    font-size: 14px;
    color: #303133;

    .panel-main {
      padding: 20px;
      margin-top: 12px;
      background-color: #fafafa;
      border-radius: 4px;

      .panel-content {
        padding: 10px 0;

        .reason-item {
          padding: 3px 5px;
          margin: 5px 10px 5px 0;
          font-size: 12px;
          color: #fff;
          background-color: #535353;
          border-radius: 5px;
        }
      }

      .content-one {
        display: flex;
        flex-wrap: wrap;
        border-bottom: 1px solid @borderColor;
      }
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
}
</style>
