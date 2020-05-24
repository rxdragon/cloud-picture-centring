<template>
  <div class="retouch-history transform-fixed page-class">
    <div class="header">
      <h3>修图历史记录</h3>
    </div>
    <div class="search-box">
      <div class="date-search search-item">
        <span>时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <div class="stream-search search-item">
        <span>流水号</span>
        <el-input v-model="streamNum" clearable placeholder="请输入流水号" />
      </div>
      <div class="audit-box search-item">
        <span>门店退回</span>
        <return-select v-model="isReturn" />
      </div>
      <div class="audit-box search-item">
        <span>退单类型</span>
        <quality-select placeholder="请选择退单类型" :options="returnOptions" showAllOption v-model="returnType"/>
      </div>
      <div class="spot-check-box search-item">
        <span>门店点赞</span>
        <evaluate-select v-model="isGood" />
      </div>
      <div class="search-button-box">
        <el-button type="primary" @click="getRetouchList(1)">查询</el-button>
      </div>
    </div>
    <div class="table-box">
      <el-table :data="tableData" style="width: 100%;">
        <el-table-column prop="stream_num" label="流水号" width="160" />
        <el-table-column label="接单时间" width="150">
          <template slot-scope="scope">
            {{ scope.row.receipt_at | toTimeSpan }}
          </template>
        </el-table-column>
        <el-table-column prop="retouchAllTime" label="修图总时长" />
        <el-table-column prop="storeReturnNum" label="退单张数" width="80" />
        <el-table-column prop="lekimaCount" label="利奇马" />
        <el-table-column prop="exp" label="海草值">
          <template slot-scope="scope">
            <el-popover
              placement="right"
              width="240"
              popper-class="people-table"
              trigger="hover"
            >
              <el-table :key="scope.row.stream_num + 'photo'" :data="scope.row.peopleTable" style="width: 100%;">
                <el-table-column label="人数">
                  <template slot-scope="peopleData">
                    {{ Number(peopleData.row.peopleLabel) ? `${peopleData.row.peopleLabel}人` : peopleData.row.peopleLabel }}
                  </template>
                </el-table-column>
                <el-table-column prop="photoNum" label="数量" />
              </el-table>
              <span slot="reference">{{ scope.row.exp }}</span>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="收益">
          <template slot-scope="scope">
            <el-popover
              placement="right"
              popper-class="income-list"
              trigger="hover"
            >
              <p>修图收益：{{ scope.row.income.retouchIncome }}</p>
              <p>奖励收益：{{ scope.row.income.rewordIncome }}</p>
              <p>惩罚收益：{{ scope.row.income.punishIncome }}</p>
              <p>实获收益：{{ scope.row.income.actualIncome }}</p>
              <span slot="reference">{{ scope.row.income.actualIncome }}</span>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="质量问题/非质量问题（张）" width="200">
          <template slot-scope="scope">
            {{ scope.row.qualityNum }} / {{ scope.row.notQualityNum }}
          </template>
        </el-table-column>
        <el-table-column prop="goodEvaluate" label="门店评价">
          <template slot-scope="scope">
            <show-evaluate :evaluate="scope.row.goodEvaluate" />
          </template>
        </el-table-column>
        <el-table-column prop="retoucherNpsAvg" label="顾客满意度" />
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="linkto(scope.row.id)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="page-box">
        <el-pagination
          :hide-on-single-page="true"
          :current-page.sync="pager.page"
          :page-size="pager.pageSize"
          layout="total, prev, pager, next, jumper"
          :total="pager.total"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import ReturnSelect from '@SelectBox/ReturnStateSelect'
import QualitySelect from '@SelectBox/WhetherSelect'
import EvaluateSelect from '@SelectBox/EvaluateSelect'
import ShowEvaluate from '@/components/ShowEvaluate'
import { joinTimeSpan } from '@/utils/timespan.js'
import { SearchType } from '@/utils/enumerate'

