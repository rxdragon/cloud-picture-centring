<template>
  <div class="cloud-report" v-loading="loading">
    <!-- 搜索框 -->
    <el-row class="search-box" :gutter="20">
      <!-- 评价时间 -->
      <el-col :span="8" :xl="4">
        <div class="search-item">
          <span>评价时间</span>
          <date-picker v-model="timeSpan" />
        </div>
      </el-col>
      <!-- 产品 -->
      <el-col :span="8" :xl="4">
        <div class="product-box search-item">
          <span>产品</span>
          <ProductSelect :show-pic-product="false" v-model="productValue" />
        </div>
      </el-col>
      <el-col :span="8" :xl="4">
        <div class="search-item">
          <el-button type="primary" @click="searchData">查询</el-button>
        </div>
      </el-col>
    </el-row>
    
    <div class="total-chat-warp">
      <chart-bar title="平均分对比" :chartDatas="groupTotalRes">
        <span slot="other">云端平均分：{{ avgScore }}</span>
      </chart-bar>
    </div>
    <div class="content-divider"></div>

    <div class="group-warp">
      <el-tabs v-model="tabKey" @tab-click="handleChangeCategory">
        <el-tab-pane
          v-for="tab in cloudGradeConfigurationList"
          :label="tab.name"
          :name="tab.name"
          style="width: 100%;"
          :key="tab.id"
        >
        </el-tab-pane>
      </el-tabs>
      <el-divider class="divider"></el-divider>
      <div class="chart-warp">
        <div class="group-search-box">
          <span>标签</span>
          <el-select v-model="currentSelectedGroup" multiple placeholder="请选择">
            <el-option
              v-for="item in currentGroup"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
          <el-button type="primary" class="button" @click="handleSearchProblemBy">查询</el-button>
        </div>
        <chart-bar
          v-for="item in problemList"
          :key="item.name"
          :title="`${item.name}问题对比`"
          class="detail-chart"
          :chartDatas="item.data"
        >
        </chart-bar>
        <no-data class="chart" v-if="!problemList.length"></no-data>
      </div>
    </div>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker/index'
import ProductSelect from '@SelectBox/ProductSelect/index'
import ChartBar from './components/ChartBar'
import NoData from '@/components/NoData'
import * as AssessmentCenterApi from '@/api/assessmentCenter'
import * as GradeConfigurationApi from '@/api/gradeConfiguration'
import { gradeConfigurationToCN } from '@/utils/enumerate'
import * as timespanUtil from "@/utils/timespan"

export default {
  name: 'group-cloud-report',
  components: { DatePicker, ProductSelect, ChartBar, NoData },
  props: {
    searchRole: {
      type: String,
      require: true
    }
  },
  data () {
    return {
      gradeConfigurationToCN,
      loading: false,
      timeSpan: null,
      staffIds: [], // 云端伙伴
      productValue: [], // 产品
      tabKey: '',
      currentSelectedGroup: [],
      groupTotalRes: [],
      cloudGradeConfigurationList: [], // 评价标签
      GRADE_CONFIGURATION_TYPE: Object.values(gradeConfigurationToCN),
      avgScore: '', // 平均分
      problemList: [] // 分组的数据
    }
  },
  computed: {
    currentGroup () {
      if (!this.cloudGradeConfigurationList) return []
      const currentGroup = this.cloudGradeConfigurationList.find(tab => tab.name === this.tabKey)
      if (!currentGroup) return []
      return [
        ...(currentGroup.children || []),
      ]
    }
  },
  async mounted () {
    await this.getCloudGradeConfigurationList()
  },
  methods: {
    /**
     * 获取全部的标签配置
     */
    async getCloudGradeConfigurationList () {
      const res = await GradeConfigurationApi.getScoreConfig() || []
      if (res.length) {
        this.tabKey = res[0].name
      }
      this.cloudGradeConfigurationList = res
    },
    /**
     * @description 搜数据
     */
    async searchData () {
      if (!this.timeSpan) {
        return this.$message.warning('请输入时间')
      }
      this.loading = true
      const req = {
        startAt: timespanUtil.joinTimeSpan(this.timeSpan[0]),
        endAt: timespanUtil.joinTimeSpan(this.timeSpan[1], 1)
      }
      if (this.productValue.length) req.productIds = this.productValue

      try {
        const res = await AssessmentCenterApi.getCloudProblemReportByGroup(req, this.searchRole)
        this.groupTotalRes = res.group
        this.avgScore = res.avgScore ? Number(res.avgScore).toFixed(2) : '-'
      } finally {
        await timespanUtil.delayLoading()
        this.loading = false
      }
    },
    /**
     * 按照问题标签搜索
     */
    async handleSearchProblemBy () {
      if (!this.timeSpan) {
        return this.$message.warning('请输入时间')
      }
      const selectType = this.cloudGradeConfigurationList.find(conf => conf.name === this.tabKey)
      if (!selectType) return this.$message.warning('请选择评分类型')
      const req = {
        startAt: timespanUtil.joinTimeSpan(this.timeSpan[0]),
        endAt: timespanUtil.joinTimeSpan(this.timeSpan[1], 1),
        scoreTypeId: selectType.id
      }
      if (this.currentSelectedGroup.length) req.tagIds = this.currentSelectedGroup
      if (this.productValue.length) req.productIds = this.productValue
      this.loading = true
      try {
        const res = await AssessmentCenterApi.getCloudProblemByGroup(req, this.searchRole)
        this.problemList = res
      } finally {
        await timespanUtil.delayLoading()
        this.loading = false
      }
    },
    /**
     * 切换了大类需要初始化小类情况
     */
    handleChangeCategory () {
      this.currentSelectedGroup = []
    }
  }
}
</script>

<style lang="less" scoped>

.cloud-report {
  background-color: #fff;
}

.search-box {
  margin: 0 !important;
  border-bottom: 1px solid #ecedee;
}

.total-chat-warp {
  padding-top: 20px;
}

.content-divider {
  width: calc(100% + 48px);
  height: 20px;
  margin-left: -24px;
  background: #fafafa;
}

.group-warp {
  margin-top: 20px;
  background-color: #fff;

  .divider {
    margin: 1px 0 0;
  }

  .chart-warp {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    margin-top: 20px;

    .group-search-box {
      font-size: 14px;

      & > span {
        margin-right: 10px;
      }

      .button {
        margin-left: 32px;
      }
    }

    .total-sore {
      width: 100%;
      font-size: 16px;
      font-weight: bold;
      text-align: right;
    }

    .detail-chart {
      margin-top: 24px;
    }
  }
}

</style>
