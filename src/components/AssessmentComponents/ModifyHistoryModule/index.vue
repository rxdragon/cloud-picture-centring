<template>
  <div class="modify-history-module page-class">
    <!-- 抽查时间 -->
    <el-row class="search-box" :gutter="20">
      <!-- 操作时间 -->
      <el-col :span="8" :xl="6">
        <div class="search-item">
          <span>操作时间</span>
          <date-picker v-model="timeSpan" />
        </div>
      </el-col>
      <!-- 流水号 -->
      <el-col :span="6" :xl="6">
        <div class="stream-search search-item">
          <span>流水号</span>
          <el-input
            clearable
            v-model.trim="streamNum"
            @keyup.native.enter="getSearchHistory(1)"
            placeholder="请输入流水号"
          />
        </div>
      </el-col>
      <!-- 修图师 -->
      <el-col :span="8" :xl="6">
        <div class="staff-search search-item">
          <span>修图师</span>
          <staff-select v-model="staffIds" :props="{ multiple: true }" />
        </div>
      </el-col>
      <!-- 查询按钮 -->
      <el-col :span="2" :xl="6">
        <div class="button-box search-item">
          <el-button
            :disabled="!Boolean(timeSpan)"
            type="primary"
            class="search-button"
            @click="getSearchHistory(1)"
          >
            查询
          </el-button>
        </div>
      </el-col>
    </el-row>
    <div class="module-panel">
      <div>
        <template>
          <el-table :data="historyList" style="width: 100%;">
            <el-table-column prop="created_at" label="操作时间" width="180" />
            <el-table-column prop="last_score" label="前次评分" />
            <el-table-column prop="after_score" label="更改后评分" />
            <el-table-column prop="takeStaff" label="操作人" />
            <el-table-column prop="stream_num" label="流水号" width="180" />
            <el-table-column prop="retoucherName" label="修图师" />
            <el-table-column prop="retoucherLeader" label="修图主管" />
          </el-table>
        </template>
      </div>
      <div class="page-box">
        <el-pagination
          :hide-on-single-page="true"
          :current-page.sync="pager.page"
          :page-size="pager.pageSize"
          layout="total, prev, pager, next, jumper"
          :total="pager.total"
          @current-change="handlePage"
        />
      </div>
    </div>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import StaffSelect from '@SelectBox/StaffSelect'
import moment from 'moment'
import { joinTimeSpan } from '@/utils/timespan.js'

import * as AssessmentCenterApi from '@/api/assessmentCenter'

export default {
  name: 'ModifyHistoryModule',
  components: { DatePicker, StaffSelect },
  inject: ['cloudType'],
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 时间
      streamNum: '', // 流水号
      staffIds: [], // 修图师 id
      historyList: [], // 修改记录数据列表
      pager: {
        page: 1,
        pageSize: 10,
        total: 10
      }
    }
  },
  created () {
    const startAt = moment().subtract('day', 28).locale('zh-cn').format('YYYY-MM-DD')
    const endAt = moment().locale('zh-cn').format('YYYY-MM-DD')
    this.timeSpan = [startAt, endAt]
    this.getSearchHistory(1)
  },
  methods: {
    /**
     * @description 获取搜索数据
     */
    getSearchParams () {
      if (!this.timeSpan) {
        this.$newMessage.warning('请填写正确的时间')
        return false
      }
      const req = {
        startAt: joinTimeSpan(this.timeSpan[0]),
        endAt: joinTimeSpan(this.timeSpan[1], 1),
        page: this.pager.page,
        pageSize: this.pager.pageSize
      }
      this.streamNum && (req.streamNum = this.streamNum)
      this.staffIds.length && (req.retoucherId = this.staffIds.map(item => Number(item)))
      return req
    },
    /**
     * @description 获取评分修改列表
     * @param {*} page
     */
    async getSearchHistory (page) {
      try {
        this.pager.page = page || this.pager.page
        const req = this.getSearchParams()
        if (!req) return false
        this.$store.dispatch('setting/showLoading', this.routeName)
        req.axiosType = this.cloudType
        const data = await AssessmentCenterApi.getUpdateHistoryLog(req)
        this.historyList = data.list
        this.pager.total = data.total
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 监听页面变化
     */
    handlePage () {
      this.getSearchHistory()
    }
  }
}
</script>

<style lang="less">
.modify-history-module {
  .search-box {
    flex-wrap: wrap;

    .search-item {
      margin-right: 0;
      margin-bottom: 20px;

      .stream-num {
        width: 100%;
      }

      & > span {
        display: inline-block;
        flex-shrink: 0;
        width: 56px;
      }

      & /deep/ .el-range-editor.el-input__inner {
        width: 100% !important;
      }

      & /deep/ .date-picker,
      & /deep/ .issue-label-select,
      & /deep/ .evaluate-select,
      & /deep/ .cloud-spot-grass-select,
      & /deep/ .quality-select,
      & /deep/ .el-select,
      & /deep/ .return-select,
      & /deep/ .cloud-spot,
      & /deep/ .el-cascader {
        width: 100%;
      }
    }

    .stream-search,
    .staff-search {
      & > span {
        width: 56px;
      }
    }
  }

  .page-box {
    margin-top: 24px;
    text-align: right;
  }

  .el-pagination .btn-next,
  .el-pagination .btn-prev,
  .el-pager li {
    background-color: transparent;
  }
}
</style>
