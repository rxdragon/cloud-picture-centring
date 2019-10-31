<template>
  <div class="audit-survey">
    <div class="header">
      <h3>个人审核概况</h3>
    </div>
    <div class="search-box">
      <div class="search-item">
        <span>时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <div class="button-box">
        <el-button type="primary" @click="getReviewQuota">查 询</el-button>
      </div>
    </div>
    <div class="table-content module-panel">
      <div class="list-tabel">
        <div v-for="(listItem, listIndex) in tableDataCount" :key="'tableDataCount' + listIndex" class="list-box">
          <div class="title">{{ listItem.label }}</div>
        </div>
        <div v-for="(listItem, listIndex) in tableDataCount" :key="'Count' + listIndex" class="list-box">
          <div class="content">
            <template v-if="!listItem.link">{{ listItem.value }}</template>
            <router-link v-else :to="listItem.link">{{ listItem.value }}</router-link>
          </div>
        </div>
      </div>
      <div class="list-tabel list-tabel-rate">
        <div v-for="(listItem, listIndex) in tableDataRate" :key="'tableDataRate' + listIndex" class="list-box">
          <div class="title">{{ listItem.label }}</div>
        </div>
        <div v-for="(listItem, listIndex) in tableDataRate" :key="'tableData' + listIndex" class="list-box">
          <div class="content">
            <template v-if="!listItem.link">{{ listItem.value }}</template>
            <router-link v-else :to="listItem.link">{{ listItem.value }}</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'

import { joinTimeSpan } from '@/utils/timespan.js'
import { parseTime } from '@/utils/index.js'
import * as ReviewCheck from '@/api/reviewCheck.js'

export default {
  name: 'AuditSurvey',
  components: { DatePicker },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 时间戳
      tableDataCount: [{
        label: '审核单量',
        value: '-'
      }, {
        label: '审核张数',
        value: '-'
      }, {
        label: '审核平均用时',
        value: '-'
      }, {
        label: '审核种草(张) / 种草率(%)',
        value: '-'
      }, {
        label: '审核拔草(张) / 拔草率(%)',
        value: '-'
      }, {
        label: '抽查种草(张) / 种草率(%)',
        value: '-'
      }, {
        label: '抽查拔草(张) / 拔草率(%)',
        value: '-'
      }],
      tableDataRate: [{
        label: '纠偏意见不同单位：(张 / %)',
        value: '- / -'
      }, {
        label: '纠偏意见不同-种草单位：(张 / %)',
        value: '- / -'
      }, {
        label: '纠偏意见不同-拔草单位：(张 / %)',
        value: '- / -'
      }, {
        label: '纠偏意见不同-不种不拔单位：(张 / %)',
        value: '- / -'
      }, {
        label: '纠偏意见相同单位：(张 / %)',
        value: '- / -'
      }]
    }
  },
  created () {
    const nowTime = parseTime(new Date(), '{y}-{m}-{d}')
    this.timeSpan = [nowTime, nowTime]
    this.getReviewQuota()
  },
  methods: {
    /**
     * @description 获取审核指标
     */
    async getReviewQuota () {
      if (!this.timeSpan) {
        this.$newMessage.warning('请输入时间')
        return false
      }
      const reqData = {
        range: 'self',
        startAt: joinTimeSpan(this.timeSpan[0]),
        endAt: joinTimeSpan(this.timeSpan[1], 1)
      }
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await ReviewCheck.getGroupReviewQuota(reqData)
        this.tableDataCount = data.tableDataCount
        this.tableDataRate = data.tableDataRate
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";
.table-content {
  margin-top: 24px;

  .list-tabel {
    display: grid;
    text-align: center;
    grid-template-columns: repeat(7, 1fr);
    border-bottom: 1px solid #FAFAFA;

    .title {
      background-color: #FAFAFA;
      padding: 17px 20px;
      font-size:14px;
      font-weight:500;
      color:#303133;
      display: flex;
      align-items: center;
      height: 100%;
      line-height:22px;
      text-align: left;
    }

    .content {
      padding: 20px 21px;
      text-align: left;

      a {
        color: @blue;
      }
    }
  }

  .list-tabel-rate {
    grid-template-columns: repeat(5, 1fr);
    margin-top: 24px;
  }
}
</style>
