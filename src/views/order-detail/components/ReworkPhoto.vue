<template>
  <div class="rework-photo">
    <div class="photo-area">
      <img
        class="photo"
        :src="imgCompressDomain + photoItem.last_store_rework_photo.path"
        alt=""
      />
      <el-checkbox v-model="photoItem.reworkChecked"></el-checkbox>
    </div>
    <div class="info-area">
      <p>退回标记</p>
      <div class="rework-tags">
        <div
          v-for="(wholeReasonItem, wholeReasonIndex) in photoItem.wholeReason"
          :key="`label${wholeReasonIndex}`"
          class="tag"
        >
          {{ wholeReasonItem }}(整体)
        </div>
        <div
          v-for="(partReasonItem, partReasonIndex) in photoItem.partReason"
          :key="partReasonIndex"
          class="tag"
        >
          {{ partReasonItem }}(局部)
        </div>
      </div>
      <p>退回备注</p>
      <span class="rework-info">整体: {{ photoItem.wholeNote }}</span>
      <span class="rework-info">局部: {{ photoItem.partNote }}</span>
      <p v-show="photoItem.reworkChecked">问题描述(必填)</p>
      <el-input
        v-show="photoItem.reworkChecked"
        type="textarea"
        placeholder="问题描述,最多100个字符"
        v-model="photoItem.appealReason"
        maxlength="100"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

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
    ...mapGetters(['imgCompressDomain'])
  }
}
</script>

<style lang="less" scoped>

@panelTitleWidth: 185px;

.rework-photo {
  .photo-area {
    position: relative;
    display: inline-block;
    width: 200px;
    height: 200px;
    margin-right: 10px;

    .photo {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      width: 200px;
      height: 200px;
    }

    .el-checkbox {
      position: absolute;
      right: 10px;
      bottom: 10px;
      z-index: 2;
    }
  }

  .info-area {
    display: inline-block;
    width: 400px;
    vertical-align: top;

    .rework-info {
      margin-right: 10px;
    }

    .rework-tags {
      display: flex;
      flex-wrap: wrap;

      .tag {
        padding: 3px 5px;
        margin-right: 10px;
        margin-bottom: 2px;
        font-size: 12px;
        color: #fff;
        background-color: #535353;
        border-radius: 5px;
      }
    }
  }
}
</style>
