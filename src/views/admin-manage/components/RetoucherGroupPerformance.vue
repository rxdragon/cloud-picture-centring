<template>
  <div class="retoucher-group-performance" v-loading="loading">
    <div class="search-box">
      <div class="search-item">
        <span>时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <div class="staff-search search-item">
        <span>修图组</span>
        <retoucher-group-select v-model="retoucherGroupValue" />
      </div>
      <div class="search-item">
        <el-button type="primary" @click="searchPerformance">查 询</el-button>
      </div>
      <div class="tip-box search-item">
        <tip :message="tipMessage" />
      </div>
    </div>
    <div class="module-table-box">
      <el-table :data="tableData" style="width: 100%;">
        <el-table-column prop="groupName" label="修图组"/>
        <el-table-column prop="groupLeader" label="修图主管" />
        <el-table-column prop="groupLeaderJobNumber" label="主管工号" />
        <el-table-column label="退张" sortable sort-by="returnRateRank">
          <template slot-scope="{ row }">
            <p>退张率：{{ row.returnRate }}%</p>
            <p>排名：{{ row.returnRateRank }}</p>
          </template>
        </el-table-column>
        <el-table-column label="抽查" sortable sort-by="averageScoreRank">
          <template slot-scope="{ row }">
            <p>平均分：{{ row.averageScore }}</p>
            <p>排名：{{ row.averageScoreRank }}</p>
          </template>
        </el-table-column>
        <el-table-column label="绩效" sortable sort-by="kpiScoreRank">
          <template slot-scope="{ row }">
            <p>得分：{{ row.kpiScore }}</p>
            <p>排名：{{ row.kpiScoreRank }}</p>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import RetoucherGroupSelect from '@SelectBox/RetoucherGroupSelect'
import Tip from '@/components/Tip'
import moment from 'moment'
import { delayLoading } from '@/utils/timespan.js'

import * as Performance from '@/api/performance.js'


const tipMessage = `列表中，绩效是人工导入，其余的是由系统进行计算得出的排名。<br/>
排名和平均分的规则为每个月最后一天23:59:59<i>自动冻结</i>当月的排名和分数,<br/>
只有当月的是实时根据天数进行变化的。`

export default {
  name: 'RetoucherGroupPerformance',
  components: { DatePicker, RetoucherGroupSelect, Tip },
  data () {
    return {
      tipMessage,
      timeSpan: null, // 查询时间
      retoucherGroupValue: '', // 修图组
      tableData: [],
      loading: false
    }
  },
  created () {
    const nowAt = moment().locale('zh-cn').format('YYYY-MM-DD')
    const beginningOfMonth = moment(nowAt).format('YYYY-MM-')
    const startAt = beginningOfMonth + '01'
    this.timeSpan = [startAt, nowAt]
    this.searchPerformance()
  },
  methods: {
    /**
     * @description 查询修图组绩效
     */
    async searchPerformance () {
      try {
        if (!this.timeSpan) throw new Error('请选择时间')
        if (moment(this.timeSpan[0]).get('year') !== moment(this.timeSpan[1]).get('year')) throw new Error('不能隔年查询')
        if (moment(this.timeSpan[0]).get('month') !== moment(this.timeSpan[1]).get('month')) throw new Error('不能隔月查询')
        this.loading = true
        const req = {
          startAt: this.timeSpan[0],
          endAt: this.timeSpan[1]
        }
        if (this.retoucherGroupValue) { req.groupId = this.retoucherGroupValue }
        const data = await Performance.getGroupScoreRanks(req)
        this.tableData = data
      } catch (error) {
        console.error(error)
        this.$newMessage.warning(error.message)
      } finally {
        await delayLoading()
        this.loading = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.retoucher-group-performance {
  .search-box {
    margin-bottom: 20px;
  }

  .module-table-box {
    & /deep/ .el-table__body-wrapper {
      max-height: calc(100vh - 396px);
      overflow-y: auto;
    }
  }
}
</style>
