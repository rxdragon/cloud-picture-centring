<template>
  <div class="retouch-report">
    <div v-if="!isSeachPage" class="transition-box">
      <div class="header">
        <h3>组员修图报告</h3>
      </div>
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
          <el-button type="primary" @click="getGroupStaffQuotaInfo">查 询</el-button>
        </div>
      </div>
      <div class="module-panel">
        <div class="panel-title">修图报告</div>
        <div class="table-content">
          <list-table key="tableDataCount" :search-type.sync="searchType" :is-seach-page.sync="isSeachPage" :listdata="tableDataCount" />
          <list-table key="tableDataRate" :search-type.sync="searchType" :is-seach-page.sync="isSeachPage" :listdata="tableDataRate" />
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
import CrewRetouchHistory from './components/CrewRetouchHistory'
import CrewSelect from '@SelectBox/CrewSelect'

import { parseTime } from '@/utils/index.js'
import { joinTimeSpan } from '@/utils/timespan.js'
import * as RetouchLeader from '@/api/retouchLeader.js'

export default {
  name: 'RetouchReport',
  components: { DatePicker, ListTable, CrewRetouchHistory, CrewSelect },
  props: {},
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 时间戳
      isSeachPage: false,
      staffId: 0,
      searchType: '', // 搜索类型
      tableDataCount: [{
        label: '修图单量',
        value: '-',
        componentSwitch: false
      }, {
        label: '修图张数',
        value: '-'
      }, {
        label: '重修次数',
        value: '-',
        componentSwitch: false
      }, {
        label: '超时单量',
        value: '-',
        componentSwitch: false
      }, {
        label: '修图平均用时',
        value: '-'
      }, {
        label: '收益',
        value: '-'
      }, {
        label: '未完成指标（天）',
        value: '-'
      }],
      tableDataRate: [{
        label: '审核种草 / 种草率',
        value: '- / -',
        componentSwitch: false
      }, {
        label: '审核拔草 / 拔草率',
        value: '- / -',
        componentSwitch: false
      }, {
        label: '抽查种草 / 种草率',
        value: '- / -',
        componentSwitch: false
      }, {
        label: '抽查拔草 / 拔草率',
        value: '- / -',
        componentSwitch: false
      }]
    }
  },
  created () {
    const nowTime = parseTime(new Date(), '{y}-{m}-{d}')
    this.timeSpan = [nowTime, nowTime]
    this.getGroupStaffQuotaInfo()
  },
  methods: {
    /**
     * @description 获取详情
     */
    showDetail () {
      this.isSeachPage = true
    },
    /**
     * @description 获取组员修图报告
     */
    async getGroupStaffQuotaInfo () {
      try {
        if (!this.timeSpan) {
          this.$newMessage.warning('请输入时间')
          return false
        }
        this.$store.dispatch('setting/showLoading', this.routeName)
        const req = {
          startAt: joinTimeSpan(this.timeSpan[0]),
          endAt: joinTimeSpan(this.timeSpan[1], 1)
        }
        const data = await RetouchLeader.getGroupStaffQuotaInfo(req)
        this.tableDataCount = data.tableDataCount
        this.tableDataRate = data.tableDataRate
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        throw new Error(error)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.report-title {
  margin-top: 20px;
  font-weight: bold;
}

.module-panel {
  margin-top: 20px;
}

.table-content {
  margin-top: 20px;
}
</style>
