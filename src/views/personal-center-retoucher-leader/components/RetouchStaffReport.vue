<template>
  <div class="retouch-report">
    <div class="report-box module-panel">
      <div class="search-box">
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
      <div class="retouch-report-table report-module">
        <div class="panel-title">修图报告</div>
        <div class="table-content">
          <list-table
            key="tableDataCount"
            :search-type.sync="searchType"
            :listdata="tableDataCount"
            @showSearchPage="onShowSearchPage"
          />
          <list-table
            key="tableDataRate"
            :search-type.sync="searchType"
            :listdata="tableDataRate"
            @showSearchPage="onShowSearchPage"
          />
        </div>
      </div>
      <div class="retouch-report-chat report-module">
        <retoucher-chart
          v-for="keyItem in chartShowKeys"
          :key="keyItem"
          :show-key="keyItem"
          :chart-datas="chartInfo"
        />
      </div>
    </div>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import ListTable from '@/components/ListTable'
import RetoucherChart from './RetoucherChart'
import CrewSelect from '@SelectBox/CrewSelect'

import { parseTime } from '@/utils/index.js'
import { joinTimeSpan } from '@/utils/timespan.js'
import { SearchType } from '@/utils/enumerate.js'
import * as RetouchLeader from '@/api/retouchLeader.js'
import * as Staff from '@/api/staff.js'

export default {
  name: 'RetouchReport',
  components: { DatePicker, ListTable, CrewSelect, RetoucherChart },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 时间戳
      staffId: '',
      allStaffs: [],
      searchType: '', // 搜索类型
      tableDataCount: {
        finishStreamNum: { label: '修图单量（正常）', value: '-', componentSwitch: true },
        finishPhotoNum: { label: '修图张数（正常）', value: '-' },
        overTimeStreamNum: { label: '超时单量', value: '-', componentSwitch: true },
        avgRetouchTime: { label: '修图平均用时', value: '-' },
        income: { label: '正常收益', labelDesc: '未扣除负收益', value: '-' },
        notReachStandardDays: { label: '未完成指标（天）', value: '-' }
      },
      tableDataRate: {
        goodEvaluationInfo: { label: '点赞数 / 点赞率', value: '- / -', componentSwitch: true, query: SearchType.GoodEvaluation },
        badEvaluationInfo: { label: '点踩数 / 点踩率', value: '- / -', componentSwitch: true, query: SearchType.BadEvaluation },
        npsEvaluate: { label: '顾客满意度（平均值）', value: '- / -' }
      },
      chartInfo: [],
      chartShowKeys: ['finishPhotoNum', 'retouchAvgTime', 'goodStreamNum']
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
  methods: {
    /**
     * @description 搜素数据
     */
    onShowSearchPage () {
      const sendMsg = {
        timeSpan: this.timeSpan,
        searchType: this.searchType
      }
      if (this.staffId) { sendMsg.staffId = this.staffId }
      this.$emit('showSearchPage', sendMsg)
    },
    /**
     * @description 获取组员
     */
    async getSelfStaffs () {
      const list = await Staff.getSelfStaffs()
      this.allStaffs = list.map(item => item.value)
    },
    /**
     * @description 获取组员修图报告
     */
    async getGroupStaffQuotaInfo () {
      const req = {
        startAt: joinTimeSpan(this.timeSpan[0]),
        endAt: joinTimeSpan(this.timeSpan[1], 1)
      }
      if (this.staffId) { req.staffId = this.staffId }
      const data = await RetouchLeader.getGroupStaffQuotaInfo(req)
      for (const key in data) {
        if (this.tableDataCount[key]) {
          this.tableDataCount[key].value = data[key]
        }
        if (this.tableDataRate[key]) {
          this.tableDataRate[key].value = data[key]
        }
      }
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
    /**
     * @description 搜索数据
     */
    searchData () {
      if (!this.timeSpan) {
        this.$newMessage.warning('请输入时间')
        return false
      }
      this.$store.dispatch('setting/showLoading', this.routeName)
      Promise.all([
        this.getGroupStaffQuotaInfo(),
        this.getStaffQuotaInfoGroupByStaff()
      ]).finally(() => {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      })
    }
  }
}
</script>

<style lang="less" scoped>
.report-box {
  .search-box {
    padding-bottom: 24px;
    margin-top: 0;
    border-bottom: 1px solid #ecedee;
  }
}

.module-panel {
  border-top-left-radius: 0;

  .retoucher-chart {
    &:last-of-type {
      margin-bottom: -48px;
    }
  }
}

.report-module {
  margin-top: 24px;
}

.table-content {
  margin-top: 20px;
}
</style>
