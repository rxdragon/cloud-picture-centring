<template>
  <div class="photo-list">
    <div v-for="(photoItem, photoIndex) in photos" :key="photoIndex" class="photo-box">
      <photo-box downing :src="photoItem.path" @click.native="showPriviewPhoto(photoIndex)">
        <template v-slot:title>
          <span class="lable-title">{{ photoItem.version | toPhotoEnumName }}</span>
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
      :imgarray="priviewPhotoData"
      :orderindex="imgIndex"
      :show-preview.sync="showPreview"
    />
  </div>
</template>

<script>
import PhotoBox from '@/components/PhotoBox'
import PreviewPhoto from '@/components/PreviewPhoto/index.vue'

import { mapGetters } from 'vuex'
export default {
  name: 'PhotoList',
  components: { PhotoBox, PreviewPhoto },
  filters: {
    toPhotoEnumName (value) {
      const nameList = {
        original_photo: '原片',
        first_photo: '一次成片',
        return_photo: '退回照片',
        complete_photo: '审核成片',
        finish_photo: '最终成片'
      }
      return nameList[value]
    }
  },
  props: {
    photoData: { type: Array, default: () => [] }, // 照片数据
    needGrade: { type: Boolean },
    gradeInfo: { type: Object, default: () => {
      return {}
    } } // 是否打分
  },
  data () {
    return {
      gradeType: 0, // 0 未打分 1 good 2 bad
      showPreview: false,
      imgIndex: 0,
      priviewPhotoData: []
    }
  },
  computed: {
    ...mapGetters(['imgDomain']),
    photos () {
      const createdData = []
      const findList = ['original_photo', 'first_photo', 'complete_photo', 'finish_photo']
      findList.forEach(versionItem => {
        const findVersionItem = this.photoData.find(photoItem => photoItem.version === versionItem)
        if (findVersionItem) {
          createdData.push(findVersionItem)
        }
      })
      return createdData
    },
    /**
     * @description 能否打分
     * @param {*} params
     */
    canGrade () {
      return Boolean(!this.gradeInfo.attitude)
    },
    goodPhoto () {
      return +this.gradeType === 1
    },
    badPhoto () {
      return +this.gradeType === 2
    }
  },
  watch: {
    'gradeInfo.attitude': {
      handler: function (value) {
        if (value === 'good') { this.gradeType = 1 }
        if (value === 'bad') { this.gradeType = 2 }
      },
      deep: true
    }
  },
  activated () {
    this.gradeType = 0
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
      if (+this.gradeType === 1) { sendData = 'good' }
      if (+this.gradeType === 2) { sendData = 'bad' }
      this.$emit('gradeChange', sendData)
    },
    /**
     * @description 展示搜索框
     */
    showPriviewPhoto (photoIndex) {
      this.photos.forEach(item => {
        item.src = this.imgDomain + item.path
      })
      this.priviewPhotoData = this.photos
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
      color: #606266;
      font-family: @pingFang;
      line-height: 22px;
      font-size: 14px;
      padding: 12px 6px 6px;
      border-top: 1px solid #ebeef5;

      .icon-box {
        display: flex;
        cursor: pointer;
        align-items: center;

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

      .bad-photo {
        color: #909399;
      }
    }
  }
}
</style>
