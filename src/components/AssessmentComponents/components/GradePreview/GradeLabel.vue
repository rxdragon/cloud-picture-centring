<template>
  <div class="grade-label">
    <div class="label-header">
      <div class="panel-title">标签栏</div>
    </div>
    <div class="lable-main">
      <el-collapse v-model="activeNames">
        <el-collapse-item
          v-for="labelClassItem in labelClass"
          :key="labelClassItem.id"
          :title="labelClassItem.name"
          :name="labelClassItem.idString"
        >
          <LabelModule :labelClass="labelClassItem" :activeLabelId="activeLabelId" @selectLabelId="onSelectGrade" />
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
import * as AssessmentCenter from '@/api/assessmentCenter'
import LabelModule from './LabelModule.vue'

export default {
  name: 'GradeLabel',
  components: { LabelModule },
  data () {
    return {
      activeNames: ['115'],
      labelClass: [],
      activeLabelId: '', // 当前选中标签id
    }
  },
  created () {
    this.getAllLabel()
  },
  methods: {
    async getAllLabel () {
      this.labelClass = await AssessmentCenter.getScoreConfigList()
    },
    /**
     * @description 选中问题
     */
    onSelectGrade (id) {
      this.activeLabelId = id
    }
  }
}
</script>

<style lang="less" scoped>
.grade-label {
  @border-color: 1px solid #666;
  @gradeLabelBack: #393939;

  width: 100%;
  font-size: 12px;
  color: #eee;

  .label-header {
    padding: 14px 12px;

    .panel-title {
      color: #eee;
    }
  }

  & /deep/ .el-collapse {
    border-top: @border-color;
    border-bottom: none;

    .el-collapse-item__header {
      padding-left: 12px;
      font-size: 14px;
      line-height: 20px;
      color: #eee;
      background-color: @gradeLabelBack;
      border-bottom: @border-color;

      &.is-active {
        border-bottom: transparent;
      }
    }

    .el-collapse-item__wrap {
      font-size: 12px;
      color: #eee;
      background-color: @gradeLabelBack;
      border-bottom: @border-color;

      .el-collapse-item__content {
        padding: 0 12px 14px;
        color: #eee;
      }
    }
  }
}
</style>
