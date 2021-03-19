<template>
  <div class="photoShow">
    <div class="title">
      {{ showPhoto.version | toPhotoVerName }}{{ showPhoto.storeReturnCount || '' }}
      <div class="btn-right">
        <button
          id="closeImg"
          type="button"
          class="button-close"
          @click="closePreview"
        >
          <i class="el-icon-close" />
        </button>
      </div>
    </div>
    <mode-switch-box
      v-if="showPhoto.versionCache"
      v-model="photoArray[photoIndex].mode"
      :show-store-mode="showPhoto.hasStoreReturnTag"
      :show-cloud-mode="showPhoto.hasCommitInfo"
      class="mode-switch-box"
    />
    <div class="photoBox" v-loading="loading">
      <!-- 左侧 -->
      <div class="left-module">
        <!-- 缩略图 -->
        <div id="smallImg" v-loading="loading" class="small-img">
          <div v-show="isShow" class="breviary-photo">
            <div class="smallPhoto">
              <div id="img-box" style="position: relative;">
                <img
                  ref="smallImg"
                  :src="showPhoto.src"
                  alt="缩略图"
                  @mousemove="handMove"
                  @mouseover="handOver"
                  @mouseout="handOut"
                >
                <div ref="magnifier_zoom" class="_magnifier_zoom" />
              </div>
            </div>
            <div class="contant">
              <el-slider :show-tooltip="false" v-model="scaleNum" />
              <span class="scale-box">{{ scaleNum * 4 + 100 }}%</span>
              <span class="down-button" @click.stop="downing">下载</span>
            </div>
            <div class="mark-show-btn" v-if="!isOriginalMode">
              <el-button
                class="tag-btn"
                id="tagShowBtn"
                @click="showMarkPhoto"
                :class="!tagShow && 'tag-show-btn'"
                type="info"
              >
                {{ tagShow ? '隐藏标记' : '显示标记' }}
              </el-button>
            </div>
          </div>
        </div>

        <!-- 工具 -->
        <MarkTool
          v-if="isCloudEvaluate && isSecondCheck && checkResult === CHECK_RESULT_TYPE.ACCEPT"
          @changeTool="changeDrawType"
          :canvas-option="canvasOption"
        />

        <!-- 订单信息 -->
        <order-info-module v-if="showOrderInfo" :order-info="photoInfo" show-other-note />
      </div>

      <!-- 图片 -->
      <div class="photo-show" ref="photo-show">
        <div
          v-loading="loading"
          class="orginPhoto"
          ref="photo-show-main"
          @click.stop="zoom"
          :style="photoZoomStyle + (inZoomIn && 'cursor: zoom-out;')"
        >
          <img
            id="orginImg"
            ref="orgin-img"
            :src="showPhoto.src"
            :alt="showPhoto.title"
            @load="loadingPhoto"
          />
          <FabricCanvas
            v-if="showCanvas"
            ref="fabric-canvas"
            :style="photoZoomStyle"
            :option-obj="canvasOption"
            :show-canvas="isFirstPhoto"
            @click.native="zoom"
          />
          <!-- 门店退回显示 -->
          <div
            v-if="showPhoto.hasStoreReturnTag"
            v-show="showStoreReson"
            class="sign-dom"
            :style="{
              width: `${showImageRect.width}px`,
              height: `${showImageRect.height}px`
            }"
          >
            <div
              v-for="(labelItem, labelIndex) in showPhoto.storePartReworkReason"
              :class="['sign-item', labelItem.isNeedDownIndex ? 'less-index' : '' ]"
              :key="labelIndex"
              :style="{
                position: 'absolute',
                width: `${labelItem.width}%`,
                height: `${labelItem.height}%`,
                top: `${labelItem.location[0]}%`,
                left: `${labelItem.location[1]}%`,
              }"
            >
              <div class="circle-box" @click.stop="lessIndex(labelItem)" :style="{ color: labelItem.brushColor }"></div>
              <div :class="['retouch-reason', labelItem.labelClass]">
                <div class="part-reason-list">
                  <div
                    v-for="(itemsub, indexsub) in labelItem.reasonManage"
                    :key="indexsub"
                    :class="['reason-tag-common part-tag', itemsub.isDel ? 'deleted' : '']"
                  >
                    <span>{{ itemsub.name }}</span>
                    <span
                      v-if="checkType === APPEAL_CHECK_STATUS.SECOND && !itemsub.cancel"
                      @click.stop="delReason(itemsub)"
                      class="red"
                    >删除
                    </span>
                    <span
                      v-if="checkType === APPEAL_CHECK_STATUS.SECOND && itemsub.cancel && !itemsub.isDel"
                      @click.stop="cancelDelReason(itemsub)"
                      class="red"
                    >(标记删除)
                    </span>
                    <span
                      v-if="checkType === APPEAL_CHECK_STATUS.SECOND && itemsub.cancel && itemsub.isDel"
                      @click.stop="cancelDelReason(itemsub)"
                      class="red"
                    >(已删除)
                    </span>
                  </div>
                </div>
                <div class="detail-box" v-if="labelItem.note">
                  <p class="triangle-left"></p>
                  <span class="detail-content">{{ labelItem.note }}</span>
                </div>
              </div>
            </div>
          </div>
          <div ref="magnifier_layer" id="_magnifier_layer" />
        </div>
        <button
          v-if="photoArray.length !== 1"
          type="button"
          class="button-left"
          @click.stop="prePhoto"
        >
          <i class="el-icon-arrow-left" />
        </button>
        <button
          v-if="photoArray.length !== 1"
          type="button"
          class="button-right"
          @click.stop="nextPhoto"
        >
          <i class="el-icon-arrow-right" />
        </button>
      </div>
      <!-- 右边栏 -->
      <div class="photo-mark">
        <div class="scroll-box">
          <!-- 申诉理由 -->
          <div class="order-label">
            <div class="order-header">
              <div class="panel-title">申诉问题</div>
            </div>
            <div class="appeal-info">
              <div class="appeal-item">
                <div class="name">申诉类型：</div>
                <div>{{ appealInfo.appealTypeName }}</div>
              </div>
              <div class="appeal-item">
                <div class="name">问题描述：</div>
                <div>{{ photoAppeal.desc }}</div>
              </div>
            </div>
          </div>

          <!-- 云学院复审时的重评 -->
          <div
            v-if="isCloudEvaluate && isSecondCheck && checkResult === CHECK_RESULT_TYPE.ACCEPT"
            class="label-top"
          >
            <GradeLabel class="scroll-box" />
          </div>

          <!-- 质量问题类型 -->
          <div class="order-label store-return-reson" v-if="showPhoto.hasStoreReturnTag">
            <div class="label-title">照片整体原因</div>
            <div class="reason-contain">
              <div class="whole-reason-list">
                <template v-if="showPhoto.storeReworkReasonManage.length">
                  <div
                    v-for="(labelItem, labelIndex) in showPhoto.storeReworkReasonManage"
                    :key="labelIndex"
                    :class="['reason-tag-common whole-tag', labelItem.isDel ? 'deleted' : '']"
                  >
                    <span>{{ labelItem.name }}</span>
                    <span
                      v-if="checkType === APPEAL_CHECK_STATUS.SECOND && !labelItem.cancel"
                      @click.stop="delReason(labelItem)"
                      class="red"
                    >删除
                    </span>
                    <span
                      v-if="checkType === APPEAL_CHECK_STATUS.SECOND && labelItem.cancel && !labelItem.isDel"
                      @click.stop="cancelDelReason(labelItem)"
                      class="red"
                    >(标记删除)
                    </span>
                    <span
                      v-if="checkType === APPEAL_CHECK_STATUS.SECOND && labelItem.cancel && labelItem.isDel"
                      @click.stop="cancelDelReason(labelItem)"
                      class="red"
                    >(已删除)
                    </span>
                  </div>
                </template>
                <span v-else class="reason-note">暂无原因</span>
              </div>
              <p class="tips">整体原因备注：</p>
              <p class="reason-note">{{ showPhoto.storeReworkNote }}</p>
            </div>
          </div>

          <div class="submit-box">
            <div v-if="!checkResult" class="not-refusing">
              <el-button type="danger" @click="showRefuse">审核拒绝</el-button>
              <el-button type="primary" @click="showAccept">审核通过</el-button>
            </div>

            <!-- 抽片问题复审通过操作 -->
            <div
              v-if="isCloudEvaluate && isSecondCheck && checkResult === CHECK_RESULT_TYPE.ACCEPT"
              class="refusing"
            >
              <el-button type="info" @click="cancelAccept">取消</el-button>
              <el-button type="primary" @click="saveEvaluateAccept">保存并关闭</el-button>
            </div>

            <!-- 质量问题通过或评分问题第一次通过显示 -->
            <div
              v-if="showAcceptTextarea && checkResult === CHECK_RESULT_TYPE.ACCEPT"
              class="accepting"
            >
              <el-input
                type="textarea"
                :rows="4"
                maxlength="50"
                placeholder="审核通过备注(非必填), 最多50个字"
                v-model="acceptTextarea"
              >
              </el-input>
              <el-button type="info" @click="cancelAccept">取消</el-button>
              <el-button type="primary" @click="saveReworkAccept">保存并关闭</el-button>
            </div>

            <!-- 审核拒绝拒绝操作 -->
            <div
              v-if="showRefuseTextarea && checkResult === CHECK_RESULT_TYPE.REFUSE"
              class="refusing"
            >
              <el-input
                type="textarea"
                :rows="4"
                maxlength="50"
                placeholder="审核拒绝原因(必填), 最多50个字"
                v-model="refuseTextarea"
              >
              </el-input>
              <el-button type="info" @click="hideRefuse">取消</el-button>
              <el-button type="primary" @click="saveRefuse">保存并关闭</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DownIpc from '@electronMain/ipc/DownIpc'
