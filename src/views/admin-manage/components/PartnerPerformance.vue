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
        <div class="panel-title">
          修图单量问题统计
        </div>
        <retouch-order-chart />
      </div>
      <div class="performance-statistics">
        <div class="panel-title">
          种拔草统计
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import StaffSelect from '@SelectBox/StaffSelect'
import RetouchOrderChart from './chart-components/RetouchOrderChart'
// TODO
// import { joinTimeSpan } from '@/utils/timespan.js'
import * as WorkManage from '@/api/workManage'

export default {
  name: 'PartnerPerformance',
  components: { DatePicker, StaffSelect, RetouchOrderChart },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 时间戳
      staffIds: [] // 伙伴id
    }
  },
  created () {
    // 调试
    this.getRetoucherQuota()
  },
  methods: {
    /**
     * @description 获取参数
     */
    getParams () {
      // if (!this.timeSpan) {
      //   this.$newMessage.warning('请填写时间')
      //   return false
      // }
      // const req = {
      //   startAt: joinTimeSpan(this.timeSpan[0]),
      //   endAt: joinTimeSpan(this.timeSpan[1], 1)
      // }
      // 调试
      const req = {
        startAt: '2019-12-01 08:00:00',
        endAt: '2019-12-08 08:00:00'
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
        console.log(data)
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
    padding: 32px 0;
    display: flex;
    justify-content: space-between;

    .retouch-order-statistics {
      width: calc(~'50% - 11px');
      border-right: 1px solid #ebeef5;
    }

    .performance-statistics {
      width: calc(~'50% - 11px');
    }
  }
}
</style>
