<template>
  <div class="audit-report page-class">
    <transition name="fade" mode="out-in">
      <div v-if="!isSeachPage" class="transition-box">
        <div class="header">
          <h3>组员审核报告</h3>
        </div>
        <el-row class="search-box" :gutter="20">
          <el-col :span="8" :xl="4">
            <div class="search-item">
              <span>时间</span>
              <date-picker v-model="timeSpan" />
            </div>
          </el-col>
          <el-col :span="8" :xl="4">
            <div class="search-item">
              <el-button type="primary" @click="setTimeSpan">查 询</el-button>
            </div>
          </el-col>
        </el-row>

        <div v-for="staffItem in staffList" :key="staffItem.value" class="tabel-content module-panel">
          <div class="tabel-title panel-title">【{{ staffItem.label }}】审核报告</div>
          <report-box :time-span="childrenTimeSpan" :staff-id="staffItem.value" @showDetail="getShowDetailInfo" />
        </div>
      </div>
      <CrewAuditHistory
        v-else
        :search-staff="staffId"
        :search-type.sync="searchType"
        :is-seach-page.sync="isSeachPage"
        :search-time="childrenTimeSpan"
      />
    </transition>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import CrewAuditHistory from './CrewAuditHistory/index'
import ReportBox from './components/ReportBox'
import { parseTime } from '@/utils/index.js'
import * as Staff from '@/api/staff.js'

export default {
  name: 'AuditReport',
  components: { DatePicker, CrewAuditHistory, ReportBox },
  props: {},
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 时间戳
      isSeachPage: false,
      searchType: '',
      staffList: [],
      staffId: '',
      childrenTimeSpan: null // 子组件时间
    }
  },
  created () {
    const nowTime = parseTime(new Date(), '{y}-{m}-{d}')
    this.timeSpan = [nowTime, nowTime]
    this.childrenTimeSpan = [nowTime, nowTime]
    this.getSelfStaffs()
  },
  methods: {
    /**
     * @description 获取组员
     */
    async getSelfStaffs () {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        this.staffList = await Staff.getSelfStaffs()
        this.staffList.unshift({
          label: '全部组员',
          value: 0
        })
      } catch (error) {
        console.error(error)
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 设置子组件时间
     */
    setTimeSpan () {
      if (!this.timeSpan) {
        this.$newMessage.warning('请输入时间')
        return
      }
      this.childrenTimeSpan = this.timeSpan
    },
    /**
     * @description 获取修图详情信息
     */
    getShowDetailInfo (data) {
      this.staffId = data.staffId
      this.searchType = data.searchType
      this.isSeachPage = true
    }
  }
}
</script>

<style lang="less" scoped>
.audit-report {
  .tabel-content {
    margin-bottom: 24px;

    &:last-of-type {
      margin-bottom: 0;
    }

    .tabel-title {
      margin-bottom: 20px;
      font-weight: bold;
    }
  }

  .list-tabel {
    margin-bottom: 24px;
  }
}
</style>