import OrderInfoModule from '@AssessmentComponents/components/GradePreview/OrderInfoModule'
import ModeSwitchBox from './ModeSwitchBox'
import FabricCanvas from '@AssessmentComponents/components/GradePreview/FabricCanvas.vue'
import GradeLabel from '@AssessmentComponents/components/GradePreview/GradeLabel.vue'
import MarkTool from '@AssessmentComponents/components/GradePreview/MarkTool.vue'

import PreviewMix from '@/mixins/preview-mixins'
import canvasMix from '@AssessmentComponents/components/GradePreview/keyDownEventMix.js'

import { TOOL_TYPE } from '@AssessmentComponents/components/GradePreview/ToolEnumerate.js'
import { APPEAL_CHECK_STATUS, APPEAL_TYPE, PHOTO_VERSION } from '@/utils/enumerate'
import { mapGetters } from 'vuex'

// 审核枚举值
const CHECK_RESULT_TYPE = {
  REFUSE: 'refuse', // 拒绝
  ACCEPT: 'accept' // 通过
}

export default {
  name: 'PreviewPhoto',
  components: { OrderInfoModule, ModeSwitchBox, FabricCanvas, GradeLabel, MarkTool },
  mixins: [PreviewMix, canvasMix],
  provide () {
    return {
      judageCanvas: this.createCanvas
    }
  },
  props: {
    imgarray: {
      type: Array,
      default () {
        return [
          {
            src: '',
            title: '没有接收到图片'
          }
        ]
      }
    },
    orderindex: { type: Number, default: 0 },
    checkType: { type: String, default: '' },
    showOrderInfo: { type: Boolean, default: false },
    photoAppeal: { type: Object, require: true },
    appealInfo: { type: Object, require: true },
    photoInfo: { type: Object, require: true }
  },
  data () {
    return {
      APPEAL_TYPE,
      PHOTO_VERSION,
      APPEAL_CHECK_STATUS,
      CHECK_RESULT_TYPE,
      photoIndex: this.orderindex,
      showCanvas: false,
      showImageRect: { // 当前展示图片宽度信息
        width: 0,
        height: 0
      },
      photoArray: [], // 展示数组
      showMark: false, // mark图显示
      showStoreReson: false, // 是否显示门店退回标记
      showRefuseTextarea: false, // 是否显示审核拒绝文本框
      showAcceptTextarea: false, // 是否显示审核通过框
      refuseTextarea: '', // 审核拒绝短语
      acceptTextarea: '', // 审核通过描述
      checkResult: '', // 审核状态 CHECK_RESULT_TYPE
    }
  },
  computed: {
    ...mapGetters(['imgDomain']),
    // 正在展示图片
    showPhoto () {
      return this.photoArray[this.photoIndex] || {}
    },
    // original 原片 complete 门店退回 cloudLabel 云学院
    mode () {
      return this.showPhoto.mode || 'original'
    },
    // 标记图片
    markPhoto () {
      return this.imgDomain + this.showPhoto.commitInfo.picUrl
    },
    // 是否是原始模式
    isOriginalMode () {
      return this.mode === 'original'
    },
    tagShow () {
      return this.mode === 'complete' ? this.showStoreReson : this.showMark
    },
    // 是否最新修片
    isFirstPhoto () {
      return this.showPhoto.version === PHOTO_VERSION.FIRST_PHOTO
    },
    // 删除标签数量
    delLabelNum () {
      let num = 0
      this.showPhoto.storePartReworkReason.forEach(reasonPart => {
        reasonPart.reasonManage.forEach(reasonItem => {
          if (reasonItem.cancel && !reasonItem.isDel) num += 1
        })
      })
      this.showPhoto.storeReworkReasonManage.forEach(reasonItem => {
        if (reasonItem.cancel && !reasonItem.isDel) num += 1
      })
      return num
    },
    // 是否是第二次审核
    isSecondCheck () {
      return this.checkType === APPEAL_CHECK_STATUS.SECOND
    },
    // 是否是抽查申述
    isCloudEvaluate () {
      return this.appealInfo.appealType === APPEAL_TYPE.EVALUATE
    }
  },
  watch: {
    // 展示图片数组
    imgarray: {
      handler (val) {
        this.photoArray = JSON.parse(JSON.stringify(val))
      },
      immediate: true
    },
    orderindex: {
      handler: function (val) {
        this.photoIndex = val
      },
      immediate: true
    },
    mode: {
      handler (val) {
        if (val === 'original') {
          this.showStoreReson = false
          this.showMark = false
          if (!this.showPhoto.versionCache) return false
          const originalPhotoPath = this.showPhoto.versionCache.original_photo.path
          this.showPhoto.src = this.imgDomain + originalPhotoPath
          this.showPhoto.version = PHOTO_VERSION.ORIGINAL_PHOTO
        } else if (val === 'complete') {
          this.showStoreReson = true
          if (!this.showPhoto.versionCache) return false
          const completePhotoPath = this.showPhoto.versionCache.store_rework.path
          this.showPhoto.src = this.imgDomain + completePhotoPath
          this.showPhoto.version = PHOTO_VERSION.STORE_REWORK
        } else {
          this.showMark = true
          if (!this.showPhoto.versionCache) return false
          const completePhotoPath = this.showPhoto.versionCache.store_rework.path
          this.showPhoto.src = this.imgDomain + completePhotoPath
          this.showPhoto.version = PHOTO_VERSION.FIRST_PHOTO
        }
      },
      immediate: true
    }
  },
  methods: {
    /**
     * @description 标签关闭
     */
    tagClose (tagInfo) {
      this.$refs['fabric-canvas'].deleteLabel(tagInfo)
    },
    /**
     * @description 显示标记
     */
    showMarkPhoto () {
      if (this.mode === 'complete') this.showStoreReson = !this.showStoreReson
      if (this.mode === 'cloudLabel') this.showMark = !this.showMark
    },
    /**
     * @description 取消加载
     */
    loadingPhoto (e) {
      this.imgObj = this.$refs['smallImg']
      this.imgBigObj = this.$refs['orgin-img']
      this.showImageRect.width = this.imgBigObj && this.imgBigObj.clientWidth
      this.showImageRect.height = this.imgBigObj && this.imgBigObj.clientHeight
      this.loading = false
    },
    /**
     * @description 关闭图片
     */
    closePreview () {
      this.$emit('update:showPreview', false)
    },
    /**
     * @description 下载图片
     */
    downing () {
      const pointIndex = this.showPhoto.src.lastIndexOf('!')
      const path = ''
      const url = pointIndex > 0 ? this.showPhoto.src.substring(0, pointIndex) : this.showPhoto.src
      const data = { url, path }
      this.$newMessage.success('已添加一张照片到下载')
      DownIpc.addDownloadFile(data)
    },
    /**
     * @description 删除标记
     */
    delReason (item) {
      item.cancel = true
    },
    /**
     * @description 取消删除标记
     */
    cancelDelReason (item) {
      if (item.isDel) return
      this.resetRefuse()
      item.cancel = false
    },
    /**
     * @description 展示拒绝原因输入
     */
    showRefuse () {
      this.checkResult = CHECK_RESULT_TYPE.REFUSE
      this.showRefuseTextarea = true
    },
    /**
     * @description 审核通过
     */
    showAccept () {
      this.checkResult = CHECK_RESULT_TYPE.ACCEPT

      const appeealType = this.appealInfo.appealType
      switch (appeealType) {
        case APPEAL_TYPE.REWORK:
          this.showAcceptTextarea = true
          break
        case APPEAL_TYPE.EVALUATE:
          if (this.checkType === APPEAL_CHECK_STATUS.FIRST) this.showAcceptTextarea = true
          if (this.checkType === APPEAL_CHECK_STATUS.SECOND) {
            document.getElementsByClassName('scroll-box')[0].scrollTop = 1000
          }
          break
        default:
          break
      }
    },
    /**
     * @description 隐藏拒绝原因输入
     */
    hideRefuse () {
      this.checkResult = ''
      this.showRefuseTextarea = false
    },
    /**
     * @description 重置拒绝原因数据
     */
    cancelAccept () {
      const appeealType = this.appealInfo.appealType
      this.checkResult = ''
      switch (appeealType) {
        case APPEAL_TYPE.REWORK:
          this.showAcceptTextarea = false
          break
        case APPEAL_TYPE.EVALUATE:
          this.showCanvas = false
          this.showAcceptTextarea = false
          break
        default:
          break
      }
    },
    /**
     * @description 保存拒绝原因输入
     */
    saveRefuse () {
      if (!this.refuseTextarea) return this.$newMessage.warning('拒绝原因还没有填写')
      this.emitResult(CHECK_RESULT_TYPE.REFUSE)
      this.hideRefuse()
    },
    /**
     * @description 保存质量问题申诉复核通过备注
     */
    saveReworkAccept () {
      if (this.checkType === APPEAL_CHECK_STATUS.SECOND) {
        // 复审一定要勾选删除标签
        if (!this.delLabelNum) {
          this.$newMessage.warning('必须要删除至少一个标签')
          return
        }
      }
      this.emitResult(CHECK_RESULT_TYPE.ACCEPT)
      this.cancelAccept()
    },
    /**
     * @description 通知审核结果
     */
    async emitResult (type, evvaluateData) {
      const appealType = this.appealInfo.appealType
      const result = {
        result: this.checkResult, // 审核结果
        type: this.checkType, // 初审或者复审
        appealType
      }
      if (this.refuseTextarea) result.reason = this.refuseTextarea
      if (this.acceptTextarea) result.reason = this.acceptTextarea

      const isAccept = type === CHECK_RESULT_TYPE.ACCEPT
      const isAcceptAndSecond = isAccept && this.isSecondCheck
      // 质量复审
      if (isAcceptAndSecond && appealType === APPEAL_TYPE.REWORK) {
        result.storePartReworkReason = this.showPhoto.storePartReworkReason
        result.storeReworkReasonManage = this.showPhoto.storeReworkReasonManage
      }
      // 云学院评分申诉
      if (isAcceptAndSecond && appealType === APPEAL_TYPE.EVALUATE) {
        result.labelData = evvaluateData.lableList
        result.sendData = evvaluateData.sendData
      }
      this.$emit('saveResult', result)
      this.closePreview()
    },
    /**
     * @description 重置拒绝原因
     */
    resetRefuse () {
      this.refuseTextarea = ''
    },
    /**
     * @description 点击后降低层级
     */
    lessIndex (storePartItem) {
      this.showPhoto.storePartReworkReason.map(partItem => {
        partItem.isNeedDownIndex = false
      })
      storePartItem.isNeedDownIndex = true
    },
    /**
     * @description 创建canvas
     */
    createCanvas (drawType) {
      if (!this.isFirstPhoto) {
        this.$newMessage.warning('请在一次成片上进行评分')
        return false
      }
      if (!this.showCanvas) {
        this.getImgInfo()
        this.showCanvas = true
        if (drawType) { this.$nextTick(() => { this.changeDrawType(drawType) }) }
      }
      return true
    },
    /**
     * @description 更改画笔类型
     */
    changeDrawType (drawInfo) {
      if (!this.$parent.showPreview) return false
      if (!this.isCloudEvaluate || !this.isSecondCheck || this.checkResult !== CHECK_RESULT_TYPE.ACCEPT) return false
      const { type, value } = drawInfo

      if (type === TOOL_TYPE.COLOR) {
        this.canvasOption.penColor = value
        return
      }

      if (type !== TOOL_TYPE.BLOWUP && !this.showCanvas) {
        this.createCanvas(drawInfo)
        return
      }
      if (type === TOOL_TYPE.BLOWUP && this.inZoomIn) {
        this.$refs['fabric-canvas'].$el.style.cursor = 'zoom-out'
      }
      this.canvasOption.drawType = type
    },
    // 云学院抽查相关
    /**
     * @description 保存评分问题申诉复核通过
     */
    async saveEvaluateAccept () {
      try {
        // 获取批注图片
        let markPhotoImg = ''
        if (this.showCanvas && this.$refs['fabric-canvas'].hasDraw()) {
          markPhotoImg = await this.$refs['fabric-canvas'].outPhoto()
        }
        // 获取标签数据
        const lableInfo = this.getActiveLableId()
        this.showCanvas = false
        this.canvasOption.drawType = ''
        const evvaluateData = {
          sendData: {
            tags: lableInfo.ids,
            picUrl: markPhotoImg
          },
          lableList: lableInfo.labelData
        }
        this.emitResult(CHECK_RESULT_TYPE.ACCEPT, evvaluateData)
        this.resetLabelData()
      } catch (error) {
        this.$newMessage.error('上传标记图失败')
      }
    },
    /**
     * @description 获取选中标签
     */
    getActiveLableId () {
      if (!this.$refs['fabric-canvas']) return []
      const activeLableList = this.$refs['fabric-canvas'].activeLableList
      const ids = activeLableList.map(item => {
        return {
          id: item.levelId
        }
      })
      return {
        ids,
        labelData: activeLableList
      }
    },
    /**
     * @description 重制标签
     */
    resetLabelData () {
      this.$bus.$emit('reset-grade-lable')
    },
  }
}
</script>

<style lang="less" scoped>
  @import url('./index.less');
</style>