import * as RetoucherCenter from '@/api/retoucherCenter.js'

export default {
  name: 'RetouchHistory',
  components: { DatePicker, ReturnSelect, EvaluateSelect, ShowEvaluate, QualitySelect },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 时间
      streamNum: '', // 流水号
      searchType: 0, // 搜索标准
      tableData: [], // 列表数据
      isReturn: 'all', // 门店退回
      isGood: 'all', // 是否门店点赞
      returnType: 'all', // 退单类型
      pager: {
        page: 1,
        pageSize: 10,
        total: 10
      },
      returnOptions: [{
        label: '质量问题',
        value: 'quality'
      },{
        label: '非质量问题',
        value: 'notQuality'
      }]
    }
  },
  watch: {
    '$route.query': {
      handler (query) {
        const { retouchHistoryTimeSpan, retouchHistorySearchType } = query
        if (retouchHistoryTimeSpan) {
          this.timeSpan = this.$route.query.retouchHistoryTimeSpan.split(',')
        }
        if (retouchHistorySearchType) {
          switch (retouchHistorySearchType) {
            case SearchType.GoodEvaluation:
              this.isGood = true
              break
            case SearchType.ReworkPhoto:
              this.isReturn = true
              break
            case SearchType.QualityRework:
              this.isReturn = true
              this.returnType = 'quality'
              break
          }
        }
        this.getRetouchList()
      },
      immediate: true
    }
  },
  methods: {
    /**
     * @description 跳转链接
     */
    linkto (streamId) {
      this.$router.push({
        path: '/order-detail',
        query: { streamId }
      })
    },
    /**
     * @description 获取历史列表
     * @param 页码 如果通过按搜索框搜索,传输1 到第一页
     */
    async getRetouchList (page) {
      try {
        if (page) { this.pager.page = page }
        const reqData = {
          page: this.pager.page,
          pageSize: this.pager.pageSize
        }
        if (this.timeSpan) {
          reqData.startAt = joinTimeSpan(this.timeSpan[0])
          reqData.endAt = joinTimeSpan(this.timeSpan[1], 1)
        }
        if (this.isReturn !== 'all' ) { reqData.isReturn = this.isReturn }
        if (this.isGood !== 'all' ) { reqData.evaluate = this.isGood ? 'good' : 'bad' }
        if (this.returnType !== 'all' ) { reqData.returnType = this.returnType }
        if (this.streamNum) { reqData.streamNum = this.streamNum }
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await RetoucherCenter.getRetouchQuotaList(reqData)
        this.pager.total = data.total
        this.tableData = data.list
        delete this.$route.query.retouchHistoryTimeSpan
        delete this.$route.query.retouchHistorySearchType
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    },
    /**
     * @description 页码改变
     */
    handleCurrentChange () {
      this.getRetouchList()
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";

.retouch-history {
  .table-box {
    margin-top: 20px;
  }

  .search-box {
    .search-item {
      margin-right: 30px;
    }
  }

  .stream-search {
    span {
      width: 60px;
    }
  }
}
</style>

<style lang="less">
.people-table {
  .el-table {
    position: relative;
    max-height: 400px;
    overflow: overlay;

    &::-webkit-scrollbar {
      width: 5px;
    }

    &::-webkit-scrollbar-thumb {
      background: #cdcdcd;
      border-radius: 10px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-button {
      display: none;
      background: #fff;
    }

    &::-webkit-scrollbar-corner {
      display: none;
    }

    .el-table__header-wrapper {
      position: sticky;
      top: 0;
      z-index: 99;
    }
  }

  .stream-state {
    .el-tag:nth-last-of-type(1) {
      margin-left: 12px;
    }

    .stream-num {
      display: inline-block;
    }

    &.wrap {
      .stream-num {
        display: block;
      }
    }
  }
}

.income-list {
  p {
    padding: 5px 0;
    font-size: 13px;
    color: #909399;
    text-align: center;
  }
}
</style>
