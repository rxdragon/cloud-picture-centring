<template>
  <div class="grade-configuration">
    <GradeConfiguration :gradeType="GRADE_LABEL_TYPE.CLOUD" title="云学院评分配置"/>
  </div>
</template>

<script>
import GradeConfiguration from '@/components/ScoringConfiguratio'
import { GRADE_LABEL_TYPE } from '@/utils/enumerate'
export default {
  name: 'CloudGradeConfiguration',
  components: {
    GradeConfiguration
  },
  data () {
    return {
      GRADE_LABEL_TYPE
    }
  },
}
</script>

<style lang="less" scoped>
.grade-configuration {
  height: calc(100% - 14px);

  .main {
    position: relative;
    height: 100%;

    .add-category-button {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 10;
    }

    .edit-category-button {
      position: absolute;
      top: 0;
      right: 120px;
      z-index: 10;
    }
  }

  .empty-dialog {
    .el-select {
      margin-left: 10px;
    }

    .all-empty-warning {
      margin-left: 10px;
      color: red;
    }
  }

  & /deep/ .el-dialog--center {
    .el-dialog__body {
      padding: 20px !important;
    }
  }
}
</style>

