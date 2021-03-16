<template>
  <div class="appeal-record-info">
    <div class="panel-title">
      申诉结果
      <slot name="appealPlug"></slot>
    </div>
    <div class="panel-main">
      <div class="panel-content content-one">申诉问题描述：{{ appealRecordData.desc }}</div>
      <div class="panel-content content-one">初审状态：{{ firstResult.resultDesc }}</div>
      <div
        v-if="firstResult.result === APPEAL_RESULT_STATUS.REFUSE"
        class="panel-content content-one"
      >
        初审拒绝原因：{{ firstResult.reason }}
      </div>
      <div
        v-if="firstResult.result === APPEAL_RESULT_STATUS.ACCEPT"
        class="panel-content content-one"
      >
        初审通过备注：{{ firstResult.reason }}
      </div>
      <div class="panel-content content-one">复审状态：{{ secondResult.resultDesc }}</div>
      <div
        v-if="secondResult.result === APPEAL_RESULT_STATUS.REFUSE"
        class="panel-content content-one"
      >
        复审拒绝原因：{{ secondResult.reason }}
      </div>
      <div
        v-if="secondResult.result === APPEAL_RESULT_STATUS.ACCEPT"
        class="panel-content content-one"
      >
        复审通过备注：{{ secondResult.reason || '-' }}
      </div>
    </div>
  </div>
</template>

<script>
import { APPEAL_RESULT_STATUS } from '@/utils/enumerate'

export default {
  name: 'AppealRecordInfo',
  props: {
    appealRecordData: { type: Object, required: true }
  },
  data () {
    return {
      APPEAL_RESULT_STATUS
    }
  },
  computed: {
    // 第一次审核记录
    firstResult () {
      return this.appealRecordData.firstResult || {}
    },
    secondResult () {
      return this.appealRecordData.secondResult || {}
    }
  },
}
</script>

<style lang="less" scoped>
.appeal-record-info {
  font-size: 14px;
  color: #303133;

  .type-tag {
    margin: 0 10px 10px;

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

  .panel-main {
    padding: 20px;
    margin-top: 12px;
    background-color: #fafafa;
    border-radius: 4px;

    .panel-content {
      padding: 10px 0;

      .evaluate-item {
        margin-right: 16px;
        margin-bottom: 10px;
      }

      .reason-item {
        display: inline-block;
        padding: 4px;
        margin-right: 16px;
        font-size: 12px;
        color: #4669fb;
        background: rgba(237, 240, 255, 1);
        border: 1px solid rgba(181, 195, 253, 1);
        border-radius: 4px;

        .red {
          color: red;
        }

        &.del {
          color: #919199;
          background: rgba(212, 212, 217, 1);
          border: none;
        }
      }
    }

    .content-one {
      display: flex;
      flex-wrap: wrap;
      border-bottom: 1px solid @borderColor;
    }
  }
}
</style>
