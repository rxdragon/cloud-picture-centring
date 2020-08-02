<template>
  <div class="photo-detail">
    <!-- 图片列表 -->
    <photo-list need-preload :photo-data="photoVersionList"  />
    <div v-if="hasStoreReturnReason" class="panel-box">
      <div class="panel-title">门店退回</div>
      <div class="panel-main">
        <div class="panel-content content-one">
          局部退回标记：<span
            v-for="(reasonItem, index) in photoItem.partReason"
            :key="index"
            class="reason-item"
          >{{ reasonItem }}
          </span>
        </div>
        <div class="panel-content content-one">局部退回备注：{{ photoItem.partNote }}</div>
        <div class="panel-content content-one">
          整体退回标记：<span
            v-for="(reasonItem, index) in photoItem.wholeReason"
            :key="index"
            class="reason-item"
          >{{ reasonItem }}
          </span>
        </div>
        <div class="panel-content">整体退回备注：{{ photoItem.wholeNote }}</div>
      </div>
    </div>
    <div v-if="hcsCheckTags" class="panel-box">
      <div class="panel-title">云学院评价</div>
      <div class="panel-main">
        <div class="panel-content content-one">总分：{{ checkScore }}</div>
        <div class="panel-content">
          问题标记：<span v-for="(tagItem, index) in checkTag" :key="index" class="reason-item">{{ tagItem }}</span>
          <span v-if="!checkTag.length">暂无标记</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PhotoList from '@/components/PhotoList'
import { mapGetters } from 'vuex'

export default {
  name: 'PhotoDetail',
  components: { PhotoList },
  props: {
    photoItem: { type: Object, required: true }
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
    // 判断是否有退单标记
    hasStoreReturnReason () {
      return _.get(this.photoData, 'tags.values.store_rework_reason') || _.get(this.photoData, 'tags.values.store_part_rework_reason') || false || _.get(this.photoData, 'tags.values.labels')
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

    .panel-main {
      padding: 20px;
      margin-top: 12px;
      background-color: #fafafa;
      border-radius: 4px;

      .panel-content {
        padding: 10px 0;

        .reason-item {
          padding: 3px 5px;
          margin: 0 10px 10px 0;
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
