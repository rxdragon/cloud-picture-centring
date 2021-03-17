<template>
  <div v-loading="loading" class="time-statistics">
    <el-row class="search-box" :gutter="20">
      <!-- 时间 -->
      <el-col :span="8" :xl="4">
        <div class="search-item">
          <span>时间</span>
          <date-picker v-model="timeSpan" />
        </div>
      </el-col>
      <!-- 修图组 -->
      <el-col :span="6" :xl="4">
        <div class="staff-search search-item">
          <span>修图组</span>
          <retoucher-group-select v-model="retoucherGroupValue" />
        </div>
      </el-col>
      <!-- 修图标准 -->
      <el-col :span="6" :xl="4">
        <div class="outsourc-staff-search search-item">
          <span>修图标准</span>
          <retouch-kind-select v-model="retouchType" placeholder="请选择修图标准"/>
        </div>
      </el-col>
      <!-- 查询 -->
      <el-col :span="4" :xl="4">
        <div class="button-box search-item">
          <el-button type="primary" @click="getStreamTimesInfo">查询</el-button>
        </div>
      </el-col>
    </el-row>

    <div class="table-panel">
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
          <span>{{ tableData.receiptTime | toTimeFormatText }}</span>
          <span>{{ tableData.retouchAllTimeAvg | toTimeFormatText }}</span>
          <span>{{ tableData.retouchTimeAvg | toTimeFormatText }}</span>
          <span>{{ tableData.outerRetouchTimeAvg | toTimeFormatText }}</span>
        </div>
      </div>
      <div class="list-panel-title row-two">
        <div class="title">
          <span>单张蓝标修图平均时长</span>
          <span class="describe">(蓝标修图标准的单张修图平均时长)</span>
        </div>
        <div class="title">
          <span>单张大师修图平均时长</span>
          <span class="describe">(大师修图标准的单张修图平均时长)</span>
        </div>
        <div class="title">
          <span>单张kids修图总平均时长</span>
          <span class="describe">(kids修图标准的单张修图平均时长)</span>
        </div>
        <div class="title">
          <span>单张缦图修图总平均时长</span>
          <span class="describe">(缦图修图标准的单张修图平均时长)</span>
        </div>
      </div>
      <div class="list-panel-content">
        <div class="content row-two">
          <span>{{ retouchTimeAvg[RETOUCH_STANDARD.BLUE].avg | toTimeFormatText }}</span>
          <span>{{ retouchTimeAvg[RETOUCH_STANDARD.MASTER].avg | toTimeFormatText }}</span>
          <span>{{ retouchTimeAvg[RETOUCH_STANDARD.KIDS].avg | toTimeFormatText }}</span>
          <span>{{ retouchTimeAvg[RETOUCH_STANDARD.MAINTO].avg | toTimeFormatText }}</span>
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

import { RETOUCH_STANDARD } from '@/utils/enumerate.js'
import { joinTimeSpan, delayLoading } from '@/utils/timespan.js'

export default {
  name: 'TimeStatistics',
  components: { DatePicker, RetoucherGroupSelect, RetouchKindSelect },
  data () {
    return {
      RETOUCH_STANDARD,
      loading: false,
      timeSpan: null, // 时间戳
      retouchType: '', // 修图标准
      retoucherGroupValue: '', // 修图组
      tableData: {},
      retouchTimeAvg: {
        [RETOUCH_STANDARD.BLUE]: {
          sum: 0,
          count: 0,
          avg: 0
        },
        [RETOUCH_STANDARD.MASTER]: {
          sum: 0,
          count: 0,
          avg: 0
        },
        [RETOUCH_STANDARD.KIDS]: {
          sum: 0,
          count: 0,
          avg: 0
        },
        [RETOUCH_STANDARD.MAINTO]: {
          sum: 0,
          count: 0,
          avg: 0
        }
      }
    }
  },
  created () {
    const nowAt = moment().format('YYYY-MM-DD')
    this.timeSpan = [nowAt, nowAt]
    this.getStreamTimesInfo()
  },
  methods: {
    /**
     * @description 搜索相关信息
     */
    async getStreamTimesInfo () {
      try {
        this.loading = true
        await Promise.all([
          this.getStreamTimesQuota(),
          this.getOrgStandardTimesQuota()
        ])
      } finally {
        await delayLoading()
        this.loading = false
      }
      
    },
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
      const req = this.getParams()
      if (!req) return
      this.loading = true
      this.tableData = await WorkManage.getStreamTimesQuota(req)
    },
    /**
     * @description 获取修图标准时间
     */
    async getOrgStandardTimesQuota () {
      const req = this.getParams()
      delete req.retouchType
      this.retouchTimeAvg = await WorkManage.getOrgStandardTimesQuota(req)
    }
  }
}
</script>

<style lang="less">

.time-statistics {
  .table-panel {
    position: relative;
    border-bottom: 1px solid #f2f6fc;

    .row-one {
      grid-template-columns: repeat(4, 1fr);
    }

    .row-two {
      grid-template-columns: repeat(4, 1fr);
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
          line-height: 22px;
          color: #303133;
        }

        .describe {
          font-weight: 400;
          line-height: 14px;
          color: #909399;
        }
      }
    }

    .list-panel-content {
      .content {
        display: grid;
        text-align: center;

        & > span {
          padding: 21px 20px;
          font-size: 14px;
          font-weight: 400;
          line-height: 14px;
          color: #606266;
        }
      }
    }
  }
}
</style>
