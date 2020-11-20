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
    <photo-list
      v-else
      need-preload
      :photo-data="photoVersionList"
      :show-special-effects="false"
    />
    <!-- 质量问题标签 -->
    <div
      class="panel-box"
      v-if="appealInfo.appealType === APPEAL_TYPE.REWORK"
    >
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
    <!-- 云学院评分详情 -->
    <div
      class="panel-box"
      v-if="appealInfo.appealType === APPEAL_TYPE.EVALUATE"
    >
      <div class="panel-title evaluate">
        <span>评价信息</span>
        <span>总分：{{ photoItem.photoAppeals.checkPoolScore }}</span>
      </div>
      <div class="panel-main">
        <div class="issue-class-box panel-row">
          <el-tag
            :class="['type-tag', photoItem.photoAppeals.evaluatorType]"
            size="medium"
          >
            {{ photoItem.photoAppeals.evaluatorType | toPlantCN }}
          </el-tag>
          <el-tag
            :class="['type-tag', item.type]"
            size="medium"
            v-for="(item, index) in photoItem.photoAppeals.typeTags"
            :key="index"
          >
            {{ item.name }}
          </el-tag>
        </div>
        <div
          class="issue-class-box panel-row"
          v-for="checkItem in photoItem.photoAppeals.checkPoolTags"
          :key="checkItem.id"
        >
          <div class="label-title">{{ checkItem.name }}</div>
          <div class="label-box">
            <el-tag size="medium" v-for="issueItem in checkItem.child" :key="issueItem.id">{{ issueItem.name }}</el-tag>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="appealInfo.appealType === APPEAL_TYPE.EVALUATE"
      class="panel-box"
    >
      <!-- 复审后的评分 -->
      <div class="panel-main" v-if="secondEvaluateResult.hasSecond">
        <div class="panel-content content-one">
          复审后评分
          <el-tag :class="['type-tag', secondEvaluateResult.class]" size="medium">
            {{ secondEvaluateResult.name }}
          </el-tag>
          <el-tag
            v-for="(typeTagItem, index) in secondEvaluateResult.typeTag"
            :key="index"
            class="type-tag"
            size="medium"
          >
            {{ typeTagItem }}
          </el-tag>
        </div>
        <div class="issue-class-box panel-row" v-for="tagItem in secondEvaluateResult.tags" :key="tagItem.id">
          <div class="label-title">{{ tagItem.name }}</div>
          <div class="label-box">
            <el-tag size="medium" v-for="issueItem in tagItem.child" :key="issueItem.id">{{ issueItem.name }}</el-tag>
          </div>
        </div>
      </div>
    </div>
    <!-- 申诉信息 -->
    <div
      class="panel-box"
      v-if="appealInfo.appealType !== APPEAL_TYPE.TIMEOUT"
    >
      <div class="panel-title">
        申诉处理
        <el-button
          size="mini"
          type="primary"
          @click="goCheck('first')"
          v-if="checkType === 'first'"
        >
          初审
        </el-button>
        <el-button
          size="mini"
          type="primary"
          @click="goCheck('second')"
          v-if="checkType === 'second'"
        >
          复审
        </el-button>
      </div>
      <div class="panel-main">
        <div class="panel-content content-one">申诉问题描述：{{ photoItem.photoAppeals.desc }}</div>
        <div class="panel-content content-one">初审状态：{{ photoItem.photoAppeals.firstResult.resultDesc }}</div>
        <div
          class="panel-content content-one"
          v-if="photoItem.photoAppeals.firstResult.result === APPEAL_RESULT_STATUS.REFUSE"
        >
          初审拒绝原因：{{ photoItem.photoAppeals.firstResult.reason }}
        </div>
        <div
          class="panel-content content-one"
          v-if="photoItem.photoAppeals.firstResult.result === APPEAL_RESULT_STATUS.ACCEPT"
        >
          初审通过备注：{{ photoItem.photoAppeals.firstResult.reason }}
        </div>
        <div class="panel-content content-one">复审状态：{{ photoItem.photoAppeals.secondResult.resultDesc }}</div>
        <div
          class="panel-content content-one"
          v-if="photoItem.photoAppeals.secondResult.result === APPEAL_RESULT_STATUS.REFUSE"
        >
          复审拒绝原因：{{ photoItem.photoAppeals.secondResult.reason }}
        </div>
        <div
          class="panel-content content-one"
          v-if="photoItem.photoAppeals.secondResult.result === APPEAL_RESULT_STATUS.ACCEPT"
        >
          复审通过备注：{{ photoItem.photoAppeals.secondResult.reason }}
        </div>
      </div>
    </div>
    <preview-photo
      v-if="showPreview"
      :imgarray="priviewPhotoData"
      show-return-reson
      :orderindex="imgIndex"
      show-order-info
      :show-preview.sync="showPreview"
      @saveResult="saveResult"
      :check-type="checkType"
      :photo-appeal="photoItem.photoAppeals"
      :appeal-info="appealInfo"
      :photo-info="photoInfo"
    />
  </div>
</template>

<script>
import PhotoList from '@/components/PhotoList'
import PreviewPhoto from './PreviewPhoto/index.vue'
import PreviewModel from '@/model/PreviewModel'

import { mapGetters } from 'vuex'

