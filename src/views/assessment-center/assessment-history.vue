<template>
  <div class="assessment-history page-class">
    <div class="header">
      <h3>评价历史记录</h3>
      <el-button type="primary" @click="showDrawer">查看问题报告</el-button>
    </div>
    <div class="search-box">
      <div class="search-item">
        <span>抽查时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <!-- 修图师 -->
      <div class="staff-search search-item">
        <span>修图师</span>
        <staff-select v-model="staffIds" :props="{ multiple: true }" />
      </div>
      <!-- 产品名称 -->
      <div class="product-search search-item">
        <span>产品名称</span>
        <product-select v-model="productValue" />
      </div>
      <!-- 查询按钮 -->
      <div class="button-box">
        <el-button
          :disabled="!Boolean(timeSpan)"
          type="primary"
          class="search-button"
          @click="getSearchHistory(1)"
        >
          查询
        </el-button>
      </div>
    </div>
    <div class="search-box">
      <!-- 问题标签 -->
      <div class="product-search search-item">
        <span>问题标签</span>
        <issue-label-select v-model="issueValue" />
      </div>
      <div class="product-search search-item">
        <span>评分人</span>
        <el-select multiple v-model="currentScorer" placeholder="请选择伙伴">
          <el-option
            v-for="item in scorer"
            :key="item.id"
            :label="item.nickname"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </div>
    </div>
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
    <!-- 抽屉 -->
    <el-drawer
      v-if="timeSpan"
      custom-class="info-drawer"
      append-to-body
      :show-close="false"
      size="500"
      :visible.sync="drawer"
      :with-header="false"
    >
      <report-box :time-span="searchTimeSpan" :show-draw.sync="drawer" />
    </el-drawer>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import GradeBox from './components/GradeBox'
import StaffSelect from '@SelectBox/StaffSelect'
import ProductSelect from '@SelectBox/ProductSelect'
import IssueLabelSelect from '@SelectBox/IssueLabelSelect'
import ReportBox from './components/ReportBox.vue'
import moment from 'moment'
import { joinTimeSpan } from '@/utils/timespan.js'
import * as AssessmentCenter from '@/api/assessmentCenter'
import * as GradeConfiguration from '@/api/gradeConfiguration.js'

export default {
  name: 'AssessmentHistory',
  components: { DatePicker, GradeBox, StaffSelect, ProductSelect, IssueLabelSelect, ReportBox },
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
      drawer: false,
      scorer: [],
      currentScorer: [],
    }
  },
  created () {
    const startAt = moment().subtract('day', 28).locale('zh-cn').format('YYYY-MM-DD')
    const endAt = moment().locale('zh-cn').format('YYYY-MM-DD')
    this.timeSpan = [startAt, endAt]
    this.initial()
    this.getStaffList()
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
      if (searchTimeSpan) {
        this.timeSpan = searchTimeSpan.split(',')
      }
      if (sendStaff) {
        this.staffIds = sendStaff.split(',')
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
      if (this.staffIds.length) {
        req.retoucherIds = this.staffIds.map(item => Number(item))
        this.cacheSendStaff = this.staffIds.join(',')
      }
      if (this.issueValue.length) { req.tagIds = this.issueValue }
      if (this.productValue.length) { req.productIds = this.productValue }
      if (this.currentScorer.length) {
        req.operatorIds = this.currentScorer
      }
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
    },
    /**
     * @description 打开抽屉
     */
    showDrawer () {
      this.drawer = true
    },
    /**
     * @description 确认清除
     */
    async getStaffList () {
      const msg = await GradeConfiguration.getTakeStaffList()
      this.scorer = msg
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
      margin-left: auto;
    }

    .staff-search {
      & > span {
        width: 56px;
      }

      .el-cascader {
        width: 250px;
      }
    }

    .checker-search {
      .el-select {
        width: 120px;
      }
    }

    .product-search {
      .el-cascader {
        width: 250px;
      }
    }
  }

  .photo-data {
    margin-bottom: 24px;
  }

  .date-picker .el-range-editor.el-input__inner {
    width: 250px;

    .el-range-separator {
      width: 10%;
    }
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
