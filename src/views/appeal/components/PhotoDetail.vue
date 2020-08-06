<template>
  <div class="photo-detail">
    <!-- 图片列表 -->
    <div v-if="!checkType" class="normal-photo-list">
      <div class="normal-photo-item" v-for="(photo, photoIndex) in photoVersionList" :key="photoIndex">
        <el-image fit="cover" :src="imgCompressDomain + photo.path" />
        <div class="normal-photo-name">
          <span>{{ photo.version | toPhotoVerName }}</span>
        </div>
      </div>
    </div>
    <photo-list v-else need-preload :photo-data="photoVersionList"  />
    <div class="panel-box">
      <div class="panel-title">门店退回</div>
      <div class="panel-main">
        <div class="panel-content content-one">
          局部退回标记：
          <div
            v-for="(reasonItem, index) in realPhotoData.storePartReworkReason"
            :key="index"
          >
            <div
              v-for="(reasonManageItem, index) in reasonItem.reasonManage"
              :key="index"
              class="reason-item"
            >
              <span>{{ reasonManageItem.name }}</span>
              <span v-if="reasonManageItem.cancel">(已删除)</span>
            </div>
          </div>
        </div>
        <div class="panel-content content-one">
          局部退回备注：
          <span
            v-for="(storePartReworkReason, index) in realPhotoData.storePartReworkReason"
            :key="index"
          >
            {{ storePartReworkReason.note }}
          </span>
        </div>
        <div class="panel-content content-one">
          整体退回标记：
          <div
            v-for="(reasonItem, index) in realPhotoData.storeReworkReasonManage"
            :key="index"
            class="reason-item"
          >
            <span>{{ reasonItem.name }}</span>
            <span v-if="reasonItem.cancel">(已删除)</span>
          </div>
        </div>
        <div class="panel-content">整体退回备注：{{ realPhotoData.storeReworkNote }}</div>
      </div>
    </div>
    <div class="panel-box">
      <div class="panel-title">
        申诉处理
        <el-button type="primary" @click="goCheck('first')" v-if="checkType === 'first'">初审</el-button>
        <el-button type="primary" @click="goCheck('second')" v-if="checkType === 'second'">复审</el-button>
      </div>
      <div class="panel-main">
        <div class="panel-content content-one">申诉问题描述: {{ photoItem.photoAppeals.desc }}</div>
        <div class="panel-content content-one">初审状态: {{ firstResult.resultDesc }}</div>
        <div class="panel-content content-one">复审状态: {{ secondResult.resultDesc }}</div>
        <div class="panel-content content-one">拒绝原因: {{ secondResult.reason }}</div>
      </div>
    </div>
    <preview-photo
      v-if="showPreview"
      :order-info="orderInfo"
      :imgarray="priviewPhotoData"
      show-return-reson
      :orderindex="imgIndex"
      :show-order-info="false"
      :show-preview.sync="showPreview"
      @saveResult="saveResult"
      :check-type="checkType"
    />
  </div>
</template>

<script>
import PhotoList from '@/components/PhotoList'
import PreviewPhoto from './PreviewPhoto/index.vue'
import PreviewModel from '@/model/PreviewModel'

import { mapGetters } from 'vuex'

import { AppealCheckStatusEnum } from '@/utils/enumerate'

export default {
  name: 'PhotoDetail',
  components: { PhotoList, PreviewPhoto },
  props: {
    photoItem: { type: Object, required: true },
    checkType: { type: String, default: '' }
  },
  data () {
    return {
      photoVersionList: [],
      showPreview: false,
      imgIndex: 0,
      orderInfo: {},
      firstResult: {
        resultDesc: '--'
      }, // 初审结果
      secondResult: {
        resultDesc: '--',
        reason: '--'
      }, // 复审结果
      photoVersionId: ''
    }
  },
  computed: {
    // 预览数组
    priviewPhotoData () {
      if (!this.photoVersionList.length) return []
      const previewList = this.photoVersionList.map(item => {
        const createData = new PreviewModel(item)
        createData.storeReturnCount = item.storeReturnCount
        createData.src = this.imgDomain + createData.path
        return createData
      })
      return previewList
    },
    realPhotoData () {
      return this.priviewPhotoData.filter(priviewPhotoItem => priviewPhotoItem.id === this.photoVersionId)[0]
    },
    ...mapGetters(['imgDomain', 'imgCompressDomain']),
    // 判断是否有退单标记
    hasStoreReturnReason () {
      return _.get(this.photoItem, 'tags.values.store_rework_reason') || _.get(this.photoItem, 'tags.values.store_part_rework_reason') || false || _.get(this.photoItem, 'tags.values.labels')
    },
    // 是否云学院打分
    hcsCheckTags () {
      return _.get(this.photoItem, 'tags.values.score') || _.get(this.photoItem, 'tags.values.check_pool_tags') || false
    },
    // 云学院评分
    checkScore () {
      return _.get(this.photoItem, 'tags.values.score') || 0
    },
    // 云学院标记
    checkTag () {
      const tagArr = _.get( this.photoItem, 'tags.values.check_pool_tags') || []
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
    /**
     * @description 初始化照片列表
     */
    initPhotoList () {
      this.photoVersionList = this.photoItem.photoVersion
      this.photoVersionId = this.photoItem.photoVersionId
    },
    /**
     * @description 去审核
     */
    goCheck (type) {
      this.showPreview = true
    },
    /**
     * @description 接受预览组件的审核结果
     */
    saveResult (resultObj) {
      const { type, result, reason } = resultObj
      if (type === 'first') {
        this.firstResult = {
          id: this.photoItem.photoAppeals.id,
          result,
          reason,
          resultDesc: AppealCheckStatusEnum[result]
        }
      }
      if (type === 'second') {
        this.secondResult = {
          id: this.photoItem.photoAppeals.id,
          result,
          reason,
          resultDesc: AppealCheckStatusEnum[result]
        }
        this.realPhotoData.storePartReworkReason = resultObj.storePartReworkReason
      }
    }
  }
}
</script>

<style lang="less" scoped>

@panelTitleWidth: 185px;

.photo-detail {
  .panel-title {
    .el-button {
      margin-left: 10px;
    }
  }

  .normal-photo-list {
    display: flex;
    align-items: center;

    .normal-photo-item {
      box-sizing: border-box;
      width: 254px;
      height: 290px;
      padding: 6px;
      margin-right: 24px;
      background-color: #f5f7fa;
      border-radius: 4px;
    }

    .normal-photo-name {
      padding: 12px 6px;
      font-size: 12px;
      color: #606266;
      text-align: right;
    }

    .el-image {
      width: 242px;
      height: 242px;
    }
  }

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
          display: inline-block;
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
