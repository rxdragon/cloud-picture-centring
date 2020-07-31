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
          修图数量统计
          <tip :message="message"></tip>
        </div>
        <retouch-order-chart :chart-datas="orderStatisticsData" />
      </div>
    </div>
    <div class="other-data">
      <div class="panel-title">其他数据</div>
      <div v-for="(itemData, itemIndex) in otherData" :key="itemIndex" class="num-box">
        <span class="num">
          <count-to :end-value="itemData.value" show-point />{{ itemData.type === 'rate' ? '%' : '' }}
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
import CountTo from '@/components/CountTo'
import Tip from '@/components/Tip'
import moment from 'moment'
import { joinTimeSpan, delayLoading } from '@/utils/timespan.js'
import * as WorkManage from '@/api/workManage'

const message = `
<p><span class="bold">提示：</span>此处只可查询到正常修图的绩效信息</p>
<p><span class="bold">修图总单量：</span>流水号以C开头的数量</p>
<p><span class="bold">超时单量：</span>正常流水超时数量</p>
<p><span class="bold">修图总张数：</span>正常流水的照片张数，不包含模版照</p>
<p><span class="bold">点赞量/点踩量：</span>点赞量/点踩量，为流水纬度数量，存在云端审核完成门店未审核情况</p>
`

export default {
  name: 'PartnerPerformance',
  components: { DatePicker, StaffSelect, RetouchOrderChart, CountTo, Tip },
  data () {
    return {
      message,
      loading: false,
      timeSpan: null, // 时间戳
      staffIds: [], // 伙伴id
      otherData: {
        exp: { value: '0.00', label: '海草值' },
        income: { value: '0.00', label: '收益' },
        retoucherNpsAvg: { value: '0.00', label: '顾客满意度（顾客评价时间）' },
        goodRate: { value: '0.00', label: '点赞率', type: 'rate' },
        badRate: { value: '0.00', label: '点踩率', type: 'rate' }
      },
      orderStatisticsData: {
        retoucherFinishStreamNum: { value: 0, label: '修图总单量' },
        overTimeStreamNum: { value: 0, label: '超时单量' },
        retoucherFinishPhotoNum: { value: 0, label: '修图总张数' },
        goodStreamNum: { value: 0, label: '点赞单量' },
        badStreamNum: { value: 0, label: '点踩单量' }
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
        this.loading = true
        const data = await WorkManage.getRetoucherQuota(req)
        for (const key in data) {
          if (this.otherData[key]) { this.otherData[key].value = data[key] }
          if (this.orderStatisticsData[key]) { this.orderStatisticsData[key].value = parseInt(data[key]) }
        }
      } finally {
        await delayLoading()
        this.loading = false
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
      width: 100%;
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
      width: 20%;
      padding-left: 20px;
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
