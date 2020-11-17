<template>
  <div class="rework-photo">
    <div class="photo-area">
      <img class="photo" :src="reworkImg" alt=""/>
      <el-checkbox :disabled="showReason.needDisable" v-model="photoItem.reworkChecked"></el-checkbox>
    </div>
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

export default {
  name: 'ReworkAppealPhoto',
  props: {
    photoItem: { type: Object, required: true }
  },
  computed: {
    ...mapGetters(['imgCompressDomain']),
    reworkImg () {
      return this.imgCompressDomain + this.showReason.path
    },
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
  .red {
    color: red;
  }

  .photo-area {
    position: relative;
    display: inline-block;
    width: 240px;
    height: 240px;
    margin-right: 10px;

    .photo {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      width: 240px;
      height: 240px;
      object-fit: cover;
      object-position: top;
      border-radius: 5px;
    }

    .el-checkbox {
      position: absolute;
      right: 4px;
      bottom: 4px;
      z-index: 2;
    }
  }

  .info-area {
    display: inline-block;
    width: 600px;
    vertical-align: top;

    .info-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 10px;
    }

    .info-title {
      width: 100px;
      font-size: 14px;
      color: #303133;

      &.red {
        color: red;
      }
    }

    .rework-info {
      margin-right: 10px;
    }

    .rework-tags {
      display: flex;
      flex-wrap: wrap;
      width: 500px;

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

    .el-textarea {
      width: 500px;
    }
  }
}
</style>
