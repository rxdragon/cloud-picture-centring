<template>
  <div class="grade-configuration">
    <GradeConfiguration
      title="云学院评分配置"
      :addScoreType="addScoreType"
      :delScoreConfig="delScoreConfig"
      :addScoreConfig="addScoreConfig"
      :editScoreConfig="editScoreConfig"
      :getScoreConfig="getScoreConfig"
      :editScoreTypeName="editScoreTypeName"
    ></GradeConfiguration>
  </div>
</template>

<script>
import GradeConfiguration from '@/components/ScoringConfiguratio/grade-configuration'
import * as GradeConfigurationApi from '@/api/gradeConfiguration.js'

export default {
  name: 'CloudGradeConfiguration',
  components: {
    GradeConfiguration
  },
  methods: {
    addScoreType: GradeConfigurationApi.addScoreType,
    delScoreConfig: GradeConfigurationApi.delScoreConfig,
    addScoreConfig: GradeConfigurationApi.addScoreConfig,
    editScoreConfig: GradeConfigurationApi.editScoreConfig,
    getScoreConfig: GradeConfigurationApi.getScoreConfig,
    editScoreTypeName: GradeConfigurationApi.editScoreTypeName,
  }
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

