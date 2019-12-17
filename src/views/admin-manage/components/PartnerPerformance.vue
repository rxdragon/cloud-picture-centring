<template>
  <div class="partner-performance">
    <div class="search-box">
      <div class="search-item">
        <span>审核通过时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <div class="staff-search search-item">
        <span>云端伙伴</span>
        <staff-select v-model="staffIds" />
      </div>
      <div class="button-box">
        <el-button type="primary" @click="getRetoucherQuota(1)">查询</el-button>
      </div>
    </div>
    <div class="table-panel">
      <div class="retouch-order-statistics">
        <div class="panel-title">修图单量问题统计</div>
        <retouch-order-chart :chart-datas="orderStatisticsData" />
      </div>
      <div class="performance-statistics">
        <div class="panel-title">种拔草统计</div>
        <performance-chart :chart-datas="performanceData" />
      </div>
    </div>
    <div class="other-data">
      <div class="panel-title">其他数据</div>
      <div v-for="(itemData, itemIndex) in otherData" :key="itemIndex" class="num-box">
        <span class="num">
          <count-to :end-value="itemData.value" show-point />{{ itemIndex === 'storeEvaluateScoreAvg' ? '星' : '' }}
        </span>
        <div class="desc">{{ itemData.label }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import StaffSelect from '@SelectBox/StaffSelect'
import RetouchOrderChart from './chart-components/RetouchOrderChart'
import PerformanceChart from './chart-components/PerformanceChart'
import CountTo from '@/components/CountTo'
import moment from 'moment'
import { joinTimeSpan } from '@/utils/timespan.js'
import * as WorkManage from '@/api/workManage'

export default {
  name: 'PartnerPerformance',
  components: { DatePicker, StaffSelect, RetouchOrderChart, PerformanceChart, CountTo },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 时间戳
      staffIds: [], // 伙伴id
      otherData: {
        exp: { value: '0.00', label: '海草值' },
        income: { value: '0.00', label: '收益' },
        storeEvaluateScoreAvg: { value: '0.00', label: '门店评分（平均值）' },
        retoucherNpsAvg: { value: '0.00', label: '顾客满意度（平均值）' }
      },
      orderStatisticsData: {
        retoucherFinishStreamNum: { value: 0, label: '总单量' },
        retoucherFinishPhotoNum: { value: 0, label: '总张数' },
        overTimeStreamNum: { value: 0, label: '超时单量' },
        storeReturnStreamNum: { value: 0, label: '门店退单' },
        storeReturnPhotoNum: { value: 0, label: '门店退单张数' },
        storeReturnStreamNumForQuality: { value: 0, label: '门店退单（质量问题）' },
        storeReturnPhotoNumForQuality: { value: 0, label: '门店退单（质量问题）张数' },
        storeReturnStreamNumForNotQuality: { value: 0, label: '门店退单（非质量问题）' },
        storeReturnPhotoNumForNotQuality: { value: 0, label: '门店退单（非质量问题）张数' }
      },
      performanceData: {
        reviewPlant: { value: 0.00, label: '审核种草' },
        reviewPlantRate: { value: 0, label: '审核种草率' },
        reviewPull: { value: 0.00, label: '审核拔草' },
        reviewPullRate: { value: 0.00, label: '审核拔草率' },
        retoucherEvaluatedPlantNum: { value: 0.00, label: '抽查种草' },
        retoucherEvaluatedPlantRate: { value: 0, label: '抽查种草率' },
        retoucherEvaluatedPullNum: { value: 0.00, label: '抽查拔草' },
        retoucherEvaluatedPullRate: { value: 0.00, label: '抽查拔草率' },
        retoucherEvaluatedNoPlantNoPullNum: { value: 0.00, label: '直接通过' },
        retoucherEvaluatedNoPlantNoPullRate: { value: 0.00, label: '直接通过率' }
      }
    }
  },
  created () {
    const nowAt = moment().locale('zh-cn').format('YYYY-MM-DD')
    this.timeSpan = [nowAt, nowAt]
    this.getRetoucherQuota()
  },
  methods: {
    /**
     * @description 获取参数
     */
    getParams () {
      if (!this.timeSpan) {
        this.$newMessage.warning('请填写时间')
        return false
      }
      const req = {
        startAt: joinTimeSpan(this.timeSpan[0]),
        endAt: joinTimeSpan(this.timeSpan[1], 1)
      }
      if (this.staffIds.length) { req.staffIds = this.staffIds }
      return req
    },
    /**
     * @description 获取伙伴绩效
     */
    async getRetoucherQuota () {
      try {
        const req = this.getParams()
        if (!req) return false
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await WorkManage.getRetoucherQuota(req)
        for (const key in data) {
          if (this.otherData[key]) { this.otherData[key].value = data[key] }
          if (this.orderStatisticsData[key]) { this.orderStatisticsData[key].value = parseInt(data[key]) }
          if (this.performanceData[key]) { this.performanceData[key].value = data[key] }
        }
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
@import "~@/styles/variables.less";

.partner-performance {
  .search-box {
    .button-box {
      text-align: right;
    }

    .outsourc-staff-search {
      .el-input {
        width: 180px;
      }
    }

    .date-picker .el-range-editor.el-input__inner {
      width: 260px;
    }

    .el-date-editor .el-range-separator {
      width: 7%;
    }
  }

  .table-panel {
    margin-top: 32px;
    border-top: 1px solid #e8e8e8;
    border-bottom: 1px solid #e8e8e8;
    padding: 32px 0;
    display: flex;
    justify-content: space-between;

    .retouch-order-statistics {
      width: calc(~'50% - 11px');
      border-right: 1px solid #ebeef5;
      position: relative;
    }

    .performance-statistics {
      width: calc(~'50% - 11px');
      position: relative;
    }

    .panel-title {
      position: absolute;
      top: 0;
    }
  }

  .other-data {
    margin-top: 28px;

    .panel-title {
      margin-bottom: 24px;
    }

    .num-box {
      display: inline-block;
      padding-right: 49px;
      border-right: 1px solid #ebeef5;
      padding-left: 80px;

      .num {
        font-size: 36px;
        font-family: @DINAlternate;
        font-weight: bold;
        color: #303133;
        line-height: 42px;
      }

      .desc {
        font-size: 12px;
        font-family: @pingFang;
        color: #909399;
        line-height: 22px;
      }

      &:nth-last-of-type(1) {
        border: none;
      }

      &:nth-of-type(2) {
        padding-left: 0;
      }
    }
  }
}
</style>
