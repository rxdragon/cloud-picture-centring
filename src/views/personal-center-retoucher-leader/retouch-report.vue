<template>
  <div class="retouch-report page-class">
    <transition name="fade" mode="out-in">
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
            <el-button type="primary" @click="searchData">查 询</el-button>
          </div>
        </div>
        <div class="module-panel">
          <div class="panel-title">修图报告</div>
          <div class="table-content">
            <list-table key="tableDataCount" :search-type.sync="searchType" :is-seach-page.sync="isSeachPage" :listdata="tableDataCount" />
            <list-table key="tableDataRate" :search-type.sync="searchType" :is-seach-page.sync="isSeachPage" :listdata="tableDataRate" />
          </div>
        </div>
        <div class="module-panel">
          <retoucher-chart v-for="keyItem in chartShowKeys" :key="keyItem" :show-key="keyItem" :chart-datas="chartInfo" />
        </div>
      </div>
      <CrewRetouchHistory
        v-else
        :is-seach-page.sync="isSeachPage"
        :search-staff="staffId"
        :search-type.sync="searchType"
        :search-time="timeSpan"
      />
    </transition>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import ListTable from '@/components/ListTable'
import CrewRetouchHistory from './components/CrewRetouchHistory'
import RetoucherChart from './components/RetoucherChart'
import CrewSelect from '@SelectBox/CrewSelect'

import { parseTime } from '@/utils/index.js'
import { joinTimeSpan } from '@/utils/timespan.js'
import { SearchType } from '@/utils/enumerate.js'
import * as RetouchLeader from '@/api/retouchLeader.js'
import * as Staff from '@/api/staff.js'

export default {
  name: 'RetouchReport',
  components: { DatePicker, ListTable, CrewRetouchHistory, CrewSelect, RetoucherChart },
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
        finishStreamNum: { label: '修图单量', value: '-', componentSwitch: true },
        finishPhotoNum: { label: '修图张数', value: '-' },
        reworkStreamNum: { label: '重修次数', value: '-', componentSwitch: true },
        overTimeStreamNum: { label: '超时单量', value: '-', componentSwitch: true },
        avgRetouchTime: { label: '修图平均用时', value: '-' },
        income: { label: '收益', value: '-' },
        notReachStandardDays: { label: '未完成指标（天）', value: '-' }
      },
      tableDataRate: {
        reviewPlantInfo: { label: '审核种草 / 种草率', value: '- / -', componentSwitch: true, query: SearchType.CheckPlant },
        reviewPullInfo: { label: '审核拔草 / 拔草率', value: '- / -', componentSwitch: true, query: SearchType.CheckPull },
        spotCheckPlantInfo: {
          label: '抽查种草 / 种草率',
          value: '- / -',
          link: '',
          query: SearchType.SpotPlant
        },
        spotCheckPullInfo: {
          label: '抽查拔草 / 拔草率',
          value: '- / -',
          link: '',
          query: SearchType.SpotPull
        },
        spotCheckNoneInfo: {
          label: '抽查通过 / 直接通过率',
          value: '- / -',
          link: '',
          query: SearchType.SpotNone
        }
      },
      chartInfo: [],
      chartShowKeys: ['finishPhotoNum', 'retouchAvgTime', 'lekimaCount', 'reviewPlantPhotoNum', 'reviewPullPhotoNum']
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
     * @description 获取组员修图报告
     */
    async getGroupStaffQuotaInfo () {
      const req = {
        startAt: joinTimeSpan(this.timeSpan[0]),
        endAt: joinTimeSpan(this.timeSpan[1], 1)
      }
      if (this.staffId) { req.staffId = this.staffId }
      const data = await RetouchLeader.getGroupStaffQuotaInfo(req)
      const lintKey = ['spotCheckPlantInfo', 'spotCheckPullInfo', 'spotCheckNoneInfo']
      for (const key in data) {
        if (this.tableDataCount[key]) { this.tableDataCount[key].value = data[key] }
        if (this.tableDataRate[key]) {
          this.tableDataRate[key].value = data[key]
          if (lintKey.includes(key)) {
            const sendStaff = this.staffId ? [this.staffId] : this.allStaffs
            this.tableDataRate[key].link = '/assessment-center/assessment-history' +
              '?searchTimeSpan=' + this.timeSpan +
              '&searchType=' + this.tableDataRate[key].query +
              '&sendStaff=' + sendStaff
          }
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
    searchData () {
      if (!this.timeSpan) {
        this.$newMessage.warning('请输入时间')
        return false
      }
      this.$store.dispatch('setting/showLoading', this.routeName)
      Promise.all([
        this.getGroupStaffQuotaInfo(),
        this.getStaffQuotaInfoGroupByStaff()
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

.module-panel {
  margin-top: 20px;

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
