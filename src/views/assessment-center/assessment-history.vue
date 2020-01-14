<template>
  <div class="assessment-history page-class">
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
        <el-button :disabled="!Boolean(timeSpan)" type="primary" class="search-button" @click="getSearchHistory(1)">查询</el-button>
      </div>
    </div>
    <div class="search-box">
      <!-- 修图师 -->
      <div class="staff-search search-item">
        <span>修图师</span>
        <staff-select v-model="staffIds" :props="{ multiple: true }" />
      </div>
      <!-- 审核人员 -->
      <div class="checker-search search-item">
        <span>审核人员</span>
        <reviewer-select v-model="reviewerId" show-all />
      </div>
      <div class="product-search search-item">
        <span>产品名称</span>
        <product-select v-model="productValue" />
      </div>
    </div>
    <div v-for="photoItem in photoData" :key="photoItem.businessId" class="photo-data module-panel">
      <GradeBox :photo-info="photoItem" />
    </div>
    <div v-if="!photoData.length" class="module-panel no-data">暂无数据</div>
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
import ProductSelect from '@SelectBox/ProductSelect'
import moment from 'moment'
import * as AssessmentCenter from '@/api/assessmentCenter'
import { SearchType } from '@/utils/enumerate'
import { joinTimeSpan } from '@/utils/timespan.js'
export default {
  name: 'AssessmentHistory',
  components: { DatePicker, GradeBox, StaffSelect, ReviewerSelect, ProductSelect },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 时间
      correctType: 0, // 抽片类型
      spotType: 0, // 抽片类型 0 全部 plant 种草 pull 拔草 none 抽查不种不拔
      staffIds: '', // 修图师 id
      reviewerId: 0, // 审核人id
      photoData: [], // 照片数据
      productValue: [],
      pager: {
        page: 1,
        pageSize: 10,
        total: 10
      },
      uuid: '',
      cacheTimeSpan: [],
      cacheSearchType: '',
      cacheSendStaff: ''
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
      const { searchTimeSpan, searchType, sendStaff } = this.$route.query
      const routerTimeSpan = searchTimeSpan && searchTimeSpan.split(',') || []
      const sameTimeSpan = (routerTimeSpan[0] === this.cacheTimeSpan[0] && routerTimeSpan[1] === this.cacheTimeSpan[1])
      const sameSearchType = searchType === this.cacheSearchType
      const sameSendStaff = sendStaff === this.cacheSendStaff
      if (sameTimeSpan && sameSearchType && sameSendStaff) return false
      if (searchTimeSpan) { this.timeSpan = searchTimeSpan.split(',') }
      if (sendStaff) { this.staffIds = sendStaff.split(',') }
      switch (searchType) {
        case SearchType.SpotPlant:
          this.spotType = 'plant'
          break
        case SearchType.SpotPull:
          this.spotType = 'pull'
          break
        case SearchType.SpotNone:
          this.spotType = 'none'
          break
        default:
          break
      }
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
      if (this.correctType) { req.correctionType = this.correctType }
      if (this.spotType) { req.grassType = this.spotType }
      if (this.staffIds) {
        req.retoucherIds = this.staffIds.map(item => Number(item))
        this.cacheSendStaff = this.staffIds.join(',')
      }
      if (this.reviewerId) { req.reviewerId = this.reviewerId }
      if (this.productValue.length) { req.productIds = this.productValue }
      this.cacheTimeSpan = this.timeSpan
      this.cacheSearchType = this.spotType
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
        console.log(req)
        if (!req) return false
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await AssessmentCenter.getSearchHistory(req)
        this.photoData = data.list
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
      & > span {
        width: 56px;
      }

      .el-cascader {
        width: 400px;
      }
    }

    .checker-search {
      .el-select {
        width: 120px;
      }
    }

    .product-search {
      .el-cascader {
        width: 222px;
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

  .no-data {
    padding: 40px 24px;
  }

  .el-pagination .btn-next,
  .el-pagination .btn-prev,
  .el-pager li {
    background-color: transparent;
  }
}
</style>
