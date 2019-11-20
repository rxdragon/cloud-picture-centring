<template>
  <div class="audit-report">
    <transition name="fade" mode="out-in">
      <div v-if="!isSeachPage" class="transition-box">
        <div class="header">
          <h3>组员审核报告</h3>
        </div>
        <div class="search-box">
          <div class="search-item">
            <span>时间</span>
            <date-picker v-model="timeSpan" />
          </div>
          <div class="staff-box search-item">
            <span>组员</span>
            <crew-select v-model="staffId" />
          </div>
          <div class="button-box">
            <el-button type="primary" @click="getGroupReviewQuota">查 询</el-button>
          </div>
        </div>
        <div class="tabel-content module-panel">
          <div class="tabel-title panel-title">小组审核报告</div>
          <list-table key="tableDataCount" :search-type.sync="searchType" :is-seach-page.sync="isSeachPage" :listdata="tableDataCount" />
          <list-table key="tableDataRate" :search-type.sync="searchType" :is-seach-page.sync="isSeachPage" :listdata="tableDataRate" />
        </div>
      </div>
      <CrewAuditHistory
        v-else
        :search-staff="staffId"
        :search-type.sync="searchType"
        :is-seach-page.sync="isSeachPage"
        :search-time="timeSpan"
      />
    </transition>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import ListTable from '@/components/ListTable'
import CrewAuditHistory from './CrewAuditHistory/index'
import CrewSelect from '@SelectBox/CrewSelect'
import { joinTimeSpan } from '@/utils/timespan.js'

import { parseTime } from '@/utils/index.js'
import * as ReviewCheck from '@/api/reviewCheck.js'

export default {
  name: 'AuditReport',
  components: { DatePicker, ListTable, CrewAuditHistory, CrewSelect },
  props: {},
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 时间戳
      isSeachPage: false,
      staffId: 0,
      searchType: '',
      tableDataCount: [
        {
          label: '审核单量',
          value: '-',
          componentSwitch: false
        }, {
          label: '审核张数',
          value: '-'
        }, {
          label: '审核平均用时',
          value: '-',
          componentSwitch: false
        }, {
          label: '审核种草(张) / 种草率(%)',
          value: '-',
          componentSwitch: false
        }, {
          label: '审核拔草(张) / 拔草率(%)',
          value: '-'
        }, {
          label: '抽查种草(张) / 种草率(%)',
          value: '-'
        }, {
          label: '抽查拔草(张) / 拔草率(%)',
          value: '-'
        }
      ],
      tableDataRate: [
        {
          label: '纠偏意见不同单位：(张 / %)',
          value: '- / -',
          componentSwitch: false
        }, {
          label: '纠偏意见不同-种草单位：(张 / %)',
          value: '- / -',
          componentSwitch: false
        }, {
          label: '纠偏意见不同-拔草单位：(张 / %)',
          value: '- / -',
          componentSwitch: false
        }, {
          label: '纠偏意见不同-不种不拔单位：(张 / %)',
          value: '- / -',
          componentSwitch: false
        }, {
          label: '纠偏意见相同单位：(张 / %)',
          value: '- / -',
          componentSwitch: false
        }
      ]
    }
  },
  created () {
    const nowTime = parseTime(new Date(), '{y}-{m}-{d}')
    this.timeSpan = [nowTime, nowTime]
    this.getGroupReviewQuota()
  },
  mounted () {
    window.removeEventListener('popstate', null, false)
  },
  methods: {
    /**
     * @description 获取审核指标
     */
    async getGroupReviewQuota () {
      try {
        if (!this.timeSpan) {
          this.$newMessage.warning('请填写时间')
          return false
        }
        const reqData = {
          range: 'group',
          startAt: joinTimeSpan(this.timeSpan[0]),
          endAt: joinTimeSpan(this.timeSpan[1], 1)
        }
        if (this.staffId) { reqData.staffId = this.staffId }
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await ReviewCheck.getGroupReviewQuota(reqData)
        data.tableDataCount.forEach(item => {
          if (item.link) {
            delete item.link
            item.componentSwitch = true
          }
        })
        data.tableDataRate.forEach(item => {
          if (item.link) {
            delete item.link
            item.componentSwitch = true
          }
        })
        this.tableDataCount = data.tableDataCount
        this.tableDataRate = data.tableDataRate
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    }
  }
}
</script>

<style lang="less">
.audit-report {
  .search-box {
    display: flex;
  }

  .tabel-content {
    margin-top: 24px;

    .tabel-title {
      font-weight: bold;
      margin-bottom: 20px;
    }
  }

  .list-tabel {
    margin-bottom: 24px;
  }
}
</style>
