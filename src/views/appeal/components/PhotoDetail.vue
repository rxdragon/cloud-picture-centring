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
    <photo-list v-else need-preload :photo-data="photoVersionList" />
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
              v-for="(reasonManageItem) in reasonItem.reasonManage"
              :key="reasonManageItem.id"
              :class="['reason-item', reasonManageItem.cancel && reasonManageItem.isDel ? 'del' : '']"
            >
              <span>{{ reasonManageItem.name }}</span>
              <span v-if="reasonManageItem.cancel && reasonManageItem.isDel">(已删除)</span>
              <span
                class="red"
                v-if="reasonManageItem.cancel && !reasonManageItem.isDel"
              >(标记删除)
              </span>
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
            v-for="(reasonItem) in realPhotoData.storeReworkReasonManage"
            :key="reasonItem.id"
            :class="['reason-item', reasonItem.cancel && reasonItem.isDel ? 'del' : '']"
          >
            <span>{{ reasonItem.name }}</span>
            <span v-if="reasonItem.cancel && reasonItem.isDel">(已删除)</span>
            <span class="red" v-if="reasonItem.cancel && !reasonItem.isDel">(标记删除)</span>
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
        <div class="panel-content content-one">初审状态: {{ photoItem.photoAppeals.firstResult.resultDesc }}</div>
        <div class="panel-content content-one">复审状态: {{ photoItem.photoAppeals.secondResult.resultDesc }}</div>
        <div
          class="panel-content content-one"
          v-if="photoItem.photoAppeals.firstResult.result === APPEAL_RESULT_STATUS.REFUSE"
        >
          拒绝原因: {{ photoItem.photoAppeals.firstResult.reason }}
        </div>
        <div
          class="panel-content content-one"
          v-if="photoItem.photoAppeals.secondResult.result === APPEAL_RESULT_STATUS.REFUSE"
        >
          拒绝原因: {{ photoItem.photoAppeals.secondResult.reason }}
        </div>
      </div>
    </div>
    <preview-photo
      v-if="showPreview"
      :imgarray="priviewPhotoData"
      show-return-reson
      :orderindex="imgIndex"
      :show-order-info="false"
      :show-preview.sync="showPreview"
      @saveResult="saveResult"
      :check-type="checkType"
      :photo-appeal="photoItem.photoAppeals"
    />
  </div>
</template>

<script>
import PhotoList from '@/components/PhotoList'
import PreviewPhoto from './PreviewPhoto/index.vue'
import PreviewModel from '@/model/PreviewModel'

import { mapGetters } from 'vuex'

import { AppealResultStatusEnum, APPEAL_RESULT_STATUS, PHOTO_VERSION } from '@/utils/enumerate'

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
      firstResult: {
        resultDesc: '-'
      }, // 初审结果
      secondResult: {
        resultDesc: '-',
        reason: '-'
      }, // 复审结果
      photoVersionId: '',
      APPEAL_RESULT_STATUS
    }
  },
  computed: {
    imgIndex () {
      let finalIndex = 0
      this.photoVersionList.forEach((photoVersion, photoVersionIndex) => {
        if (photoVersion.version === PHOTO_VERSION.STORE_REWORK) {
          finalIndex = photoVersionIndex
        }
      })
      return finalIndex
    },
    // 预览数组
    priviewPhotoData () {
      if (!this.photoVersionList.length) return []
      const previewList = this.photoVersionList.map((photoVersion, photoVersionIndex) => {
        const createData = new PreviewModel(photoVersion)
        createData.storeReturnCount = photoVersion.storeReturnCount
        createData.src = this.imgDomain + createData.path
        return createData
      })
      return previewList
    },
    realPhotoData () {
      return this.priviewPhotoData.filter(priviewPhotoItem => priviewPhotoItem.id === this.photoVersionId)[0]
    },
    ...mapGetters(['imgDomain', 'imgCompressDomain'])
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
        this.photoItem.photoAppeals.firstResult = {
          id: this.photoItem.photoAppeals.id,
          result,
          reason,
          resultDesc: AppealResultStatusEnum[result]
        }
      }
      if (type === 'second') {
        this.photoItem.photoAppeals.secondResult = {
          id: this.photoItem.photoAppeals.id,
          result,
          reason,
          resultDesc: AppealResultStatusEnum[result]
        }
        if (resultObj.storePartReworkReason) this.realPhotoData.storePartReworkReason = resultObj.storePartReworkReason
        if (resultObj.storeReworkReasonManage) this.realPhotoData.storeReworkReasonManage = resultObj.storeReworkReasonManage
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
          padding: 4px 10px;
          margin-right: 16px;
          font-size: 12px;
          color: #4669fb;
          background: rgba(237, 240, 255, 1);
          border: 1px solid rgba(181, 195, 253, 1);
          border-radius: 4px;

          .red {
            color: red;
          }

          &.del {
            color: #919199;
            background: rgba(212, 212, 217, 1);
            border: none;
          }
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
