<template>
  <div class="crew-performance-management module-panel">
    <div class="search-box">
      <div class="search-item">
        <span>绩效月份</span>
        <el-date-picker
          v-model="timeSpan"
          type="month"
          value-format="yyyy-MM"
          placeholder="选择月"
        />
      </div>
      <div class="search-item">
        <el-button type="primary">查 询</el-button>
      </div>
      <div class="search-item button-box">
        <el-button type="primary" plain @click="downPerformanceTemplete">下载绩效模版</el-button>
        <upload-excel
          btn-text="导入当月绩效"
          :header-data="headerKeys"
          :on-success="handleSuccess"
          :before-upload="beforeUpload"
        />
      </div>
    </div>
    <div class="module-tabel-box">
      <el-table :data="tableData" style="width: 100%;">
        <el-table-column prop="name" label="伙伴姓名（花名）" />
        <el-table-column prop="staffNum" label="工号" />
        <el-table-column prop="score" label="绩效得分" />
        <el-table-column prop="date" label="最后操作时间" />
        <el-table-column label="操作">
          <template slot-scope="{ row }">
            <el-button type="primary" size="mini" @click="alterPerformance(row.orderId)">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog
      title="修改绩效"
      class="alter-dialog"
      :visible.sync="dialogVisible"
      width="30%"
    >
      <div class="alter-performance">
        <el-form label-width="150px">
          <el-form-item label="伙伴姓名（花名）：">张三（泰德）</el-form-item>
          <el-form-item label="工号：">610299</el-form-item>
          <el-form-item label="绩效得分：">
            <el-input v-model="performanceScore" placeholder="填写修改后的得分"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="affirmAlter">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import UploadExcel from '@/components/UploadExcel'
import exportPerformanceExcel, { headerCellkeys } from "../exportPerformanceExcel.js"

export default {
  name: 'CrewPerformanceManagement',
  components: { UploadExcel },
  data () {
    return {
      timeSpan: null,
      tableData: [],
      dialogVisible: false,
      performanceScore: '',
      headerKeys: headerCellkeys
    }
  },
  methods: {
    /**
     * @description 修改成绩
     */
    alterPerformance (id) {
      this.dialogVisible = true
      // TODO 修改绩效
    },
    /**
     * @description 确认修改
     */
    affirmAlter () {
      this.dialogVisible = false
    },
    /**
     * @description 处理完成
     */
    handleSuccess ({ results }) {
      results.splice(0, 1)
      const hasEveryScore = results.every(item => item.score)
      if (!hasEveryScore) return this.$newMessage.warning('分数没有填写完整！')
      this.tableData = results
    },
    /**
     * @description 上传表格前
     */
    beforeUpload () {
      return true
    },
    /**
     * @description 下载绩模版
     */
    downPerformanceTemplete () {
      const data = [
        {
          name: '李智超（班纳）1',
          staffNum: '621234',
          score: ''
        },
        {
          name: '李智超（班纳）2',
          staffNum: '621234',
          score: ''
        },
        {
          name: '李智超（班纳）3',
          staffNum: '621234',
          score: ''
        },
        {
          name: '李智超（班纳）4',
          staffNum: '621234',
          score: ''
        },
        {
          name: '李智超（班纳）5',
          staffNum: '621234',
          score: ''
        },
        {
          name: '李智超（班纳）6',
          staffNum: '621234',
          score: ''
        },
        {
          name: '李智超（班纳）7',
          staffNum: '621234',
          score: ''
        }
      ]
      exportPerformanceExcel('组员6月', data)
    }
  }
}
</script>

<style lang="less" scoped>
.crew-performance-management {
  .search-box {
    margin-bottom: 20px;

    .button-box {
      margin-left: auto;
    }
  }

  .alter-dialog {
    & /deep/ .el-dialog__body {
      padding: 10px 20px 0;
    }

    .el-form-item {
      margin-bottom: 0;
    }
  }
}
</style>
