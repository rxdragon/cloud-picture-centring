<template>
  <div class="audit-performance">
    <div class="search-box">
      <div class="search-item">
        <span>时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <div class="staff-search search-item">
        <span>审核人员</span>
        <reviewer-select v-model="reviewerValue" />
      </div>
      <div class="outsourc-staff-search search-item">
        <span>修图组</span>
        <retoucher-group-select v-model="retoucherGroupValue" />
      </div>
      <div class="button-box">
        <el-button type="primary" @click="getReviewQuota">查询</el-button>
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
import ReviewerSelect from '@SelectBox/ReviewerSelect'
import RetoucherGroupSelect from '@SelectBox/RetoucherGroupSelect'
import { joinTimeSpan } from '@/utils/timespan.js'
import * as WorkManage from '@/api/workManage'

export default {
  name: 'AuditPerformance',
  components: { DatePicker, ListTable, ReviewerSelect, RetoucherGroupSelect },
  data () {
    return {
      timeSpan: null,
      reviewerValue: 0,
      retoucherGroupValue: 0,
      listDataOne: [{
        key: 'review_stream_num',
        label: '审核单量',
        value: '-'
      }, {
        key: 'review_photo_num',
        label: '审核张数',
        value: '-'
      }, {
        key: 'review_time_avg',
        label: '审核平均用时',
        value: '-'
      }, {
        key: 'review_photo_glass_plant',
        label: '审核种草 / 种草率',
        value: '-'
      }, {
        key: 'review_photo_glass_pull',
        label: '审核拔草 / 拔草率',
        value: '-'
      }, {
        key: 'spot_check_photo_glass_plant',
        label: '抽查种草 / 种草率',
        value: '-'
      }, {
        key: 'spot_check_photo_glass_pull',
        label: '抽查拔草 / 拔草率',
        value: '-'
      }],
      listDataTwo: [{
        key: 'rectify_photo_different',
        label: '纠偏意见不同',
        value: '-'
      }, {
        key: 'rectify_photo_different_grass_plant',
        label: '纠偏意见不同-种草',
        value: '-'
      }, {
        key: 'rectify_photo_different_grass_pull',
        label: '纠偏意见不同-拔草',
        value: '-'
      }, {
        key: 'rectify_photo_different_grass_no_grass',
        label: '纠偏意见不同-不种不拔',
        value: '-'
      }, {
        key: 'rectify_photo_same',
        label: '纠偏意见相同',
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
        this.$newMessage.warning('请输入时间')
        return false
      }
      const req = {
        startAt: joinTimeSpan(this.timeSpan[0]),
        endAt: joinTimeSpan(this.timeSpan[1], 1)
      }
      if (this.reviewerValue) { req.reviewId = this.reviewerValue }
      if (this.retoucherGroupValue) { req.groupId = this.retoucherGroupValue }
      return req
    },
    /**
     * @description 获取审核绩效
     */
    async getReviewQuota () {
      try {
        const req = this.getParams()
        if (!req) return
        this.$store.dispatch('setting/showLoading', this.$route.name)
        const data = await WorkManage.getReviewQuota(req)
        if (!data) {
          this.$newMessage.warning('暂无数据')
          return false
        }
        this.listDataOne.forEach(item => { item.value = data[item.key] })
        this.listDataTwo.forEach(item => { item.value = data[item.key] })
        this.$store.dispatch('setting/hiddenLoading', this.$route.name)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.$route.name)
      }
    }
  }
}
</script>

<style lang="less">
.audit-performance {
  .table-panel {
    margin-top: 20px;
  }
}
</style>
