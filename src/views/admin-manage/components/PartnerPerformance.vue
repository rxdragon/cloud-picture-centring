<template>
  <div class="partner-performance">
    <div class="search-box">
      <div class="search-item">
        <span>审核通过时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <div class="staff-search search-item">
        <span>云端伙伴</span>
        <staff-select v-model="staffId" :props="{ multiple: false }" />
      </div>
      <div class="button-box">
        <el-button type="primary" @click="getRetoucherQuota(1)">查询</el-button>
      </div>
    </div>
    <div class="table-panel">
      <list-table :listdata="listDataOne" />
      <list-table :listdata="listDataTwo" />
    </div>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import ListTable from '@/components/ListTable'
import StaffSelect from '@SelectBox/StaffSelect'
import { joinTimeSpan } from '@/utils/timespan.js'
import * as WorkManage from '@/api/workManage'

export default {
  name: 'PartnerPerformance',
  components: { DatePicker, ListTable, StaffSelect },
  data () {
    return {
      timeSpan: null,
      staffId: '',
      listDataOne: [{
        key: 'retouchSinglePhotoNum',
        label: '修图数量-单人(单位：张)',
        value: '-'
      }, {
        key: 'retouchMultiPhotoNum',
        label: '修图数量-多人(单位：张)',
        value: '-'
      }, {
        key: 'reviewPlant',
        label: '种草率（单位：%）',
        value: '-'
      }, {
        key: 'reviewPull',
        label: '拔草率（单位：%）',
        value: '-'
      }, {
        key: 'retouchRework',
        label: '重修率（单位：%）',
        value: '-'
      }],
      listDataTwo: [{
        key: 'storeEvaluateScoreAvg',
        label: '门店评分（平均值）',
        value: '-'
      }, {
        key: 'exp',
        label: '海草值',
        value: '-'
      }, {
        key: 'income',
        label: '收益',
        value: '-'
      }, {
        key: 'overTimeStreamNum',
        label: '超时单量',
        value: '-'
      }]
    }
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
      if (!this.staffId) {
        this.$newMessage.warning('请选择云端伙伴')
        return false
      }
      const req = {
        startAt: joinTimeSpan(this.timeSpan[0]),
        endAt: joinTimeSpan(this.timeSpan[1], 1),
        staffId: this.staffId
      }
      return req
    },
    /**
     * @description 获取伙伴绩效
     */
    async getRetoucherQuota () {
      const req = this.getParams()
      if (!req) return false
      this.$store.dispatch('setting/showLoading')
      const data = await WorkManage.getRetoucherQuota(req)
      this.listDataOne.forEach(item => {
        item.value = data[item.key]
      })
      this.listDataTwo.forEach(item => {
        item.value = data[item.key]
        if (item.key === 'income') { item.value = '¥' + item.value }
        if (item.key === 'storeEvaluateScoreAvg') { item.value = item.value.count + '星' }
      })
      this.$store.dispatch('setting/hiddenLoading')
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
    margin-top: 24px;
  }
}
</style>
