<template>
  <div class="charge-performance">
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
    <div class="table-module-box">
      <el-table :data="tableData" style="width: 100%;">
        <el-table-column prop="date" label="伙伴姓名（姓名）" />
        <el-table-column prop="name" label="修图组" />
        <el-table-column prop="name" label="工号" />
        <el-table-column prop="name" label="绩效得分" />
        <el-table-column prop="name" label="最后操作时间" />
        <el-table-column prop="name" label="最后操作人" />
        <el-table-column label="操作">
          <template slot-scope="{ row }">
            <el-button type="primary" size="mini" @click="alterPerformance(row.orderId)">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <alter-performance v-if="dialogVisible" @visibeClose="closeDialog" />
  </div>
</template>

<script>
import exportPerformanceExcel, { headerCellkeys } from "@/utils/exportPerformanceExcel.js"
import AlterPerformance from '@/components/AlterPerformance'
import UploadExcel from '@/components/UploadExcel'

export default {
  name: 'ChargePerformance',
  components: { UploadExcel, AlterPerformance },
  data() {
    return {
      timeSpan: null,
      headerKeys: headerCellkeys,
      tableData: [
        {
          date: '1'
        }
      ],
      pager: {
        page: 1,
        pageSize: 99,
      },
      dialogVisible: false,
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
    closeDialog () {
      this.dialogVisible = false
    },
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
    },
    /**
     * @description 页面更改
     */
    handleCurrentChange () {
      // TODO
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
    }
  }
}
</script>

<style lang="less" scoped>
.charge-performance {
  .search-box {
    margin-bottom: 20px;

    .button-box {
      margin: 0 0 0 auto;
    }
  }
}
</style>
