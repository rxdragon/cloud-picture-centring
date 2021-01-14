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
        <span>云学院评分</span>
        <span>总分：{{ checkScore }}</span>
      </div>
      <div class="panel-main">
        <div class="issue-class-box panel-row">
          <el-tag :class="['type-tag', evaluatorType]" size="medium">
            {{ evaluatorType | toPlantCN }}
          </el-tag>
          <el-tag
            :class="['type-tag', item.type]"
            size="medium"
            v-for="(item, index) in typeTags"
            :key="index"
          >
            {{ item.name }}
          </el-tag>
        </div>
        <div class="issue-class-box panel-row" v-for="checkItem in checkTag" :key="checkItem.id">
          <div class="label-title">{{ checkItem.name }}</div>
          <div class="label-box">
            <el-tag size="medium" v-for="issueItem in checkItem.child" :key="issueItem.id">{{ issueItem.name }}</el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PhotoList from '@/components/PhotoList'
import PreviewModel from '@/model/PreviewModel'
import uuidv4 from 'uuid'

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
    // 激励词
    typeTags () {
      const typeTags = _.get(this.photoData, 'tags.values.check_pool_ex_tags') || []
      return typeTags
    },
    // 云学院标记
    checkTag () {
      const checkPoolTags = _.get(this.photoData, 'tags.values.check_pool_tags') || []
      const parentData = []
      checkPoolTags.forEach(issueItem => {
        const findClass = parentData.find(classItem => classItem.id === _.get(issueItem, 'parent.id'))
        if (findClass) {
          findClass.child.push({
            id: issueItem.id,
            name: issueItem.name
          })
        } else {
          const newClass = {
            id: _.get(issueItem, 'parent.id') || uuidv4(),
            name: _.get(issueItem, 'parent.name') || '-',
            child: [{
              id: issueItem.id,
              name: issueItem.name,
            }]
          }
          parentData.push(newClass)
        }
      })
      return parentData
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

    .panel-main {
      padding: 20px;
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
