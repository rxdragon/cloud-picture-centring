<template>
  <div class="time-statistics">
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
        <span>修图类型</span>
        <retouch-type-select v-model="retouchType" />
      </div>
      <div class="button-box">
        <el-button type="primary" @click="getStreamTimesQuota">查询</el-button>
      </div>
    </div>
    <div class="table-panel">
      <div class="unit">单位：分数</div>
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
          <span>外包修图时长</span>
          <span class="describe">(云端修图师接单至审核通过的平均时长)</span>
        </div>
        <div class="title">
          <span>接单时间</span>
          <span class="describe">(外包修图师接单至审核通过的平均时长)</span>
        </div>
      </div>
      <div class="list-panel-content">
        <div class="content row-one">
          <span>{{ tableData.take_time | formatDuring }}</span>
          <span>{{ tableData.retouch_all_time | formatDuring }}</span>
          <span>{{ tableData.cloud_retouch_all_time | formatDuring }}</span>
          <span>{{ tableData.outer_retouch_all_time | formatDuring }}</span>
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
      </div>
      <div class="list-panel-content">
        <div class="content row-two">
          <span>{{ tableData.review_time | formatDuring }}</span>
          <span>{{ tableData.return_to_rebuild_time | formatDuring }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import RetoucherGroupSelect from '@SelectBox/RetoucherGroupSelect'
import RetouchTypeSelect from '@SelectBox/RetouchTypeSelect'
import { joinTimeSpan } from '@/utils/timespan.js'
import * as WorkManage from '@/api/workManage'
import { formatDuring } from '@/utils'

export default {
  name: 'TimeStatistics',
  components: { DatePicker, RetoucherGroupSelect, RetouchTypeSelect },
  filters: {
    formatDuring
  },
  data () {
    return {
      timeSpan: '',
      retouchType: 0,
      retoucherGroupValue: 0,
      tableData: {}
    }
  },
  created () {
    this.getStreamTimesQuota()
  },
  methods: {
    getParams () {
      const req = {}
      if (this.timeSpan) {
        req.startAt = joinTimeSpan(this.timeSpan[0])
        req.endAt = joinTimeSpan(this.timeSpan[1], 1)
      }
      if (this.retoucherGroupValue) {
        req.retouch_group = this.retoucherGroupValue
      }
      if (this.retouchType) {
        req.retouch_class = this.retouchType
      }
      return req
    },
    getStreamTimesQuota () {
      const req = this.getParams()
      WorkManage.getStreamTimesQuota(req).then(data => {
        this.tableData = data
      })
    }
  }
}
</script>

<style lang="less">
@import "~@/styles/variables.less";

.time-statistics {
  .table-panel {
    margin-top: 24px;
    position: relative;
    box-shadow: @boxShadow;

    .unit {
      position: absolute;
      top: -30px;
      right: 0;
    }

    .row-one {
      grid-template-columns: 1fr 1fr 1fr 1fr;
    }

    .row-two {
      grid-template-columns: 1fr 1fr;
    }

    .list-panel-title {
      display: grid;

      .title {
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: #daedf7;
        padding: 5px 0;
        font-size: 15px;

        & > span {
          color: #387ebb;
          font-weight: bold;
        }

        .describe {
          color: #aaa;
          font-weight: 400;
          font-size: 14px;
        }
      }
    }

    .list-panel-content {
      .content {
        display: grid;
        text-align: center;
        grid-column-gap: 2px;
        background-color: #eee;

        & > span {
          padding: 10px;
          background-color: #fff;
        }
      }
    }
  }
}
</style>
