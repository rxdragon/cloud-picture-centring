<template>
  <div class="performance page-class">
    <div class="header">
      <h3>修图机构绩效</h3>
    </div>
    <el-row class="search-box" :gutter="20">
      <el-col :span="8" :xl="4">
        <div class="search-item">
          <span>创建时间</span>
          <date-picker v-model="timeSpan" shortcuts />
        </div>
      </el-col>
      <el-col :span="8" :xl="4">
        <div class="instituion-box search-item">
          <span>机构名称</span>
          <institution-select v-model="instituionType" institution-class="retouch" />
        </div>
      </el-col>
      <el-col :span="8" :xl="4">
        <div class="button-box search-item">
          <el-button :disabled="!timeSpan" type="primary" @click="getRetouchOrgIncome">查 询</el-button>
        </div>
      </el-col>
    </el-row>

    <div class="table-box">
      <el-table :data="tableData" style="width: 100%;">
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
    /**
     * @description 获取机构绩效
     */
    async getRetouchOrgIncome () {
      try {
        if (!this.timeSpan) throw new Error('请输入时间')
        const req = {
          startAt: joinTimeSpan(this.timeSpan[0]),
          endAt: joinTimeSpan(this.timeSpan[1], 1)
        }
        this.$store.dispatch('setting/showLoading', this.routeName)
        if (this.instituionType) {
          req.retoucherOrgId = this.instituionType
        }
        this.tableData = await Institution.getRetouchOrgIncome(req)
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.table-box {
  margin-top: 0;
}
</style>
