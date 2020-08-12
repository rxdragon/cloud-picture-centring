<template>
  <div class="cloud-report" v-loading="loading">
    <div class="search-box">
      <div class="search-item">
        <span>评价时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <div class="staff-option search-item" v-if="role === CLOUD_ROLE.GROUP_LEADER">
        <span>组员</span>
        <crew-select v-model="staffId" />
      </div>
      <div class="staff-search search-item" v-if="role === CLOUD_ROLE.OPERATE">
        <span>云端伙伴</span>
        <staff-select v-model="staffIds" />
      </div>
      <div class="product-box search-item" v-if="role === CLOUD_ROLE.OPERATE">
        <span>产品</span>
        <product-select v-model="productValue" />
      </div>
      <div class="button-box search-item">
        <el-button type="primary" @click="searchData">查 询</el-button>
      </div>
    </div>
    <div class="report-module">
      <div class="panel-title">整理抽查数据统计</div>
      <table class="table-panel" border="0">
        <th class="table-item" v-for="(spotItem, spotIndex) in spotData" :key="spotIndex">
          <tr class="info-title">{{ spotItem.lable }}</tr>
          <tr
            class="info-content"
            :class="{
              'info-content-nolink': spotIndex === 'score',
              'info-content-disabled': clickType === spotIndex
            }"
            @click="onClickClass(spotIndex)"
          >
            {{ spotItem.count }} {{ spotIndex !== 'score' ? '/' : '' }} {{ spotItem.rate }}
          </tr>
        </th>
      </table>
    </div>
    <!-- 统计详情 -->
    <div class="report-module">
      <div class="panel-title">统计详情</div>
      <div class="issues-main">
        <pie-chart :chart-data="cloudProblem" />
      </div>
    </div>
    <!-- 修图组数据统计 -->
    <div class="report-module" v-if="role !== CLOUD_ROLE.CREW">
      <div class="panel-title">修图组数据统计</div>
      <div class="search-item">
        <span>问题标签</span>
        <issue-label-select v-model="issueValue" />
      </div>
      <div class="issues-detail-main">
        <group-chart :time-span="timeSpan" :tags="issueValue" :role="role" />
      </div>
    </div>
  </div>
</template>

<script>
import CrewSelect from '@SelectBox/CrewSelect'
import StaffSelect from '@SelectBox/StaffSelect'
import ProductSelect from '@SelectBox/ProductSelect'
import IssueLabelSelect from '@SelectBox/IssueLabelSelect'
import DatePicker from '@/components/DatePicker'
import PieChart from '@/components/charts/PieChart'
import GroupChart from '@/components/ChartComponents/GroupChart'
import moment from 'moment'

import { CLOUD_ROLE, GRADE_TYPE } from '@/utils/enumerate'
import { joinTimeSpan, delayLoading } from '@/utils/timespan.js'

import * as AssessmentCenter from '@/api/assessmentCenter'


export default {
  name: 'CloudReport',
  components: { DatePicker, CrewSelect, StaffSelect, ProductSelect, PieChart, GroupChart, IssueLabelSelect },
  props: {
    role: { type: String, required: true }
  },
  data () {
    return {
      CLOUD_ROLE,
      GRADE_TYPE,
      loading: false,
      timeSpan: null,
      staffId: '',
      staffIds: [], // 云端伙伴
      productValue: [], // 产品
      cloudProblem: [],
      issueValue: [], // 问题标签
      clickType: GRADE_TYPE.PLANT, // 选中标签
      spotData: {
        [GRADE_TYPE.PLANT]: {
          count: 0,
          rate: '0%',
          lable: '种草张数 / 种草率'
        },
        [GRADE_TYPE.PULL]: {
          count: 0,
          rate: '0%',
          lable: '拔草张数 / 拔草率'
        },
        [GRADE_TYPE.NONE]: {
          count: 0,
          rate: '0%',
          lable: '一般张数 / 通过率'
        },
        score: {
          count: 0,
          rate: '',
          lable: '总体平均分'
        }
      }
    }
  },
  created () {
    const startAt = moment().subtract('day', 28).format('YYYY-MM-DD')
    const endAt = moment().format('YYYY-MM-DD')
    this.timeSpan = [startAt, endAt]
    this.searchData()
  },
  methods: {
    /**
     * @description 搜搜数据
     */
    async searchData () {
      this.loading = true
      try {
        await Promise.all([
          this.getCheckPoolQuota(),
          this.getCheckPoolSubQuota()
        ])
      } finally {
        await delayLoading()
        this.loading = false
      }
      
    },
    /**
     * @description 获取抽查指标参数
     */
    getCheckQuotaParams () {
      if (!this.timeSpan) {
        this.$newMessage.warning('请输入时间')
        return false
      }
      const req = {
        startAt: joinTimeSpan(this.timeSpan[0]),
        endAt: joinTimeSpan(this.timeSpan[1], 1)
      }
      if (this.role === CLOUD_ROLE.OPERATE && this.productValue.length) {
        req.productIds = this.productValue
      }
      if (this.role === CLOUD_ROLE.OPERATE && this.staffIds.length) {
        req.retoucherIds = this.staffIds
      }
      if (this.role === CLOUD_ROLE.GROUP_LEADER && this.staffId) {
        req.retoucherIds = [this.staffId]
      }
      return req
    },
    /**
     * @description 获取抽查统计
     */
    async getCheckPoolQuota () {
      const req = this.getCheckQuotaParams()
      if (!req) return
      const type = this.role
      const data = await AssessmentCenter.getCheckPoolQuota(req, type)
      for (const key in data) {
        this.spotData[key].count = data[key].count
        this.spotData[key].rate = data[key].rate
      }
    },
    /**
     * @description 监听点击大类切换
     */
    async onClickClass (type) {
      if (type === 'score' || type === this.clickType) return
      this.clickType = type
      try {
        this.loading = true
        await this.getCheckPoolSubQuota()
      } finally {
        this.loading = false
      }
    },
    /**
     * @description 获取饼图数据
     */
    async getCheckPoolSubQuota () {
      const req = this.getCheckQuotaParams()
      if (!req) return
      req.type = this.clickType
      const roleType = this.role
      this.cloudProblem = await AssessmentCenter.getCheckPoolSubQuota(req, roleType)
    }
  }
}
</script>

<style lang="less" scoped>
.search-item {
  margin-bottom: 24px;
}

.button-box {
  margin-right: 0;
}

.search-box {
  border-bottom: 1px solid #ecedee;
}

.panel-title {
  margin-bottom: 24px;
}

.report-module {
  margin-top: 24px;

  .issues-main {
    height: 400px;
  }
}

/deep/ .product-select {
  .el-cascader {
    width: 200px;
  }
}

.table-panel {
  width: 100%;
  border-collapse: collapse;

  .table-item {
    width: 25%;
    text-align: center;

    tr {
      display: block;
      width: 100%;
    }

    .info-title {
      padding: 24px 0;
      font-size: 14px;
      font-weight: 500;
      line-height: 22px;
      color: #303133;
      background-color: #fafafa;
    }

    .info-content {
      padding: 21px 0;
      font-size: 14px;
      font-weight: 500;
      line-height: 14px;
      color: #4669fb;
      text-decoration: underline;
      cursor: pointer;
    }

    .info-content-disabled,
    .info-content-nolink {
      color: #333;
      text-decoration: none;
      cursor: default;
    }
  }
}
</style>
