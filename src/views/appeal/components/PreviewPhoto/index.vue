<template>
  <div class="photoShow">
    <div class="title">
      {{ showPhoto.version | toPhotoVerName }}{{ showPhoto.storeReturnCount || '' }}
      <div class="btn-right">
        <button
          id="closeImg"
          type="button"
          class="button-close"
          @click="closeShowPhoto"
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
      <!-- 图片 -->
      <div class="photo-show" ref="photo-show">
        <div
          v-loading="loading"
          class="orginPhoto"
          @click.stop="zoom"
          :style="photoZoomStyle + (inZoomIn && 'cursor: zoom-out;')"
        >
          <img
            id="orginImg"
            ref="orgin-img"
            :src="showPhoto.src"
            :alt="showPhoto.title"
            @load="loadingPhoto"
          >
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
              class="sign-item"
              :key="labelIndex"
              :style="{
                position: 'absolute',
                width: `${labelItem.width}%`,
                height: `${labelItem.height}%`,
                top: `${labelItem.location[0]}%`,
                left: `${labelItem.location[1]}%`,
              }"
            >
              <div class="circle-box" :style="{ color: labelItem.brushColor} "/>
              <div class="retouch-reason">
                <div class="part-reason-list">
                  <div
                    v-for="(itemsub, indexsub) in labelItem.reasonManage"
                    :key="indexsub"
                    :class="['reason-tag-common part-tag', itemsub.isDel ? 'deleted' : '']"
                  >
                    <span>{{ itemsub.name }}</span>
                    <span v-if="checkType === 'second' && !itemsub.cancel" @click.stop="delReason(itemsub)" class="red">删除</span>
                    <span
                      v-if="checkType === 'second' && itemsub.cancel && !itemsub.isDel"
                      @click.stop="cancelDelReason(itemsub)"
                      class="red"
                    >(标记删除)
                    </span>
                    <span
                      v-if="checkType === 'second' && itemsub.cancel && itemsub.isDel"
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
          <div class="mask-photo" v-if="showPhoto.hasCommitInfo" v-show="showMark">
            <img
              :src="markPhoto"
              alt=""
              :style="{
                width: `${showImageRect.width}px`,
                height: `${showImageRect.height}px`
              }"
            >
          </div>
          <div id="_magnifier_layer" />
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
          <!-- 缩略图 -->
          <div id="smallImg" v-loading="loading" class="small-img">
            <div v-show="isShow" class="breviary-photo">
              <div class="smallPhoto">
                <div id="img-box" style="position: relative;">
                  <img
                    ref="compress-img"
                    :src="showPhoto.src"
                    alt="缩略图"
                    @mousemove="handMove"
                    @mouseover="handOver"
                    @mouseout="handOut"
                  >
                  <div class="_magnifier_zoom" />
                </div>
              </div>
              <div class="contant">
                <el-slider :show-tooltip="false" v-model="scaleNum" />
                <span class="scale-box">{{ scaleNum * 4 + 80 }}%</span>
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
          <order-info-module v-if="showOrderInfo" :order-info="orderInfo" />
          <!-- 申诉理由 -->
          <div class="order-label">
            <div class="label-title">申诉问题描述</div>
            <p>{{ photoAppeal.desc }}</p>
          </div>
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
                    <span v-if="checkType === 'second' && !labelItem.cancel" @click.stop="delReason(labelItem)" class="red">删除</span>
                    <span
                      v-if="checkType === 'second' && labelItem.cancel && !labelItem.isDel"
                      @click.stop="cancelDelReason(labelItem)"
                      class="red"
                    >(标记删除)
                    </span>
                    <span
                      v-if="checkType === 'second' && labelItem.cancel && labelItem.isDel"
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
            <div class="not-refusing" v-if="!showRefuseTextarea">
              <el-button type="danger" @click="showRefuse">审核拒绝</el-button>
              <el-button type="primary" @click="checkPass">审核通过</el-button>
            </div>
            <div class="refusing" v-else>
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
import OrderInfoModule from '@/views/assessment-center/components/OrderInfoModule'
import ModeSwitchBox from './ModeSwitchBox'

import { APPEAL_CHECK_STATUS } from '@/utils/enumerate'
import { mapGetters } from 'vuex'


