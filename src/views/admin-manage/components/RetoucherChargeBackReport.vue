<template>
  <div class="retoucher-charge-back-report" v-loading="loading">
    <div class="search-box">
      <div class="search-item">
        <span>时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <div class="staff-option search-item">
        <span>云端伙伴</span>
        <staff-select v-model="staffIds" />
      </div>
      <div class="button-box search-item">
        <el-button type="primary" @click="searchData">查 询</el-button>
      </div>
    </div>
    <!-- 退单单量统计 -->
    <div class="charge-back-chat charge-back-module">
      <div class="panel-title">退单单量统计</div>
      <charge-back-chat :chart-datas="chatData" />
    </div>
    <div class="charge-back-chat charge-back-module">
      <div class="panel-title">其他数据</div>
      <div class="panel-content">
        <div class="info-item" v-for="(otherItem, otherIndex) in otherInfo" :key="otherIndex">
          <div class="info-header">
            <div class="info-title">{{ otherItem.title }}</div>
            <div class="info-desc">{{ otherItem.desc || '&nbsp;' }}</div>
          </div>
          <div class="info-value">
            <template v-if="otherItem.type === 'money'">{{ otherItem.value | toFixedString }}</template>
            <template v-else-if="otherItem.type === 'time'">{{ otherItem.value | toTimeFormatText }}</template>
            <template v-else>{{ otherItem.value | toFixedString }}</template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import StaffSelect from '@SelectBox/StaffSelect'
import ChargeBackChat from '@/components/ChartComponents/ChargeBackChat'
import moment from 'moment'

import { joinTimeSpan, delayLoading } from '@/utils/timespan.js'

import * as ReturnTarget from '@/api/returnTarget'

export default {
  name: 'RetoucherChargeBackReport',
  components: { DatePicker, StaffSelect, ChargeBackChat },
  data () {
    return {
      timeSpan: null,
      staffIds: [],
      loading: false,
      otherInfo: {
        storeReturnIncome: { title: '退单总收益', desc: '门店退回云端所获得实际收益', value: '0.00', type: 'money' },
        storeReturnIncomeForQuality: { title: '退单质量问题获得收益', desc: '', value: '0.00', type: 'money' },
        storeReturnIncomeForNotQuality: { title: '退单非质量问题获得收益', desc: '', value: '0.00', type: 'money' },
        punishIncome: { title: '被退单质量问题扣除收益', desc: '', value: '0.00', type: 'money' },
        storeReturnExp: { title: '退单总海草', desc: '门店退回云端所获得实际海草', value: '0.00' },
        storeReturnExpForQuality: { title: '退单质量问题获得海草', desc: '', value: '0.00' },
        storeReturnExpForNotQuality: { title: '退单非质量问题获得海草', desc: '', value: '0.00' },
        punishExp: { title: '退单质量问题扣除海草', desc: '', value: '0.00' },
        storeReturnRetouchTime: { title: '门店退回修图时长', desc: '门店退回至云端再次提交的平均修图时长（单）', value: '0.00', type: 'time' },
        storeReturnPhotoRate: { title: '退张率', desc: '质量问题', value: '0.00' },
        // todo 
        storeReturnRollbackRevenue: { title: '退单回滚收益', desc: '', value: '0.00' },
        storeReturnRollbackSeaGrass: { title: '退单回滚海草', desc: '', value: '0.00' }
      },
      chatData: [
        {
          name: '被门店退回（总）',
          orderCount: 0,
          photoCount: 0
        },
        {
          name: '云端完成退回订单（总）',
          orderCount: 0,
          photoCount: 0
        },
        {
          name: '被退回质量问题',
          orderCount: 0,
          photoCount: 0
        },
        {
          name: '被退回非质量问题',
          orderCount: 0,
          photoCount: 0
        },
        {
          name: '被退回非质量&质量问退',
          orderCount: 0,
          photoCount: 0
        }
      ]
    }
  },
  created () {
    const nowAt = moment().format('YYYY-MM-DD')
    this.timeSpan = [nowAt, nowAt]
    this.searchData()
  },
  methods: {
    /**
     * @description 搜索数据
     */
    async searchData () {
      try {
        if (!this.timeSpan) return this.$newMessage.warning('请输入时间')
        const req = {
          startAt: joinTimeSpan(this.timeSpan[0]),
          endAt: joinTimeSpan(this.timeSpan[1], 1)
        }
        if (this.staffIds.length) { req.retouchIds = this.staffIds }
        this.loading = true
        const data = await ReturnTarget.getStoreReturnQuota(req)
        this.chatData = data.chatData
        for (const key in this.otherInfo) {
          if (key === 'storeReturnExpForNotQuality') {
            this.otherInfo[key].value = data.tableInfo['storeReturnExpForNotQuality'] + data.tableInfo['storeReturnExpForBoth']
          } else if (key === 'storeReturnIncomeForNotQuality') {
            this.otherInfo[key].value = data.tableInfo['storeReturnIncomeForNotQuality'] + data.tableInfo['storeReturnIncomeForBoth']
          } else {
            this.otherInfo[key].value = data.tableInfo[key]
          }
        }
      } finally {
        await delayLoading()
        this.loading = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.search-box {
  border-bottom: 1px solid #ecedee;

  .search-item {
    margin-bottom: 24px;
  }
}

.charge-back-module {
  margin-top: 24px;

  .panel-content {
    display: flex;
    flex-wrap: wrap;
    margin-top: 24px;

    .info-item {
      display: flex;
      flex-direction: column;
      width: 25%;

      .info-header {
        flex-grow: 1;
        padding: 14px 12px;
        text-align: center;
        background-color: #fafafa;

        .info-title {
          font-size: 14px;
          font-weight: 500;
          line-height: 22px;
          color: #303133;
        }

        .info-desc {
          font-size: 14px;
          font-weight: 500;
          line-height: 22px;
          color: #8f9398;
        }
      }

      .info-value {
        padding: 21px 0;
        font-size: 14px;
        font-weight: 400;
        color: #606266;
        text-align: center;
      }
    }
  }
}
</style>