import { APPEAL_RESULT_STATUS, PHOTO_VERSION, AppealResultStatusPhotoEnum, APPEAL_TYPE } from '@/utils/enumerate'

export default {
  name: 'PhotoDetail',
  components: { PhotoList, PreviewPhoto },
  props: {
    photoItem: { type: Object, required: true },
    appealInfo: { type: Object, required: true },
    checkType: { type: String, default: '' },
    photoInfo: { type: Object, required: true }
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
      APPEAL_RESULT_STATUS,
      APPEAL_TYPE,
      secondEvaluateResult: {} // 复审后的数据
    }
  },
  computed: {
    imgIndex () {
      let finalIndex = 0
      const appealType = this.appealInfo.appealType
      this.photoVersionList.forEach((photoVersion, photoVersionIndex) => {
        // 默认预览index: 质量申诉为质量照片 评分评分申诉为成片
        if (appealType === APPEAL_TYPE.REWORK && photoVersion.version === PHOTO_VERSION.STORE_REWORK) {
          finalIndex = photoVersionIndex
        }
        if (appealType === APPEAL_TYPE.EVALUATE && photoVersion.version === PHOTO_VERSION.COMPLETE_PHOTO) {
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
      const appealType = this.appealInfo.appealType
      let finalPhoto = {}
      if (appealType === APPEAL_TYPE.REWORK) {
        finalPhoto = this.priviewPhotoData.filter(priviewPhotoItem => priviewPhotoItem.id === this.photoVersionId)[0]
      }
      if (appealType === APPEAL_TYPE.EVALUATE) {
        finalPhoto = this.priviewPhotoData.filter(priviewPhotoItem => priviewPhotoItem.version === PHOTO_VERSION.COMPLETE_PHOTO)[0]
      }
      return finalPhoto
    },
    ...mapGetters(['imgDomain', 'imgCompressDomain']),
    // 云学院标记
    checkTag () {
      const tagArr = this.photoItem.photoAppeals.checkPoolTags
      const tagFilter = tagArr.map(item => item.name)
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
      const { type, result, reason, appealType, labelData, labelDataTop, sendData } = resultObj
      if (type === 'first') {
        this.photoItem.photoAppeals.firstResult = {
          id: this.photoItem.photoAppeals.id,
          result,
          reason,
          resultDesc: AppealResultStatusPhotoEnum[result]
        }
      }
      // 质量问题复审
      if (type === 'second' && appealType === APPEAL_TYPE.REWORK) {
        this.photoItem.photoAppeals.secondResult = {
          id: this.photoItem.photoAppeals.id,
          result,
          reason,
          resultDesc: AppealResultStatusPhotoEnum[result]
        }
        if (result === 'refuse') {
          this.realPhotoData.storePartReworkReason.forEach(partReasonItem => {
            partReasonItem.reasonManage.forEach(reasonItem => {
              reasonItem.cancel = false
            })
          })
          this.realPhotoData.storeReworkReasonManage.forEach(reasonItem => {
            reasonItem.cancel = false
          })
        }
        if (resultObj.storePartReworkReason) this.realPhotoData.storePartReworkReason = resultObj.storePartReworkReason
        if (resultObj.storeReworkReasonManage) this.realPhotoData.storeReworkReasonManage = resultObj.storeReworkReasonManage
      }
      // 评分问题复审
      if (type === 'second' && appealType === APPEAL_TYPE.EVALUATE) {
        this.photoItem.photoAppeals.secondResult = {
          id: this.photoItem.photoAppeals.id,
          result,
          reason,
          resultDesc: AppealResultStatusPhotoEnum[result]
        }
        this.realPhotoData.sendData = sendData
        this.realPhotoData.otherData = {} // 存放选中的标签对象
        if (result === 'accept') {
          const finalLabelType = labelDataTop.filter(labelDataTopItem => labelDataTopItem.isSelect)[0]
          const tempTag = []
          const tempTypeTag = []
          this.secondEvaluateResult.hasSecond = true
          this.secondEvaluateResult.name = finalLabelType.name
          this.secondEvaluateResult.class = finalLabelType.class
          labelData.forEach(labelDataItem => {
            if (!labelDataItem.isGoodWord) { // 普通标签
              const filterLabelArr = labelDataItem.child.filter(childItem => childItem.isSelect)
              if (filterLabelArr.length) {
                labelDataItem.child = filterLabelArr
                tempTag.push(labelDataItem)
              }
            }
            if (labelDataItem.isGoodWord) { // 激励词
              labelDataItem.child.forEach(childItem => {
                if (childItem.isSelect) tempTypeTag.push(childItem.name)
              })
            }
          })
          this.secondEvaluateResult.tags = tempTag // 普通问题标签
          this.secondEvaluateResult.typeTag = tempTypeTag // 激励词
        } else { // 拒绝的话reset secondEvaluateResult
          this.secondEvaluateResult = {}
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>

@panelTitleWidth: 185px;

.photo-detail {
  .panel-title {
    margin-bottom: 20px;

    &.evaluate {
      display: flex;
      justify-content: space-between;
    }

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

        .evaluate-item {
          margin-right: 16px;
          margin-bottom: 10px;
        }

        .reason-item {
          display: inline-block;
          padding: 4px;
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