export default {
  name: 'PreviewPhoto',
  components: { OrderInfoModule, ModeSwitchBox },
  model: {
    prop: 'orderindex',
    event: 'change'
  },
  props: {
    configs: {
      type: Object,
      default () {
        return {
          width: 100,
          height: 100,
          maskWidth: 100,
          maskHeight: 50,
          maskColor: 'red',
          maskOpacity: 0.5,
          scale: 100
        }
      }
    },
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
    showOrderInfo: { type: Boolean },
    photoAppeal: { type: Object }
  },
  data () {
    return {
      propConfigs: this.configs, // 配置信息
      imgObj: {}, // 图片信息
      bigImg: {}, // 大图信息
      mouseMask: {}, // 马克图
      imgLayer: {}, // 图片预览信息
      imgRect: {}, // 图片宽度信息
      scaleNum: 25, // 放大信息
      photoIndex: this.orderindex,
      loading: true,
      isShow: true, // 小图信息
      maxObj: {
        height: '',
        width: ''
      },
      showImageRect: { // 当前展示图片宽度信息
        width: 0,
        height: 0
      },
      photoArray: [], // 展示数组
      inZoomIn: false,
      photoZoomStyle: '',
      showMark: false, // mark图显示
      showStoreReson: false, // 是否显示门店退回标记
      showRefuseTextarea: false, // 是否在输入状态中
      refuseTextarea: '',
      checkResult: '' // 审核结果

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
    // 标签数据
    labelData () {
      return _.get(this.showPhoto, 'commitInfo.issueLabel')
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
          this.showPhoto.version = 'original_photo'
        } else if (val === 'complete') {
          this.showStoreReson = true
          if (!this.showPhoto.versionCache) return false
          const completePhotoPath = this.showPhoto.versionCache.store_rework.path
          this.showPhoto.src = this.imgDomain + completePhotoPath
          this.showPhoto.version = 'store_rework'
        } else {
          this.showMark = true
          if (!this.showPhoto.versionCache) return false
          const completePhotoPath = this.showPhoto.versionCache.store_rework.path
          this.showPhoto.src = this.imgDomain + completePhotoPath
          this.showPhoto.version = 'complete_photo'
        }
      },
      immediate: true
    }
  },
  beforeDestroy () {
    document.onkeydown = null
  },
  methods: {
    /**
     * @description 显示标记
     */
    showMarkPhoto () {
      if (this.mode === 'complete') {
        this.showStoreReson = !this.showStoreReson
      }
      if (this.mode === 'cloudLabel') {
        this.showMark = !this.showMark
      }
    },
    /**
     * @description 取消加载
     */
    loadingPhoto (e) {
      this.imgObj = this.$refs['compress-img']
      this.imgBigObj = this.$refs['orgin-img']
      this.showImageRect.width = this.imgBigObj.clientWidth
      this.showImageRect.height = this.imgBigObj.clientHeight
      this.loading = false
    },
    /**
     * @description 滑块滑动改变值
     * @param {Number} [放大系数]
     */
    formatTooltip (val) {
      return val + 100
    },
    /**
     * @description 上一张图片
     */
    prePhoto () {
      const beforePath = this.photoArray[this.photoIndex].path
      if (this.photoIndex === 0) {
        this.photoIndex = this.photoArray.length - 1
      } else {
        this.photoIndex--
      }
      this.$emit('change', this.photoIndex)
      const nextPath = this.photoArray[this.photoIndex].path
      if (beforePath === nextPath) return
      this.loading = true
    },
    /**
     * @description 下一张图片
     */
    nextPhoto () {
      const beforePath = this.photoArray[this.photoIndex].path
      if (this.photoIndex === this.photoArray.length - 1) {
        this.photoIndex = 0
      } else {
        this.photoIndex++
      }
      this.$emit('change', this.photoIndex)
      const nextPath = this.photoArray[this.photoIndex].path
      if (beforePath === nextPath) return
      this.loading = true
    },
    /**
     * @description 关闭图片
     */
    closeShowPhoto () {
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
     * @description 放大
     */
    zoom (e) {
      if (this.inZoomIn) {
        this.photoZoomStyle = ''
        this.inZoomIn = false
      } else {
        const photoShow = this.$refs['photo-show']
        const imageWidth = photoShow.clientWidth
        const imageHeight = photoShow.clientHeight
        const _x = e.pageX
        const _y = e.pageY - 82
        const clickX = (_x / imageWidth * 100).toFixed(2) + '%'
        const clickY = (_y / imageHeight * 100).toFixed(2) + '%'
        const zoomScale = (this.scaleNum * 4 + 80) / 100
        this.photoZoomStyle = `transform-origin: ${clickX} ${clickY}; transform: scale(${zoomScale});`
        this.inZoomIn = true
      }
    },
    /**
     * @description 判断是否处于放大中
     */
    judgeHasZoom (e) {
      const isOverIn = _.get(this.imgLayer, 'style.width')
      if (isOverIn) {
        this.handOver(e)
      }
    },
    /**
     * @description 鼠标移动
     */
    handMove (e) {
      // 获取在图片的位置
      const objX = e.clientX - this.imgRect.left
      const objY = e.clientY - this.imgRect.top
      // 判断是否超出界限
      let _maskX = objX - this.mouseMask.offsetHeight / 2
      let _maskY = objY - this.mouseMask.offsetWidth / 2
      if (_maskY <= 0) {
        _maskY = 0
      }
      if (_maskY + this.mouseMask.offsetHeight >= this.imgRect.height) {
        _maskY = this.imgRect.height - this.mouseMask.offsetHeight
      }
      if (_maskX <= 0) {
        _maskX = 0
      }
      if (_maskX + this.mouseMask.offsetWidth >= this.imgRect.width) {
        _maskX = this.imgRect.width - this.mouseMask.offsetWidth
      }
      this.mouseMask.style.webkitTransform = `translate3d(${_maskX}px,${_maskY}px,0)`
      const backgroundX =
        ((_maskX / this.imgRect.width) *
        this.propConfigs.width *
        this.propConfigs.scale) /
        100
      const backgroundY =
        ((_maskY / this.imgRect.height) *
        this.propConfigs.height *
        this.propConfigs.scale) /
        100
      this.imgLayer.style.backgroundPositionX = `-${backgroundX}px `
      this.imgLayer.style.backgroundPositionY = `-${backgroundY}px `
    },
    /**
     * @description 鼠标移出
     */
    handOut (e) {
      this.imgLayer.removeAttribute('style')
      this.mouseMask.removeAttribute('style')
    },
    /**
     * @description 鼠标移进
     */
    handOver (e) {
      // 获取大图尺寸
      this.imgRect = this.imgObj.getBoundingClientRect()
      this.imgBigRect = this.imgBigObj.getBoundingClientRect()
      // 马克图宽度计算系数
      this.propConfigs.maskWidth =
        (this.imgRect.width / (this.scaleNum * 4 + 100)) * 100
      this.propConfigs.maskHeight =
        this.propConfigs.maskWidth *
        (this.imgRect.height / this.imgRect.width)
      // 背景图放大系数
      this.propConfigs.scale =
        (this.imgRect.width / this.propConfigs.maskWidth) * 100
      // 获取大图信息
      this.bigImg = new Image()
      this.bigImg.src = this.showPhoto.src
      this.bigImg.height =
        (this.bigImg.height * this.propConfigs.scale) / 100
      this.bigImg.width = (this.bigImg.width * this.propConfigs.scale) / 100
      // 创建鼠标选择区域
      this.mouseMask = document.querySelector('._magnifier_zoom')
      this.mouseMask.style.background = this.propConfigs.maskColor
      this.mouseMask.style.height = this.propConfigs.maskHeight + 'px'
      this.mouseMask.style.width = this.propConfigs.maskWidth + 'px'
      this.mouseMask.style.opacity = this.propConfigs.maskOpacity
      this.imgObj.parentNode.appendChild(this.mouseMask)
      // 创建预览框
      const imgLayer = document.getElementById('_magnifier_layer')
      const orginImg = document.getElementById('orginImg')
      this.propConfigs.width = orginImg.width
      this.propConfigs.height = orginImg.height
      this.imgLayer = imgLayer
      const _layerHeight = this.propConfigs.height
      const _layerWidth = this.propConfigs.width
      imgLayer.style.width = _layerWidth + 'px'
      imgLayer.style.height = _layerHeight + 'px'
      imgLayer.style.backgroundImage = `url('${this.showPhoto.src}')`
      imgLayer.style.backgroundRepeat = 'no-repeat'
      imgLayer.style.backgroundSize = `${this.propConfigs.scale}%`
      document.getElementsByClassName('orginPhoto')[0].appendChild(imgLayer)
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
    showRefuse (item) {
      this.showRefuseTextarea = true
    },
    /**
     * @description 通过
     */
    checkPass (item) {
      if (this.checkType === APPEAL_CHECK_STATUS.SECOND) { // 复审一定要勾选删除标签
        if (!this.delLabelNum) {
          this.$newMessage.warning('必须要删除至少一个标签')
          return
        }
      }
      this.checkResult = 'accept'
      this.emitResult('accept')
    },
    /**
     * @description 隐藏拒绝原因输入
     */
    hideRefuse (item) {
      this.showRefuseTextarea = false
    },
    /**
     * @description 保存拒绝原因输入
     */
    saveRefuse (item) {
      if (!this.refuseTextarea) {
        this.$newMessage.warning('拒绝原因还没有填写')
        return
      }
      this.checkResult = 'refuse'
      this.hideRefuse()
      this.emitResult('refuse')
    },
    /**
     * @description 通知审核结果
     */
    emitResult (type) {
      const result = {
        result: this.checkResult,
        type: this.checkType
      }
      if (type === 'accept') {
        result.storePartReworkReason = this.showPhoto.storePartReworkReason
        result.storeReworkReasonManage = this.showPhoto.storeReworkReasonManage
      }
      if (this.refuseTextarea) result.reason = this.refuseTextarea
      this.$emit('saveResult', result)
      this.closeShowPhoto()
    },
    /**
     * @description 重置拒绝原因
     */
    resetRefuse (item) {
      this.refuseTextarea = ''
    }
  }
}
</script>

<style lang="less" scoped>
  @import url('./index.less');
</style>
