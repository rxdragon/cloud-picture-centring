<template>
  <div v-loading="loading" class="time-statistics">
    <div class="search-box">
      <div class="search-item">
        <span>时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <div class="staff-search search-item">
        <span>修图组</span>
        <retoucher-group-select v-model="retoucherGroupValue" />
      </div>
      <div class="outsourc-staff-search search-item">
        <span>修图标准</span>
        <retouch-kind-select v-model="retouchType" />
      </div>
      <div class="button-box">
        <el-button type="primary" @click="getStreamTimesQuota">查询</el-button>
      </div>
    </div>
    <div class="table-panel">
      <div class="unit">单位：分钟</div>
      <!-- 第一行 -->
      <div class="list-panel-title row-one">
        <div class="title">
          <span>接单时间</span>
          <span class="describe">(摄影师上传到修图师接单平均用时)</span>
        </div>
        <div class="title">
          <span>修图总平均时长</span>
          <span class="describe">(修图师接单至审核通过的平均时长)</span>
        </div>
        <div class="title">
          <span>云端修图时长</span>
          <span class="describe">(云端修图师接单至审核通过的平均时长)</span>
        </div>
        <div class="title">
          <span>外包修图时长</span>
          <span class="describe">(外包修图师接单至审核通过的平均时长)</span>
        </div>
      </div>
      <div class="list-panel-content">
        <div class="content row-one">
          <span>{{ tableData.receiptTime | formatDuring }}</span>
          <span>{{ tableData.retouchAllTimeAvg | formatDuring }}</span>
          <span>{{ tableData.retouchTimeAvg | formatDuring }}</span>
          <span>{{ tableData.outerRetouchTimeAvg | formatDuring }}</span>
        </div>
      </div>
      <div class="list-panel-title row-two">
        <div class="title">
          <span>审核用时</span>
          <span class="describe">(审核团审核的平均时长)</span>
        </div>
        <div class="title">
          <span>审核退回重修时长</span>
          <span class="describe">(审核团退回修图师至修图师再次提交的平均时长)</span>
        </div>
        <div class="title">
          <span>门店退回时长</span>
          <span class="describe">(门店看片师退回质量问题单到修片师重新上传平均用时)</span>
        </div>
      </div>
      <div class="list-panel-content">
        <div class="content row-two">
          <span>{{ tableData.reviewTimeAvg | formatDuring }}</span>
          <span>{{ tableData.returnToRebuildTime | formatDuring }}</span>
          <span>{{ tableData.storeReturnTime | formatDuring }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import RetoucherGroupSelect from '@SelectBox/RetoucherGroupSelect'
import RetouchKindSelect from '@SelectBox/RetouchKindSelect'
import moment from 'moment'
import * as WorkManage from '@/api/workManage'
import { joinTimeSpan } from '@/utils/timespan.js'
import { formatDuring } from '@/utils'

export default {
  name: 'TimeStatistics',
  components: { DatePicker, RetoucherGroupSelect, RetouchKindSelect },
  filters: { formatDuring },
  data () {
    return {
      loading: false,
      timeSpan: null, // 时间戳
      retouchType: '', // 修图标准
      retoucherGroupValue: '', // 修图组
      tableData: {}
    }
  },
  created () {
    const nowAt = moment().locale('zh-cn').format('YYYY-MM-DD')
    this.timeSpan = [nowAt, nowAt]
    this.getStreamTimesQuota()
  },
  methods: {
    /**
     * @description 获取请求参数
     */
    getParams () {
      const req = {}
      if (!this.timeSpan) {
        this.$newMessage.warning('请填写时间')
        return false
      }
      req.startAt = joinTimeSpan(this.timeSpan[0])
      req.endAt = joinTimeSpan(this.timeSpan[1], 1)
      if (this.retoucherGroupValue) { req.retouchGroup = this.retoucherGroupValue }
      if (this.retouchType) { req.retouchClass = this.retouchType }
      return req
    },
    /**
     * @description 查询绩效
     */
    async getStreamTimesQuota () {
      try {
        const req = this.getParams()
        if (!req) return
        this.loading = true
        this.tableData = await WorkManage.getStreamTimesQuota(req)
      } catch (error) {
        console.error(error)
      } finally {
        setTimeout(() => { this.loading = false }, 500)
      }
    }
  }
}
</script>

<style lang="less">
@import "~@/styles/variables.less";

.time-statistics {
  .table-panel {
    margin-top: 32px;
    position: relative;
    border-bottom: 1px solid #f2f6fc;

    .unit {
      position: absolute;
      top: -30px;
      right: 0;
      font-size: 14px;
      color: #606266;
    }

    .row-one {
      grid-template-columns: 1fr 1fr 1fr 1fr;
    }

    .row-two {
      grid-template-columns: repeat(3, 1fr);
    }

    .list-panel-title {
      display: grid;
      background-color: #fafafa;

      .title {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 17px 0;
        font-size: 15px;

        & > span {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
          line-height: 22px;
        }

        .describe {
          font-weight: 400;
          color: #909399;
          line-height: 14px;
        }
      }
    }

    .list-panel-content {
      .content {
        display: grid;
        text-align: center;

        & > span {
          font-size: 14px;
          font-weight: 400;
          color: #606266;
          line-height: 14px;
          padding: 21px 20px;
        }
      }
    }
  }
}
</style>
