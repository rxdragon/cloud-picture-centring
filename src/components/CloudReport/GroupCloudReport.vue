<template>
  <div class="cloud-report" v-loading="loading">
    <div class="search-box">
      <div class="search-item">
        <span>评价时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <div class="product-box search-item">
        <span>产品</span>
        <product-select v-model="productValue" />
      </div>
    </div>
    <div class="total-chat-warp">
      <chart-bar title="平均分对比" :chartDatas="groupTotalRes">
        <span slot="other">云端平均分：80</span>
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
          :key="tab.name"
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
              :value="item.name"
            >
            </el-option>
          </el-select>
          <el-button type="primary" class="button">查询</el-button>
        </div>
        <chart-bar
          v-for="item in GRADE_CONFIGURATION_TYPE"
          :key="item.id"
          :title="`${item.name}问题对比 单位：张`"
          class="detail-chart"
          :chartDatas="groupTotalRes"
        >
        </chart-bar>
      </div>
    </div>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker/index'
import ProductSelect from '@SelectBox/ProductSelect/index'
import ChartBar from './ChartBar'
import * as AssessmentCenterApi from '@/api/assessmentCenter'
import * as GradeConfigurationApi from '@/api/gradeConfiguration'
import { GRADE_CONFIGURATION_TYPE } from '@/utils/enumerate'
import * as timespanUtil from "@/utils/timespan"

export default {
  name: 'group-cloud-report',
  components: { DatePicker, ProductSelect, ChartBar },
  data () {
    return {
      loading: false,
      timeSpan: null,
      staffIds: [], // 云端伙伴
      productValue: [], // 产品
      tabKey: '',
      currentSelectedGroup: [],
      groupTotalRes: [],
      cloudGradeConfigurationList: [], // 评价标签
      GRADE_CONFIGURATION_TYPE
    }
  },
  computed: {
    currentGroup () {
      if (!this.cloudGradeConfigurationList) return []
      const currentGroup = this.cloudGradeConfigurationList.find(tab => tab.name === this.tabKey)
      if (!currentGroup) return []
      return [
        // { id: 0, name: '全部' },
        ...(currentGroup.children || []),
      ]
    }
  },
  async mounted () {
    await this.getCloudGradeConfigurationList()
    await this.searchData()
  },
  methods: {
    /**
     * 获取全部的标签配置
     */
    async getCloudGradeConfigurationList () {
      this.cloudGradeConfigurationList = await GradeConfigurationApi.getScoreConfig() || []
    },
    /**
     * @description 搜搜数据
     */
    async searchData () {
      this.loading = true
      try {
        const res = await AssessmentCenterApi.getCloudProblemReportByGroupNew()
        this.groupTotalRes = res
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
  padding-bottom: 24px;
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
