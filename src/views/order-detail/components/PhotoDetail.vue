<template>
  <div class="photo-detail">
    <!-- 图片列表 -->
    <photo-list need-preload :photo-data="photoVersionList"  />
    <div v-if="hasStoreReturnReason" class="panel-box">
      <div class="panel-title">门店退回</div>
      <div class="panel-main">
        <div class="panel-content content-one">
          退回标记：
          <el-tag
            size="medium"
            class="reason-item"
            v-for="(reasonItem, tagIndex) in StoreReturnReason"
            :key="tagIndex"
          >
            {{ reasonItem }}
          </el-tag>
        </div>
        <div class="panel-content">退回备注：{{ wholeNote || partNote ?  wholeNote + ' ' + partNote : '暂无备注' }}</div>
      </div>
    </div>
    <div v-if="hasCheckTags" class="panel-box">
      <div class="panel-title">云学院评价</div>
      <div class="panel-main">
        <div class="panel-content content-one">
          总分：{{ checkScore }}
          <el-tag :class="['type-tag', evaluatorType]" size="medium">{{ evaluatorType | toPlantCN }}</el-tag>
        </div>
        <div class="panel-content">
          问题标记：
          <el-tag
            size="medium"
            class="reason-item"
            v-for="(tagItem, tagIndex) in checkTag"
            :key="tagIndex"
          >
            {{ tagItem }}
          </el-tag>
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
      return _.get(this.photoData, 'tags.values.store_rework_reason') || _.get(this.photoData, 'tags.values.store_part_rework_reason') || false
    },
    // 是否云学院打分
    hasCheckTags () {
      const hasEvaluatorType = _.get(this.photoData, 'tags.values.evaluator_type')
      const hasEvaluatorScore = _.get(this.photoData, 'tags.values.score')
      const hasCheckPoolTags = _.get(this.photoData, 'tags.values.check_pool_tags')
      return hasEvaluatorType || hasEvaluatorScore || hasCheckPoolTags || false
    },
    // 云学院评价类型
    evaluatorType () {
      const hasEvaluatorType = _.get(this.photoData, 'tags.values.evaluator_type')
      return hasEvaluatorType
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
        item.note && (note += item.note + ' ')
      })
      return note
    },
    // 退单标记 包括整体标记和局部标记
    StoreReturnReason () {
      const wholeReason = _.get( this.photoData, 'tags.values.store_rework_reason', '')
      const partArr = _.get( this.photoData, 'tags.values.store_part_rework_reason') || []
      let partReason = []
      partArr.forEach(item => {
        partReason = [...item.reason.split('+'),...partReason]
      })
      return partReason.concat(wholeReason ? wholeReason.split('+') : [])
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
          margin: 0 10px 10px 0;
          font-size: 12px;
          border-radius: 5px;
        }
      }

      .content-one {
        display: flex;
        flex-wrap: wrap;
        border-bottom: 1px solid @borderColor;
      }
    }

    .type-tag {
      margin: 0 10px 10px;

      &.plant {
        color: #fff;
        background-color: #44c27e;
        border-color: #44c27e;
      }

      &.pull {
        color: #fff;
        background-color: #ff3974;
        border-color: #ff3974;
      }

      &.none {
        color: #fff;
        background-color: #4669fb;
        border-color: #4669fb;
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
