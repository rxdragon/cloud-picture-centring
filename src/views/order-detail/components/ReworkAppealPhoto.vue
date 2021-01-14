<template>
  <div class="rework-photo module-panel">
    <!-- 照片 -->
    <div
      class="photo-area"
      :class="photoItem.reworkChecked && 'photo-area-checked'"
    >
      <el-checkbox :disabled="showReason.needDisable" v-model="photoItem.reworkChecked">
        <photo-box
          :src="reworkImg"
          :show-special-effects="false"
          :show-store-part-rework-reason="false"
          contain-photo
          show-label-info
        />
      </el-checkbox>
    </div>

    <!-- 申诉信息 -->
    <div class="info-area">
      <div class="info-item">
        <p class="info-title">整体退回标记：</p>
        <div class="rework-tags">
          <div
            v-for="(wholeReasonItem, wholeReasonIndex) in showReason.storeReworkReasonManage"
            :key="wholeReasonIndex"
            :class="['tag', wholeReasonItem.cancel ? 'del' : '']"
          >
            <span>{{ wholeReasonItem.name }}</span>
            <span v-if="wholeReasonItem.cancel">(已删除)</span>
          </div>
        </div>
      </div>
      <div class="info-item">
        <p class="info-title">整体退回备注：</p>
        <span class="rework-info">{{ showReason.storeReworkNote }}</span>
      </div>
      <div class="info-item">
        <p class="info-title">局部退回标记：</p>
        <div class="rework-tags">
          <div
            v-for="(partReasonItem, partReasonIndex) in showReason.storePartReworkReason"
            :key="partReasonIndex"
            class="part-tags"
          >
            <div
              v-for="(reasonItem, reasonIndex) in partReasonItem.reasonManage"
              :key="reasonIndex"
              :class="['tag', reasonItem.cancel ? 'del' : '']"
            >
              <span>{{ reasonItem.name }}</span>
              <span v-if="reasonItem.cancel">(已删除)</span>
            </div>
          </div>
        </div>
      </div>
      <div class="info-item">
        <p class="info-title">局部退回备注：</p>
        <span
          class="rework-info"
          v-for="(partNote, partNoteIndex) in showReason.storePartReworkReason"
          :key="partNoteIndex"
        >{{ partNote.note }}
        </span>
      </div>
      <div class="info-item" v-if="showReason.needDisable">
        <p class="info-title red">照片退回时间：</p>
        <span class="red">{{ showReason.originReworkTime }}</span>
      </div>
      <div class="info-item">
        <p v-show="photoItem.reworkChecked" class="info-title">问题描述(必填)：</p>
        <el-input
          v-show="photoItem.reworkChecked"
          type="textarea"
          placeholder="问题描述,最多100个字符"
          v-model="photoItem.appealReason"
          maxlength="100"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import PreviewModel from '@/model/PreviewModel.js'
import PhotoBox from '@/components/PhotoBox'

export default {
  name: 'ReworkAppealPhoto',
  components: { PhotoBox },
  props: {
    photoItem: { type: Object, required: true }
  },
  computed: {
    ...mapGetters(['imgCompressDomain']),
    reworkImg () {
      return this.imgCompressDomain + this.showReason.path
    },
    // 获取重修照片
    showReason () {
      const showReasonPhoto = new PreviewModel(this.photoItem.realReworkPhoto)
      const originReworkTime = _.get(this.photoItem, 'originReworkPhotoLog.created_at')
      const originReworkMonth = new Date(originReworkTime).getMonth()
      const nowMonth = new Date().getMonth()
      const appealSystemOnline = 1598371200000
      showReasonPhoto.needDisable = originReworkMonth !== nowMonth || new Date(originReworkTime).getTime() < appealSystemOnline
      showReasonPhoto.originReworkTime = originReworkTime
      return showReasonPhoto
    }
  }
}
</script>

<style lang="less" scoped>

@panelTitleWidth: 185px;

.rework-photo {
  display: flex;
  margin-bottom: 24px;
  background-color: #f5f7fa;
  box-shadow: none;

  .red {
    color: @red;
  }

  .photo-area {
    position: relative;
    flex-shrink: 0;
    width: 240px;
    height: 240px;
    margin-right: 24px;
    border: 1px solid transparent;

    &.photo-area-checked {
      box-sizing: border-box;
      border: 1px solid @blue;
    }

    .el-checkbox {
      width: 100%;
      height: 100%;

      & /deep/ .el-checkbox__input {
        position: absolute;
        right: 12px;
        bottom: 12px;
        z-index: 99;
      }

      .photo {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top;
        border-radius: 5px;
      }
    }
  }

  .info-area {
    width: 100%;
    padding-top: 12px;

    .info-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 10px;
    }

    .info-title {
      display: block;
      flex-shrink: 0;
      width: 110px;
      height: 31px;
      font-size: 14px;
      font-weight: 500;
      color: #303133;

      &.red {
        color: @red;
      }
    }

    .rework-info {
      margin-right: 10px;
    }

    .rework-tags {
      display: flex;
      flex-wrap: wrap;
      margin-right: -16px;
      margin-bottom: -4px;

      .part-tags {
        display: flex;
        flex-wrap: wrap;
      }

      .tag {
        display: inline-block;
        padding: 4px 10px;
        margin-right: 16px;
        margin-bottom: 4px;
        font-size: 12px;
        color: #4669fb;
        white-space: nowrap;
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
  }
}
</style>
