<template>
  <div class="retoucher-group-goals" v-loading="loading">
    <el-row class="search-box" :gutter="20">
      <!-- 时间 -->
      <el-col :span="8">
        <div class="search-item">
          <span>选择日期</span>
          <date-picker type="date" v-model="date" />
        </div>
      </el-col>
      <!-- 修图组 -->
      <el-col :span="8">
        <div class="staff-search search-item">
          <el-button type="primary" @click="getRetoucherGoalList">查 询</el-button>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="search-item set-goals">
          <el-button slot="reference" type="primary" @click="showDialog = true">设置每日目标完成总量</el-button>
        </div>
      </el-col>
    </el-row>

    <div class="set-info">
      <div><span>今日设定值：</span><span>1099 张</span></div>
      <div><span>今日基础总张数：</span><span>1099 张</span></div>
      <div><span>实际已完成：</span><span>1099 张</span></div>
      <div><span>摄影上传总张数：</span><span>1099 张</span></div>
    </div>

    <div class="module-table-box">
      <el-table :data="tableData" style="width: 100%;">
        <el-table-column prop="groupName" label="修图组"/>
        <el-table-column prop="groupLeader" label="上班人数" />
        <el-table-column prop="groupLeaderJobNumber" label="基础修图总张数" />
        <el-table-column prop="groupLeaderJobNumber" label="加浮动人数" />
        <el-table-column prop="groupLeaderJobNumber" label="预计浮动张数" />
        <el-table-column prop="groupLeaderJobNumber" label="实际浮动张数" />
        <el-table-column prop="groupLeaderJobNumber" label="其他张数">
          <template slot-scope="{ row }">
            <p>请假减少：{{ row.returnRate }}%</p>
            <p>其他冲抵：{{ row.returnRateRank }}</p>
          </template>
        </el-table-column>
        <el-table-column prop="groupLeaderJobNumber" label="目标修图张数" />
        <el-table-column prop="groupLeaderJobNumber" label="实际今日已完成" />
        <el-table-column prop="groupLeaderJobNumber" label="是否达标" />
        <el-table-column label="操作" width="80px">
          <template slot-scope="{ row }">
            <el-button @click="handleEdit(row)">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      width="35%"
      title="设置每日目标完成总量"
      center
      custom-class="empty-dialog"
      :visible.sync="showDialog"
    >
      <div>
        <span class="empty-title">预计完成总张数:</span>
        <el-input-number
          v-numberOnly
          type="number"
          style="width: 180px; margin-left: 20px;"
          class="ml-10"
          :min="0"
          :max="9999999"
          v-model="totalGoals"
        ></el-input-number>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="showDialog = false">取 消</el-button>
        <el-button type="primary" @click="handleConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import * as PerformanceApi from '@/api/performance.js'
import dayjs from 'dayjs'

export default {
  name: 'RetouchingGroupGoals',
  components: { DatePicker },
  data () {
    return {
      loading: false,
      showDialog: false,
      date: dayjs().format('YYYY-MM-DD'), // 查询时间
      tableData: [],
      totalGoals: 0
    }
  },
  mounted () {
    this.getRetoucherGoalList()
  },
  methods: {
    /**
     * @description 获取列表
     */
    async getRetoucherGoalList () {
      this.loading = true
      const params = {
        date: this.date
      }
      const tableData = await PerformanceApi.getRetoucherGoalList(params)
        .finally(() => {
          this.loading = false
        })
      this.tableData = tableData || []
    },
    handleConfirm () {
      this.showDialog = false
      this.$message.success('设置云端今日目标完成值成功。')
    },
    handleEdit () {
      //
    }
  }
}
</script>

<style lang="less" scoped>
.retoucher-group-goals {
  .set-goals {
    justify-content: flex-end;
  }

  .set-info {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    font-size: 14px;

    & > div {
      margin-right: 20px;
    }
  }

  .module-table-box {
    & /deep/ .el-table__body-wrapper {
      max-height: calc(100vh - 396px);
      overflow-y: auto;
    }
  }
}
</style>

