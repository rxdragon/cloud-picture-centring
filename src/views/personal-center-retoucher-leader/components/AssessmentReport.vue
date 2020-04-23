<template>
  <div class="retouch-report page-class">
    <div v-if="!isSeachPage" class="report-box">
      <div class="search-box module-panel">
        <div class="search-item">
          <span>时间</span>
          <date-picker v-model="timeSpan" />
        </div>
        <div class="staff-option search-item">
          <span>组员</span>
          <crew-select v-model="staffId" />
        </div>
        <div class="button-box">
          <el-button type="primary" @click="searchData">查 询</el-button>
        </div>
      </div>
      <div class="module-panel">
        <div class="panel-title">云学院报告</div>
        <div class="table-content">
          <list-table key="tableDataCount" :search-type.sync="searchType" :is-seach-page.sync="isSeachPage" :listdata="tableDataCount" />
        </div>
      </div>
      <div class="module-panel charts-box">
        <div class="chart-item">
          <retoucher-chart v-for="keyItem in chartShowKeys" :key="keyItem" :show-key="keyItem" :chart-datas="barData" />
        </div>
        <div class="chart-item">
          <div class="panel-title">问题详情</div>
          <pie-chart :chart-data="pieData"></pie-chart>
        </div>
      </div>
    </div>
    <CrewRetouchHistory
      v-else
      :is-seach-page.sync="isSeachPage"
      :search-staff="staffId"
      :search-type.sync="searchType"
      :search-time="timeSpan"
    />
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import ListTable from '@/components/ListTable'
import CrewRetouchHistory from './CrewRetouchHistory'
import RetoucherChart from './RetoucherChart'
import CrewSelect from '@SelectBox/CrewSelect'
import PieChart from '@/components/charts/PieChart'

import { parseTime } from '@/utils/index.js'
import { joinTimeSpan } from '@/utils/timespan.js'
import * as RetouchLeader from '@/api/retouchLeader.js'
import * as Staff from '@/api/staff.js'

export default {
  name: 'RetouchReport',
  components: { DatePicker, ListTable, CrewRetouchHistory, CrewSelect, PieChart, RetoucherChart },
  props: {},
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 时间戳
      isSeachPage: false,
      staffId: 0,
      allStaffs: [],
      searchType: '', // 搜索类型
      tableDataCount: {
        evaluatePhotosNum: { label: '评价照片量', value: '-', componentSwitch: true },
        waterhotosNum: { label: '液化问题照片', value: '-', componentSwitch: true },
        skinPhotosNum: { label: '磨皮问题照片', value: '-', componentSwitch: true },
        otherPhotosNum: { label: '其他问题照片', value: '-', componentSwitch: true },
        retoucherScoreAvg: { label: '评价平均分', value: '-' },
      },
      pieData: [],
      barData: [],
      chartShowKeys: ['avgScore'],
    }
  },
  computed: {
    sendStaff () {
      return this.staffId ? [this.staffId] : this.allStaffs
    },
    linkTime () {
      return this.timeSpan
    }
  },
  async created () {
    const nowTime = parseTime(new Date(), '{y}-{m}-{d}')
    this.timeSpan = [nowTime, nowTime]
    await this.getSelfStaffs()
    this.searchData()
  },
  watch: {
    isSeachPage (val) {
      this.$emit('changeShowTab',val)
    }
  },
  methods: {
    /**
     * @description 获取组员
     */
    async getSelfStaffs () {
      const list = await Staff.getSelfStaffs()
      this.allStaffs = list.map(item => item.value)
    },
    /**
     * @description 获取详情
     */
    showDetail () {
      this.isSeachPage = true
    },
    /**
     * @description 获取组员照片问题报告
     */
    async getStaffTProblemsPhotoList () {
      const req = {
        startAt: joinTimeSpan(this.timeSpan[0]),
        endAt: joinTimeSpan(this.timeSpan[1], 1)
      }
      if (this.staffId) {
        req.staffId = this.staffId
      }
      const data = await RetouchLeader.getStaffTProblemsPhotoList(req)
      for (const key in data) {
        if (this.tableDataCount[key]) {
          this.tableDataCount[key].value = data[key]
        }
      }
    },
    /**
     * @description 获取云学院问题照片饼图
     */
    async getStaffProblemReport () {
      const req = {
        startAt: joinTimeSpan(this.timeSpan[0]),
        endAt: joinTimeSpan(this.timeSpan[1], 1),
        staffId: this.staffId
      }
      this.pieData = await RetouchLeader.getStaffProblemReport(req)
    },
    /**
     * @description 获取学员平均分柱状图
     */
    async getStaffAverageScore () {
      const req = {
        startAt: joinTimeSpan(this.timeSpan[0]),
        endAt: joinTimeSpan(this.timeSpan[1], 1),
        staffId: this.staffId
      }
      this.barData = await RetouchLeader.getStaffAverageScore(req)
    },
    /**
     * @description 获取组员对比数据
     */
    async getStaffQuotaInfoGroupByStaff () {
      const req = {
        startAt: joinTimeSpan(this.timeSpan[0]),
        endAt: joinTimeSpan(this.timeSpan[1], 1)
      }
      this.chartInfo = await RetouchLeader.getStaffQuotaInfoGroupByStaff(req)
    },
    searchData () {
      if (!this.timeSpan) {
        this.$newMessage.warning('请输入时间')
        return false
      }
      this.$store.dispatch('setting/showLoading', this.routeName)
      Promise.all([
        this.getStaffTProblemsPhotoList(),
        this.getStaffQuotaInfoGroupByStaff(),
        this.getStaffProblemReport(),
        this.getStaffAverageScore()
      ]).catch(error => {
        console.error(error)
      }).finally(() => {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      })
    }
  }
}
</script>

<style lang="less" scoped>
.report-title {
  margin-top: 20px;
  font-weight: bold;
}

.charts-box {
  display: flex;

  .chart-item {
    flex: 1;
    height: 300px;
  }
}

.module-panel {
  margin-bottom: 20px;

  .retoucher-chart {
    &:last-of-type {
      margin-bottom: -48px;
    }
  }
}

.table-content {
  margin-top: 20px;
}
</style>
