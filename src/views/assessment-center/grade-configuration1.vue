<template>
  <div class="grade-configuration">
    <div class="header">
      <h3>云学院评分配置1</h3>
      <el-button v-if="showEmptyCheckPool" type="primary" @click="showEmptyDialog = true">清空评分</el-button>
    </div>
    <div class="main">
      <el-button class="add-category-button" @click="showAddCategoryDialog = true">添加类别</el-button>
      <el-tabs v-model="tabKey">
        <el-tab-pane
          v-for="tab in tabList"
          :label="tab.name"
          :name="tab.name"
          :key="tab.id"
        >
          <Assessment :key="tab.id"></Assessment>
        </el-tab-pane>
      </el-tabs>
    </div>

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
    <!-- 添加类别弹出框 -->
    <el-dialog
      width="35%"
      title="添加类别"
      center
      custom-class="add-category-dialog"
      :visible.sync="showAddCategoryDialog"
    >
      <div class="add-category-dialog">
        <span>类别名称:</span>
        <el-input
          class="ml-10"
          v-model="addCategoryName"
          placeholder="请输入类别"
          maxlength="5"
        >
        </el-input>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="showAddCategoryDialog = false">取 消</el-button>
        <el-button type="primary" @click="handleConfirmCategory">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as GradeConfiguration from '@/api/gradeConfiguration.js'
import Assessment from './components1/assessment-item'
import { mapGetters } from 'vuex'

export default {
  name: 'GradeConfiguration',
  components: {
    Assessment
  },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      showEmptyDialog: false,
      emptyPeople: [],
      tabList: [
        {
          id: '1',
          name: '液化',
          type: '液化'
        },
        {
          id: '2',
          name: '液化2',
          type: '液化2'
        }
      ],
      tabKey: '1',

      // 类别弹出框
      showAddCategoryDialog: false,
      addCategoryName: '',
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
    },
    handleConfirmCategory () {
      if (this.tabList.some(tab => tab.name === this.addCategoryName)) {
        this.$message.error('存在相同的评分类别。')
        return
      }
      const data = {
        id: '' + +new Date(),
        name: '新分类' + +new Date(),
        type: '123'
      }
      this.tabList.unshift(data)
      this.tabKey = data.name
      this.showAddCategoryDialog = false
      this.addCategoryName = ''
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

  .add-category-dialog {
    display: flex;
    align-items: center;

    & > span {
      flex-shrink: 0;
    }

    .ml-10 {
      margin-left: 10px;
    }
  }
}
</style>
