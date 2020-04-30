<template>
  <div class="photo-list">
    <div v-for="(photoItem, photoIndex) in photos" :key="photoIndex" class="photo-box">
      <photo-box downing :preload-photo="needPreload" :src="photoItem.path" @click.native="showPriviewPhoto(photoIndex)" show-yun-check>
        <template v-slot:title>
          <span class="lable-title">{{ photoItem.version | toPhotoVerName }}</span>
        </template>
      </photo-box>
      <div v-if="photoItem.version === 'complete_photo' && needGrade" class="grade-box">
        <div v-if="canGrade" class="show-info">
          <!-- 赞 -->
          <div class="good icon-box" :class="{'good-photo': goodPhoto}" @click="setGood">
            <i class="iconfont" :class="goodPhoto ? 'icon-like-press' : 'icon-like'" />
            点赞
          </div>
          <!-- 踩 -->
          <div class="bad icon-box" :class="{'bad-photo': badPhoto}" @click="setBad">
            <i class="iconfont" :class="badPhoto ? 'icon-unlike-press' : 'icon-unlike'" />
            不喜欢
          </div>
        </div>
        <div v-else class="show-info">
          <!-- 赞 -->
          <div v-if="goodPhoto" class="good-photo only-show icon-box">
            <i class="iconfont icon-like-press" />
            {{ gradeInfo.name }}已点赞
          </div>
          <!-- 踩 -->
          <div v-else class="bad-photo icon-box">
            <i class="iconfont icon-unlike-press" />
            不喜欢
          </div>
        </div>
      </div>
    </div>
    <preview-photo
      v-if="showPreview"
      :order-info="orderInfo"
      :imgarray="priviewPhotoData"
      show-return-reson
      :orderindex="imgIndex"
      :show-order-info="showOrderInfo"
      :show-preview.sync="showPreview"
    />
  </div>
</template>

<script>
import PhotoBox from '@/components/PhotoBox'
import PreviewPhoto from '@/components/PreviewPhoto/index.vue'
import PreviewModel from '@/model/PreviewModel'

import { mapGetters } from 'vuex'
export default {
  name: 'PhotoList',
  components: { PhotoBox, PreviewPhoto },
  props: {
    needPreload: { type: Boolean },
    photoData: { type: Array, default: () => [] }, // 照片数据
    needGrade: { type: Boolean }, // 是否需要打分,
    showOrderInfo: { type: Boolean }, // 是否显示订单信息
    gradeInfo: { type: Object, default: () => ({}) }, // 是否打分
    orderInfo: { type: Object, default: () => ({}) } // 打分信息
  },
  data () {
    return {
      gradeType: 0, // 0 未打分 1 good 2 bad
      showPreview: false,
      imgIndex: 0
    }
  },
  computed: {
    ...mapGetters(['imgDomain', 'staffId']),
    photos () {
      return this.photoData
    },
    // 预览数组
    priviewPhotoData () {
      const previewList = this.photos.map(item => {
        const createData = new PreviewModel(item)
        createData.src = this.imgDomain + createData.path
        return createData
      })
      return previewList
    },
    /**
     * @description 能否打分
     * @param {*} params
     */
    canGrade () {
      if (!this.gradeInfo.attitude) return true
      const isAttitudeScore = ['good', 'bad']
      const isAttitude = isAttitudeScore.includes(this.gradeInfo.attitude)
      const isAttitudeBySelf = this.gradeInfo.staff_id === this.staffId
      return isAttitudeBySelf || !isAttitude
    },
    // 种草照片
    goodPhoto () {
      return +this.gradeType === 1
    },
    // 踩照片
    badPhoto () {
      return +this.gradeType === 2
    }
  },
  watch: {
    'gradeInfo.attitude': {
      handler: function (value) {
        if (!value) {
          this.gradeType = 0
        }
        if (value === 'good') {
          this.gradeType = 1
        }
        if (value === 'bad') {
          this.gradeType = 2
        }
        if (value === 'none') {
          this.gradeType = 0
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    /**
     * @description 点赞
     */
    setGood () {
      this.gradeType = +this.gradeType === 1 ? 0 : 1
      this.sendMessage()
    },
    /**
     * @description 踩
     */
    setBad () {
      this.gradeType = +this.gradeType === 2 ? 0 : 2
      this.sendMessage()
    },
    /**
     * @description 发送信息
     */
    sendMessage () {
      let sendData = ''
      if (+this.gradeType === 1) {
        sendData = 'good'
      }
      if (+this.gradeType === 2) {
        sendData = 'bad'
      }
      this.$emit('gradeChange', sendData)
    },
    /**
     * @description 展示搜索框
     */
    showPriviewPhoto (photoIndex) {
      this.imgIndex = photoIndex
      this.showPreview = true
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";

.photo-list {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;

  .photo-box {
    width: 253px;
    margin-right: 24px;
    margin-bottom: 24px;

    .show-info {
      display: flex;
      justify-content: space-between;
      padding: 12px 6px 6px;
      font-family: @pingFang;
      font-size: 14px;
      line-height: 22px;
      color: #606266;
      border-top: 1px solid @borderColor;

      .icon-box {
        display: flex;
        align-items: center;
        cursor: pointer;

        .iconfont {
          margin-right: 9px;
        }
      }

      .only-show {
        cursor: initial !important;
      }

      .good:hover {
        color: #ff8f00;
      }

      .good-photo {
        color: #ff8f00;
      }

      .bad:hover {
        color: #909399;
      }

      .bad-photo {
        color: #909399;
      }
    }
  }
}
</style>
