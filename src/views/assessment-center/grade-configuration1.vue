<template>
  <div class="grade-configuration">
    <div class="header">
      <h3>云学院评分配置1</h3>
      <el-button v-if="showEmptyCheckPool" type="primary" @click="showEmptyDialog = true">清空评分</el-button>
    </div>
    <GradeConfiguration></GradeConfiguration>

    <!-- 清空弹出框 -->
    <el-dialog
      width="35%"
      title="清空评分内容"
      center
      custom-class="empty-dialog"
      :visible.sync="showEmptyDialog"
    >
      <div class="">
        <span>选择清空对象:</span>
        <scorer-select v-model="emptyPeople"></scorer-select>
        <span v-if="!emptyPeople.length" class="all-empty-warning">默认清空全部人员评分</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="showEmptyDialog = false">取 消</el-button>
        <el-button type="primary" @click="setEmpty">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import GradeConfiguration from './components1/grade-configuration'
import { mapGetters } from 'vuex'

export default {
  name: 'GradeConfiguration123',
  components: {
    GradeConfiguration
  },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      showEmptyDialog: false,
      emptyPeople: [],
    }
  },
  computed: {
    ...mapGetters(['showEmptyCheckPool'])
  },
  methods: {
    /**
     * @description 确认清除
     */
    async setEmpty () {
      const params = {}
      if (this.emptyPeople.length > 0) {
        params.staffIds = this.emptyPeople
      }
      const msg = GradeConfiguration.emptyCheckPoolByStaffId(params)
      if (msg) {
        this.$newMessage.success('清除成功')
        this.emptyPeople = []
        this.showEmptyDialog = false
      }
    }
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

