<template>
  <div class="rework-photo">
    <div class="photo-area">
      <img class="photo" :src="reworkImg" alt=""/>
      <el-checkbox v-model="photoItem.reworkChecked"></el-checkbox>
    </div>
    <div class="info-area">
      <div class="info-item">
        <p class="info-title">整体退回标记:</p>
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
        <p class="info-title">整体退回备注:</p>
        <span class="rework-info">{{ showReason.storeReworkNote }}</span>
      </div>
      <div class="info-item">
        <p class="info-title">局部退回标记:</p>
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
        <p class="info-title">局部退回备注:</p>
        <span
          class="rework-info"
          v-for="(partNote, partNoteIndex) in showReason.storePartReworkReason"
          :key="partNoteIndex"
        >{{ partNote.note }}
        </span>
      </div>
      <div class="info-item">
        <p v-show="photoItem.reworkChecked" class="info-title">问题描述(必填):</p>
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
import { PHOTO_VERSION } from '@/utils/enumerate'

import PreviewModel from '@/model/PreviewModel.js'

export default {
  name: 'ReworkPhoto',
  props: {
    photoItem: { type: Object, required: true }
  },
  data () {
    return {
      photoVersionList: []
    }
  },
  computed: {
    ...mapGetters(['imgCompressDomain']),
    reworkImg () {
      return this.imgCompressDomain + this.showReason.path
    },
    showReason () {
      const reworkPhoto = this.photoItem.photoVersion.filter(photo => photo.version === PHOTO_VERSION.STORE_REWORK)
      return new PreviewModel(reworkPhoto[0])
    }
  }
}
</script>

<style lang="less" scoped>

@panelTitleWidth: 185px;

.rework-photo {
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
        margin-bottom: 4px;
      }

      .tag {
        display: inline;
        padding: 4px 10px;
        margin-right: 16px;
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
