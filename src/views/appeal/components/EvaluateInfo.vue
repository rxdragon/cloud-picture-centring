<template>
  <div class="order-label">
    <div class="label-title">评分信息</div>
    <div>
      得分：{{ photoAppeal.checkPoolScore }}
      <el-tag :class="['type-tag', photoAppeal.evaluatorType]">{{ photoAppeal.evaluatorType | toPlantCN }}</el-tag>
    </div>
    <template v-for="(labelClassItem, labelClassIndex) in resultLabelData">
      <div v-if="labelClassItem.child.length" :key="labelClassIndex" class="label-box">
        <div class="label-class-title">{{ labelClassItem.name }}</div>
        <div class="label-content">
          <el-tag
            v-for="issueItem in labelClassItem.child"
            :key="'issue' + issueItem.id"
            :class="issueItem.isSelect ? 'active' : ''"
            size="medium"
            disable-transitions
          >
            {{ issueItem.name }}
          </el-tag>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { APPEAL_TYPE } from '@/utils/enumerate'

export default {
  name: 'EvaluateInfo',
  props: {
    photoAppeal: { type: Object, required: true },
    resultLabelData: { type: Array, required: true }
  },
  data () {
    return {
      APPEAL_TYPE
    }
  },
  methods: {
    
  }
}
</script>

<style lang="less" scoped>
.order-label {
  padding: 14px 10px 40px;
  font-size: 12px;
  color: #eee;
  word-break: break-all;

  .label-title {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 500;

    &::before {
      display: inline-block;
      width: 2px;
      height: 16px;
      margin-right: 6px;
      content: '';
      background-color: #4669fb;
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

  .label-box {
    .label-class-title {
      padding: 10px 0;
      font-size: 14px;
      font-weight: 600;
      line-height: 20px;
      color: #eee;
    }

    .label-content {
      margin-bottom: -10px;

      .el-tag {
        margin: 0 10px 10px 0;
        font-size: 12px;
        font-weight: 400;
        color: #eee;
        -webkit-user-select: none;
        background-color: #000;
        border: none;
        border-radius: 4px;
        opacity: 0.6;

        &.active {
          background-color: #808080;
        }
      }
    }
  }
}
</style>
