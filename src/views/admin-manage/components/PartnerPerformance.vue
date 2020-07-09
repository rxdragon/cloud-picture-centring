<template>
  <div v-loading="loading" class="partner-performance">
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
        <div class="panel-title">
          修图问题统计
          <tip :message="message"></tip>
        </div>
        <retouch-order-chart :chart-datas="orderStatisticsData" />
      </div>
      <div class="performance-statistics">
        <div class="title-box">
          <div class="panel-title">
            云学院抽查统计
            <tip message="统计范围:该时间段修图完成的单子"></tip>
          </div>
          <div class="check-avg">抽查平均分：{{ checkData.checkAvgScore }}</div>
        </div>
        <div class="chart-box">
          <pie-chart :chart-data="checkData.checkTags" />
        </div>
      </div>
    </div>
    <div class="other-data">
      <div class="panel-title">其他数据</div>
      <div v-for="(itemData, itemIndex) in otherData" :key="itemIndex" class="num-box">
        <span class="num">
          <count-to :end-value="itemData.value" show-point />{{ itemIndex === 'goodRate' ? '%' : '' }}
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
import PieChart from '@/components/charts/PieChart'
import CountTo from '@/components/CountTo'
import Tip from '@/components/Tip'
import moment from 'moment'
import { joinTimeSpan } from '@/utils/timespan.js'
import * as WorkManage from '@/api/workManage'

const message = `
<p><span class="bold">张数统计:</span> 不包含模版照、不计收益和退单张数</p>
              <p><span class="bold">总数量:</span> 任何情况退单都会会新增总订单和总张数</p>
              <p><span class="bold">门店退单:</span> 同一修图师接到退单,不会增加</p>
`

export default {
  name: 'PartnerPerformance',
  components: { DatePicker, StaffSelect, RetouchOrderChart, PieChart, CountTo, Tip },
  data () {
    return {
      message,
      loading: false,
      timeSpan: null, // 时间戳
      staffIds: [], // 伙伴id
      otherData: {
        exp: { value: '0.00', label: '海草值' },
        income: { value: '0.00', label: '收益' },
        goodRate: { value: '0.00', label: '门店点赞率(云端完成时间)' },
        retoucherNpsAvg: { value: '0.00', label: '顾客满意度（顾客评价时间）' }
      },
      checkData: {},
      orderStatisticsData: {
        retoucherFinishStreamNum: { value: 0, label: '总单量' },
        retoucherFinishPhotoNum: { value: 0, label: '总张数' },
        overTimeStreamNum: { value: 0, label: '超时单量' },
        storeReturnStreamNum: { value: 0, label: '门店退单' },
        storeReturnPhotoNum: { value: 0, label: '门店退单张数' },
        lekimaStreamNum: { value: 0, label: '利奇马单量' },
        lekimaPhotoNum: { value: 0, label: '利奇马张数' },
        goodStreamNum: { value: 0, label: '点赞单量' },
        storeReturnStreamNumForQuality: { value: 0, label: '门店退单（质量问题）' },
        storeReturnPhotoNumForQuality: { value: 0, label: '门店退单（质量问题）张数' },
        storeReturnStreamNumForNotQuality: { value: 0, label: '门店退单（非质量问题）' },
        storeReturnPhotoNumForNotQuality: { value: 0, label: '门店退单（非质量问题）张数' }
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
      if (this.staffIds.length) {
        req.staffIds = this.staffIds
      }
      return req
    },
    /**
     * @description 获取伙伴绩效
     */
    async getRetoucherQuota () {
      try {
        const req = this.getParams()
        if (!req) return false
        this.loading = true
        const data = await WorkManage.getRetoucherQuota(req)
        this.checkData.checkTags = data.retoucherCheckCount
        this.checkData.childCheckTag = data.childCheckTag
        this.checkData.checkAvgScore = data.checkAvgScore
        for (const key in data) {
          if (this.otherData[key]) {
            this.otherData[key].value = data[key]
          }
          if (this.orderStatisticsData[key]) {
            this.orderStatisticsData[key].value = parseInt(data[key])
          }
        }
      } catch (error) {
        console.error(error)
      } finally {
        setTimeout(() => {
          this.loading = false
        }, 500)
      }
    }
  }
}
</script>

<style lang="less">
.bold {
  font-weight: bold;
}

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
    display: flex;
    justify-content: space-between;
    padding: 32px 0;
    margin-top: 32px;
    border-top: 1px solid #e8e8e8;
    border-bottom: 1px solid #e8e8e8;

    .retouch-order-statistics {
      position: relative;
      width: calc(~'50% - 11px');
      border-right: 1px solid #ebeef5;
    }

    .performance-statistics {
      position: relative;
      width: calc(~'50% - 11px');

      .title-box {
        .check-avg {
          float: right;
          font-size: 13px;
          color: #45454d;
        }
      }

      .chart-box {
        height: 240px;
        margin-top: 24px;
      }
    }

    .panel-title {
      position: absolute;
      top: 0;
      z-index: 1;
      height: 24px;
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
      padding-left: 80px;
      border-right: 1px solid #ebeef5;

      .num {
        font-family: @DINAlternate;
        font-size: 36px;
        font-weight: bold;
        line-height: 42px;
        color: #303133;
      }

      .desc {
        font-family: @pingFang;
        font-size: 12px;
        line-height: 22px;
        color: #909399;
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
