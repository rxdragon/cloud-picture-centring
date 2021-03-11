<template>
  <div class="assessment-history-module">
    <!-- 搜索框 -->
    <el-row class="search-box" :gutter="20">
      <!-- 抽查时间 -->
      <el-col :span="8" :xl="6">
        <div class="search-item">
          <span>抽查时间</span>
          <date-picker v-model="timeSpan" />
        </div>
      </el-col>
      <!-- 修图师 -->
      <el-col :span="8" :xl="4">
        <div class="staff-search search-item">
          <span>修图师</span>
          <staff-select v-model="staffIds" :props="{ multiple: true }" />
        </div>
      </el-col>
      <!-- 产品 -->
      <el-col :span="8" :xl="6">
        <div class="product-search search-item">
          <span>产品</span>
          <product-select v-model="productValue" />
        </div>
      </el-col>
      <!-- 问题标签 -->
      <el-col :span="8" :xl="4">
        <div class="product-search search-item">
          <span>问题标签</span>
          <issue-label-select v-model="issueValue" />
        </div>
      </el-col>
      <!-- 流水号 -->
      <el-col :span="8" :xl="4">
        <div class="product-search search-item">
          <span>流水号</span>
          <div class="stream-num">
            <el-input
              placeholder="请输入流水号"
              v-model.trim="streamNum"
              clearable
              @keyup.native.enter="getSearchHistory(1)"
            />
          </div>
        </div>
      </el-col>
      <!-- 评分人 -->
      <el-col :span="6" :xl="4">
        <div class="product-search search-item">
          <span>评分人</span>
          <scorer-select collapse-tags v-model="currentScorer"></scorer-select>
        </div>
      </el-col>
      <!-- 查询 -->
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
    
    <!-- 模块 -->
    <div v-for="photoItem in photoList" :key="photoItem.businessId" class="photo-data module-panel">
      <GradeBox :photo-info="photoItem" @updateList="getSearchHistory" />
    </div>
    <div v-if="!photoList.length" class="module-panel no-data">暂无数据</div>
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
import StaffSelect from '@SelectBox/StaffSelect'
import ProductSelect from '@SelectBox/ProductSelect'
import IssueLabelSelect from '@SelectBox/IssueLabelSelect'
import scorerSelect from '@SelectBox/scorerSelect'

import GradeBox from '../components/GradeBox'

import moment from 'moment'

import { joinTimeSpan } from '@/utils/timespan.js'
import * as AssessmentCenter from '@/api/assessmentCenter'

export default {
  name: 'AssessmentHistoryModule',
  components: { DatePicker, GradeBox, StaffSelect, ProductSelect, IssueLabelSelect, scorerSelect },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 时间
      searchTimeSpan: null, // 查询时间
      staffIds: [], // 修图师 id
      photoList: [], // 照片数据
      productValue: [], // 选中产品
      issueValue: [], // 问题标签数据
      pager: {
        page: 1,
        pageSize: 10,
        total: 10
      },
      uuid: '',
      cacheTimeSpan: [],
      cacheSendStaff: '',
      currentScorer: [],
      streamNum: ''
    }
  },
  created () {
    const startAt = moment().subtract('day', 28).locale('zh-cn').format('YYYY-MM-DD')
    const endAt = moment().locale('zh-cn').format('YYYY-MM-DD')
    this.timeSpan = [startAt, endAt]
    this.initial()
  },
  activated () {
    this.initial()
  },
  methods: {
    /**
     * @description 初始化
     */
    initial () {
      const { searchTimeSpan, sendStaff } = this.$route.query
      const routerTimeSpan = (searchTimeSpan && searchTimeSpan.split(',')) || []
      const sameTimeSpan = (routerTimeSpan[0] === this.cacheTimeSpan[0] && routerTimeSpan[1] === this.cacheTimeSpan[1])
      const sameSendStaff = sendStaff === this.cacheSendStaff
      if (sameTimeSpan && sameSendStaff) return false
      if (searchTimeSpan) { this.timeSpan = searchTimeSpan.split(',') }
      if (sendStaff) { this.staffIds = sendStaff.split(',') }
      this.getSearchHistory(1)
    },
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
      if (this.staffIds.length) {
        req.retoucherIds = this.staffIds.map(item => Number(item))
        this.cacheSendStaff = this.staffIds.join(',')
      }
      if (this.issueValue.length) { req.tagIds = this.issueValue }
      if (this.productValue.length) { req.productIds = this.productValue }
      if (this.currentScorer.length) req.operatorIds = this.currentScorer
      if (this.streamNum) req.streamNum = this.streamNum
      this.cacheTimeSpan = this.timeSpan
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
        this.searchTimeSpan = this.timeSpan
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await AssessmentCenter.getSearchHistory(req)
        this.photoList = data.list
        this.pager.total = data.total
      } catch (error) {
        console.error(error)
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 监听页面变化
     */
    handlePage () {
      this.$el.parentElement.scrollTop = 0
      this.getSearchHistory()
    }
  }
}
</script>

<style lang="less">
.assessment-history-module {
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
        text-align-last: justify;
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
  }

  .photo-data {
    margin-bottom: 24px;
  }

  .page-box {
    margin-top: 24px;
    text-align: center;
  }

  .no-data {
    padding: 40px 24px;
  }

  .el-pagination .btn-next,
  .el-pagination .btn-prev,
  .el-pager li {
    background-color: transparent;
  }
}

.info-drawer {
  border-radius: 20px 0 0 20px;

  .el-drawer__header {
    padding: 0;
    margin-bottom: 0;
  }

  .el-drawer__body {
    overflow: overlay;
  }
}

.info-drawer,
.v-modal {
  top: @navbarHeight !important;
  height: @drawerHeight !important;
}
</style>
