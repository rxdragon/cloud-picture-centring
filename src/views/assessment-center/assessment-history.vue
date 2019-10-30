<template>
  <div class="assessment-history">
    <div class="header">
      <h3>评价历史记录</h3>
    </div>
    <div class="search-box">
      <div class="search-item">
        <span>抽查时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <!-- 纠偏类型 -->
      <div class="correct-type search-item">
        <span>纠偏类型</span>
        <el-select v-model="correctType" placeholder="纠偏类型">
          <el-option label="全部" :value="0" />
          <el-option label="意见相同" value="same" />
          <el-option label="意见不同" value="different" />
        </el-select>
      </div>
      <!-- 抽查类型 -->
      <div class="spot-type search-item">
        <span>抽查类型</span>
        <el-select v-model="spotType" placeholder="抽查类型">
          <el-option label="全部" :value="0" />
          <el-option label="种草" value="plant" />
          <el-option label="拔草" value="pull" />
          <el-option label="不种不拔" value="none" />
        </el-select>
      </div>
      <!-- 查询按钮 -->
      <div class="button-box">
        <el-button type="primary" class="search-button" @click="getSearchHistory(1)">查询</el-button>
        <el-dropdown>
          <el-button disabled type="success">
            导出<i class="el-icon-arrow-down el-icon--right" />
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>成片评价-审核人明细</el-dropdown-item>
            <el-dropdown-item>成片评价-小组明细</el-dropdown-item>
            <el-dropdown-item>成片评价-修图师明细</el-dropdown-item>
            <el-dropdown-item>纠偏-审核人明细</el-dropdown-item>
            <el-dropdown-item>纠偏-小组明细</el-dropdown-item>
            <el-dropdown-item>评价质量报告明细</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div class="search-box">
      <!-- 修图师 -->
      <div class="staff-search search-item">
        <span>修图师</span>
        <staff-select v-model="staffId" :props="{ multiple: false }" />
      </div>
      <!-- 审核人员 -->
      <div class="checker-search search-item">
        <span>审核人员</span>
        <reviewer-select v-model="reviewerId" />
      </div>
    </div>
    <div v-for="photoItem in photoData" :key="photoItem.businessId" class="photo-data module-panel">
      <GradeBox :photo-info="photoItem" />
    </div>
    <div class="page-box">
      <el-pagination
        :hide-on-single-page="true"
        :current-page.sync="pager.page"
        :page-size="pager.pageSize"
        layout="prev, pager, next"
        :total="pager.total"
        @current-change="handlePage"
      />
    </div>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import GradeBox from './components/GradeBox'
import StaffSelect from '@SelectBox/StaffSelect'
import ReviewerSelect from '@SelectBox/ReviewerSelect'

import * as AssessmentCenter from '@/api/assessmentCenter'
import moment from 'moment'
import { joinTimeSpan } from '@/utils/timespan.js'
export default {
  name: 'AssessmentHistory',
  components: { DatePicker, GradeBox, StaffSelect, ReviewerSelect },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 时间
      correctType: 0, // 抽片类型
      spotType: 0, // 抽片类型 0 全部 1 种草 2 拔草 3 不中不把
      staffId: '', // 修图师 id
      reviewerId: 0, // 审核人id
      photoData: [], // 照片数据
      pager: {
        page: 1,
        pageSize: 10,
        total: 10
      },
      uuid: ''
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
      if (this.correctType) { req.correctionType = this.correctType }
      if (this.spotType) { req.grassType = this.spotType }
      if (this.staffId) { req.retoucherId = this.staffId }
      if (this.reviewerId) { req.reviewerId = this.reviewerId }
      return req
    },
    /**
     * @description 获取历史抽片数据
     * @param {*} page
     */
    async getSearchHistory (page) {
      try {
        this.pager.page = page || this.pager.page
        const req = this.getSearchParams()
        if (!req) return false
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await AssessmentCenter.getSearchHistory(req)
        this.photoData = data.list
        this.pager.total = data.total
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        throw new Error(error)
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
.assessment-history {
  .search-box {
    flex-wrap: wrap;

    .search-item {
      margin-bottom: 24px;
    }

    .spot-type,
    .correct-type {
      .el-select {
        width: 120px;
      }
    }

    .button-box {
      margin-bottom: 24px;

      .search-button {
        margin-right: 12px;
      }
    }

    .staff-search {
      &>span {
        width: 56px;
      }

      .el-cascader {
        width: 400px;
      }
    }
  }

  .photo-data {
    margin-bottom: 24px;
  }

  .date-picker .el-range-editor.el-input__inner {
    width: 400px;
  }

  .page-box {
    margin-top: 24px;
    text-align: center;
  }

  .el-pagination .btn-next,
  .el-pagination .btn-prev,
  .el-pager li {
    background-color: transparent;
  }
}
</style>
