<template>
  <div class="evaluate-photo">
    <div class="photo-area">
      <img class="photo" :src="reworkImg" alt=""/>
      <el-checkbox v-model="photoItem.reworkChecked"></el-checkbox>
    </div>
    <div class="info-area">
      <div class="info-item">
        <p class="info-title">抽查评分</p>
      </div>
      <div class="info-item">
        <span class="evaluate-score">90分</span>
        <el-tag :class="['type-tag', photoItem.evaluatorType]" size="medium">{{ photoItem.evaluatorType | toPlantCN }}</el-tag>
      </div>
      <div class="info-item">
        <p class="info-title">扣分项</p>
      </div>
      <div class="info-item">
        <el-tag
          size="medium"
          class="tag-item"
          v-for="(tagItem, tagIndex) in checkTag"
          :key="tagIndex"
        >
          {{ tagItem }}
        </el-tag>
      </div>
      <div v-show="photoItem.reworkChecked" class="info-item">
        <p class="info-title">问题描述(必填)：</p>
      </div>
      <div v-show="photoItem.reworkChecked" class="info-item">
        <el-input
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

export default {
  name: 'EvaluateAppeal',
  props: {
    photoItem: { type: Object, required: true }
  },
  computed: {
    ...mapGetters(['imgCompressDomain']),
    reworkImg () {
      return this.imgCompressDomain + this.photoItem.originalPhoto.path
    },
    // 云学院标记
    checkTag () {
      const tagArr = this.photoItem.checkPoolTags
      const tagFilter = tagArr.map(item => {
        return item.name
      })
      return tagFilter
    }
  }
}
</script>

<style lang="less" scoped>

@panelTitleWidth: 185px;

.evaluate-photo {
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
      align-items: center;
      margin-bottom: 10px;
    }

    .info-title {
      font-size: 14px;
      color: #303133;

      &.red {
        color: red;
      }
    }

    .type-tag {
      margin-left: 10px;

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

    .tag-item {
      margin-right: 10px;
    }

    .el-textarea {
      width: 500px;
    }
  }
}
</style>
