<template>
  <div class="photo-detail">
    <!-- 图片列表-->
    <photo-list
      class="photo-module"
      need-preload
      :photo-data="photoVersionList"
      :show-special-effects="false"
    />

    <!-- 质量问题标签 -->
    <!-- <AppealStoreReturnInfo
      v-if="appealInfo.appealType === APPEAL_TYPE.REWORK"
      :photoData="realPhotoData"
    /> -->
    <div
      class="appeal-store-return-info"
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
                v-if="reasonManageItem.cancel && !reasonManageItem.isDel"
                class="red"
              >
                (标记删除)
              </span>
            </div>
          </div>
        </div>
        <div class="panel-content content-one">
          局部退回备注：
          <span
            v-for="(storePartReworkReasonItem, index) in realPhotoData.storePartReworkReason"
            :key="index"
          >
            {{ storePartReworkReasonItem.note }}
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
      v-if="appealInfo.appealType === APPEAL_TYPE.EVALUATE"
      class="panel-box evaluate-box"
    >
      <div class="panel-title eval uate">
        <span>评价信息</span>
      </div>
      <div class="panel-main">
        <div class="evaluate-score" v-if="photoItem.photoAppeals.oldCheckPoolScore">
          <div class="panel-row">首次评分：{{ photoItem.photoAppeals.oldCheckPoolScore }}</div>
          <div class="issue-class-box panel-row">
            <el-tag
              class="label-tag"
              size="medium"
              v-for="labelItem in photoItem.photoAppeals.oldCheckPoolTags"
              :key="labelItem.id"
              :class="labelItem.type"
            >
              {{ labelItem.name }}
            </el-tag>
          </div>
        </div>
        <div class="evaluate-score" v-if="photoItem.photoAppeals.newCheckPoolScore">
          <div class="panel-row">复审评分：{{ photoItem.photoAppeals.newCheckPoolScore }}</div>
          <div class="issue-class-box panel-row">
            <el-tag
              class="label-tag"
              size="medium"
              v-for="labelItem in photoItem.photoAppeals.newCheckPoolTags"
              :key="labelItem.id"
              :class="labelItem.type"
            >
              {{ labelItem.name }}
            </el-tag>
          </div>
        </div>

        <!-- 复审后的评分 临时缓存 -->
        <div class="evaluate-score" v-if="secondEvaluateResult.hasSecond">
          <div class="panel-row">复审标签</div>
          <div class="issue-class-box panel-row">
            <el-tag
              class="label-tag"
              size="medium"
              v-for="labelItem in secondEvaluateResult.lableList"
              :key="labelItem.id"
              :class="labelItem.type"
            >
              {{ labelItem.name }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 申诉信息 -->
    <AppealRecordInfo
      v-if="appealInfo.appealType !== APPEAL_TYPE.TIMEOUT"
      :appeal-record-data="photoItem.photoAppeals"
    >
      <template v-slot:appealPlug>
        <div class="header-plug" >
          <el-button
            v-if="checkType"
            size="mini"
            type="primary"
            @click="goCheck()"
          >
            {{ checkType === 'first' ? '初审' : '复审' }}
          </el-button>
        </div>
      </template>
    </AppealRecordInfo>

    <!-- 预览 -->
    <PreviewPhoto
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
import AppealRecordInfo from './AppealRecordInfo.vue'
import AppealStoreReturnInfo from './AppealStoreReturnInfo.vue'

import PreviewModel from '@/model/PreviewModel'

import { mapGetters } from 'vuex'

import { APPEAL_RESULT_STATUS, PHOTO_VERSION, AppealResultStatusPhotoEnum, APPEAL_TYPE } from '@/utils/enumerate'

export default {
  name: 'PhotoDetail',
  // 暂时注释
  // eslint-disable-next-line vue/no-unused-components
  components: { PhotoList, PreviewPhoto, AppealRecordInfo, AppealStoreReturnInfo },
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
      photoVersionId: '',
      APPEAL_RESULT_STATUS,
      APPEAL_TYPE,
      secondEvaluateResult: {} // 复审后的数据
    }
  },
  computed: {
    ...mapGetters(['imgDomain', 'imgCompressDomain']),
    imgIndex () {
      let finalIndex = 0
      const appealType = this.appealInfo.appealType
      this.photoVersionList.forEach((photoVersion, photoVersionIndex) => {
        // 默认预览index: 质量申诉为质量照片 评分评分申诉为成片
        if (appealType === APPEAL_TYPE.REWORK && photoVersion.version === PHOTO_VERSION.STORE_REWORK) {
          finalIndex = photoVersionIndex
        }
        if (appealType === APPEAL_TYPE.EVALUATE && photoVersion.version === PHOTO_VERSION.FIRST_PHOTO) {
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
    // 最后的照片数据
    realPhotoData () {
      const appealType = this.appealInfo.appealType
      let finalPhoto = {}
      if (appealType === APPEAL_TYPE.REWORK) {
        finalPhoto = this.priviewPhotoData.filter(priviewPhotoItem => priviewPhotoItem.id === this.photoVersionId)[0]
      }
      if (appealType === APPEAL_TYPE.EVALUATE) {
        finalPhoto = this.priviewPhotoData.filter(priviewPhotoItem => priviewPhotoItem.version === PHOTO_VERSION.FIRST_PHOTO)[0]
      }
      return finalPhoto
    },
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
    goCheck () {
      this.showPreview = true
    },
    /**
     * @description 接受预览组件的审核结果
     */
    saveResult (resultObj) {
      const resultObjType = resultObj.type
      if (resultObjType === 'first') this.saveFirstResult(resultObj)
      // 复审相关
      if (resultObjType !== 'second') return
      // 质量问题复审
      if (resultObj.appealType === APPEAL_TYPE.REWORK) {
        this.saveStoreRework(resultObj)
      }
      // 评分问题复审
      if (resultObj.appealType === APPEAL_TYPE.EVALUATE) {
        this.saveEvaluateAppealInfo(resultObj)
      }
    },
    /**
     * @description 更改prop数据,保存第一次审核结果
     */
    saveFirstResult (resultObj) {
      this.photoItem.photoAppeals.firstResult = {
        id: this.photoItem.photoAppeals.id,
        result: resultObj.result,
        reason: resultObj.reason,
        resultDesc: AppealResultStatusPhotoEnum[resultObj.result]
      }
    },
    /**
     * @description 保存第二次退单申诉记录
     */
    saveStoreRework (resultObj) {
      this.photoItem.photoAppeals.secondResult = {
        id: this.photoItem.photoAppeals.id,
        result: resultObj.result,
        reason: resultObj.reason,
        resultDesc: AppealResultStatusPhotoEnum[resultObj.result]
      }

      if (resultObj.result === 'refuse') {
        this.realPhotoData.storePartReworkReason.forEach(partReasonItem => {
          partReasonItem.reasonManage.forEach(reasonItem => {
            reasonItem.cancel = false
          })
        })
        this.realPhotoData.storeReworkReasonManage.forEach(reasonItem => {
          reasonItem.cancel = false
        })
      }
      // 如果更改局部退单标记更改
      if (resultObj.storePartReworkReason) {
        this.realPhotoData.storePartReworkReason = resultObj.storePartReworkReason
      }
      // 如果整体退单标记更改
      if (resultObj.storeReworkReasonManage) {
        this.realPhotoData.storeReworkReasonManage = JSON.parse(JSON.stringify(resultObj.storeReworkReasonManage))
      }
    },
    /**
     * @description 保存云学院相关更改
     */
    saveEvaluateAppealInfo (resultObj) {
      this.photoItem.photoAppeals.secondResult = {
        id: this.photoItem.photoAppeals.id,
        result: resultObj.result,
        reason: resultObj.reason,
        resultDesc: AppealResultStatusPhotoEnum[resultObj.result]
      }
      this.realPhotoData.sendData = resultObj.sendData
      if (resultObj.result === 'accept') {
        this.secondEvaluateResult.hasSecond = true
        this.secondEvaluateResult.lableList = resultObj.labelData
      } else {
        // 拒绝的话reset secondEvaluateResult
        this.secondEvaluateResult = {}
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

  .photo-module {
    margin-right: -24px;
  }

  .appeal-store-return-info {
    margin-top: 20px;
    font-size: 14px;
    color: #303133;

    .panel-row {
      padding: 16px 0 0;
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
      padding: 0 20px 20px;
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

  .evaluate-box {
    margin-bottom: 20px;
  }

  .panel-box {
    margin-top: 20px;
    font-size: 14px;
    color: #303133;

    .issue-class-box {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: -10px;

      .label-title {
        flex-shrink: 0;
        margin: 0 20px 0 0;
        font-size: 14px;
        font-weight: 600;
        line-height: 28px;
        color: #303133;
      }

      .label-tag {
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
      padding: 16px 0 0;
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
      padding: 0 20px 20px;
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
