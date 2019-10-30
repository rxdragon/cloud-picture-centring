<template>
  <div class="performance">
    <div class="header">
      <h3>修图机构绩效</h3>
    </div>
    <div class="search-box">
      <div class="search-item">
        <span>时间</span>
        <date-picker v-model="timeSpan" shortcuts />
      </div>
      <div class="instituion-box search-item">
        <span>机构名称</span>
        <institution-select v-model="instituionType" institution-class="retouch" />
      </div>
      <div class="button-box">
        <el-button :disabled="!timeSpan" type="primary" @click="getRetouchOrgIncome">查 询</el-button>
      </div>
    </div>
    <div class="table-box">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="instituionName" label="机构名" />
        <el-table-column prop="soloNum" label="单人（单位：张）" />
        <el-table-column prop="multiplayerNum" label="多人（单位：张）" />
        <el-table-column prop="earningsCredit" label="应获收益" />
        <el-table-column prop="impulseMoney" label="冲量奖励" />
        <el-table-column prop="deductMoney" label="扣除收益" />
        <el-table-column prop="realityMoney" label="实际收益" />
      </el-table>
    </div>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import InstitutionSelect from '@SelectBox/InstitutionSelect'

import { parseTime } from '@/utils/index.js'
import { joinTimeSpan } from '@/utils/timespan.js'
import * as Institution from '@/api/institution.js'

export default {
  name: 'Performance',
  components: { DatePicker, InstitutionSelect },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null,
      instituionType: '', // 机构类型
      tableData: []
    }
  },
  created () {
    const nowTime = parseTime(new Date(), '{y}-{m}-{d}')
    this.timeSpan = [nowTime, nowTime]
    this.getRetouchOrgIncome()
  },
  methods: {
    async getRetouchOrgIncome () {
      if (!this.timeSpan) {
        return this.$newMessage.warning('请输入时间')
      }
      const req = {
        startAt: joinTimeSpan(this.timeSpan[0]),
        endAt: joinTimeSpan(this.timeSpan[1], 1)
      }
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        if (this.instituionType) { req.retoucherOrgId = this.instituionType }
        this.tableData = await Institution.getRetouchOrgIncome(req)
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        throw new Error(error)
      }
    }
  }
}
</script>
