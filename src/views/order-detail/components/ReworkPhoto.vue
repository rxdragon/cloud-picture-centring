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
          <span
            v-for="(wholeReasonItem, wholeReasonIndex) in photoItem.wholeReason"
            :key="`label${wholeReasonIndex}`"
            class="tag"
          >
            {{ wholeReasonItem }}
          </span>
        </div>
      </div>
      <div class="info-item">
        <p class="info-title">整体退回备注:</p>
        <span class="rework-info">{{ photoItem.wholeNote }}</span>
      </div>
      <div class="info-item">
        <p class="info-title">局部退回标记:</p>
        <div class="rework-tags">
          <span
            v-for="(partReasonItem, partReasonIndex) in photoItem.partReason"
            :key="partReasonIndex"
            class="tag"
          >
            {{ partReasonItem }}
          </span>
        </div>
      </div>
      <div class="info-item">
        <p class="info-title">局部退回备注:</p>
        <span class="rework-info">{{ photoItem.partNote }}</span>
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
      const reworkPhoto = this.photoItem.photoVersion.filter(photo => photo.version === PHOTO_VERSION.STORE_REWORK)
      return this.imgCompressDomain + reworkPhoto[0].path
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
      align-items: center;
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

      .tag {
        padding: 4px 10px;
        margin-right: 16px;
        font-size: 12px;
        color: #4669fb;
        background: rgba(237, 240, 255, 1);
        border: 1px solid rgba(181, 195, 253, 1);
        border-radius: 4px;
      }
    }

    .el-textarea {
      width: 500px;
    }
  }
}
</style>
