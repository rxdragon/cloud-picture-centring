<template>
  <div class="retouch-history transform-fixed page-class">
    <div class="header">
      <h3>修图历史记录</h3>
    </div>
    <!-- 列表主要内容 -->
    <div class="history-main table-box">
      <div class="search-box">
        <!-- 修图完成时间 -->
        <div class="date-search search-item">
          <span>修图完成时间</span>
          <date-picker v-model="timeSpan" />
        </div>
        <!-- 流水号 -->
        <div class="stream-search search-item">
          <span>流水号</span>
          <el-input v-model="streamNum" clearable placeholder="请输入流水号" />
        </div>
        <!-- 门店退回 -->
        <div class="audit-box search-item">
          <span>门店退回</span>
          <return-select v-model="isReturn" />
        </div>
        <!-- 退单类型 -->
        <div class="audit-box search-item">
          <span>退单类型</span>
          <quality-select
            placeholder="请选择退单类型"
            :options="returnOptions"
            showAllOption
            v-model="returnType"
          />
        </div>
        <div class="spot-check-box search-item">
          <span>门店点赞</span>
          <evaluate-select v-model="isGood" />
        </div>
        <div class="search-button-box search-item">
          <el-button type="primary" @click="searchList(1)">查询</el-button>
        </div>
      </div>
      <div class="table-module">
        <el-table :data="tableData" style="width: 100%;">
          <el-table-column
            prop="streamNum"
            label="流水号"
            width="160"
            fixed="left"
          />
          <el-table-column label="接单时间" width="150">
            <template slot-scope="scope">
              {{ scope.row.receiptAt | toTimeSpan }}
            </template>
          </el-table-column>
          <el-table-column prop="retouchAllTime" label="修图总时长" width="100" />
          <el-table-column prop="storeReturnNum" label="退单张数" width="80" />
          <el-table-column prop="exp" label="海草值">
            <template slot-scope="{ row }">
              <el-popover
                placement="right"
                width="240"
                popper-class="people-table"
                trigger="hover"
              >
                <div class="exp-box">
                  <div class="exp-item exp-title">
                    <span>人数</span>
                    <span>数量</span>
                  </div>
                  <div class="exp-item exp-list" v-for="(expItem, expIndex) in row.peopleTable" :key="row.streamNum + expIndex">
                    <span>{{ Number(expItem.expItempeopleLabel) ? `${expItem.peopleLabel}人` : expItem.peopleLabel }}</span>
                    <span>{{ expItem.photoNum }}</span>
                  </div>
                </div>
                <span slot="reference">{{ row.exp }}</span>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="实际收益">
            <template slot-scope="{ row }">
              <el-popover placement="right" popper-class="income-list" trigger="hover">
                <p>修图收益：{{ row.retouchIncome | toFixedString }}</p>
                <p class="text-money">奖励收益：{{ row.rewordIncome | toFixedString }}</p>
                <p class="text-red">惩罚收益：{{ row.punishIncome | toFixedString }}</p>
                <p>实获收益：{{ row.actualIncome | toFixedString }}</p>
                <span slot="reference">{{ row.actualIncome | toFixedString }}</span>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="质量问题/非质量问题（张）" width="200">
            <template slot-scope="{ row }">
              {{ row.qualityNum }} / {{ row.notQualityNum }}
            </template>
          </el-table-column>
          <el-table-column prop="goodEvaluate" label="门店评价">
            <template slot-scope="scope">
              <show-evaluate :evaluate="scope.row.goodEvaluate" />
            </template>
          </el-table-column>
          <el-table-column prop="retoucherNpsAvg" label="顾客满意度" width="100" />
          <el-table-column label="操作" fixed="right">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="linkto(scope.row.streamId)">详情</el-button>
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
        value: 'not_quality'
      }]
    }
  },
  watch: {
    '$route': {
      handler (to, from) {
        const keepLiveRoute = ['RetouchHistory', 'orderDetail']
        if (keepLiveRoute.includes(_.get(from, 'name'))) return
        const { retouchHistoryTimeSpan, retouchHistorySearchType } = to.query
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
        this.searchList(1)
      },
      immediate: true
    }
  },
  methods: {
    /**
     * @description 跳转链接
     */
    linkto (streamId) {
      const query = { streamId }
      if (this.active === 'others') {
        query.searchOther = 1
      }
      this.$router.push({
        path: '/order-detail',
        query
      })
    },
    /**
     * @description 搜索历史修图记录
     */
    searchList (page) {
      this.pager.page = page ? page : this.pager.page
      this.getRetouchList()
    },
    /**
     * @description 获取历史列表
     * @param 页码 如果通过按搜索框搜索,传输1 到第一页
     */
    async getRetouchList () {
      try {
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
        if (this.returnType !== 'all' ) { reqData.storeReworkType = this.returnType }
        if (this.streamNum) { reqData.streamNum = this.streamNum }
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await RetoucherCenter.getRetouchQuotaList(reqData)
        this.pager.total = data.total
        this.tableData = data.list
        delete this.$route.query.retouchHistoryTimeSpan
        delete this.$route.query.retouchHistorySearchType
      } catch (error) {
        console.error(error)
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 页码改变
     */
    handleCurrentChange () {
      this.searchList()
    }
  }
}
</script>

<style lang="less" scoped>
.retouch-history {
  .history-main {
    margin-top: 0;

    .search-box {
      flex-wrap: wrap;

      .search-item {
        margin-right: 30px;
        margin-bottom: 20px;
      }
    }

    .table-module {
      margin-top: 0;

      & /deep/ .el-table--scrollable-x .el-table__body-wrapper {
        &::-webkit-scrollbar {
          height: 8px;
        }
      }
    }

    .stream-search {
      span {
        width: 60px;
      }
    }
  }
}
</style>

<style lang="less">
.people-table {
  .exp-box {
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

    .exp-item {
      display: flex;

      & > span {
        flex: 1;
        text-align: center;
      }
    }

    .exp-list {
      padding: 3px 0;
      border-bottom: 1px solid #ebeef5;

      &:hover {
        background-color: #f5f7fa;
      }
    }

    .exp-title {
      position: sticky;
      top: 0;
      z-index: 99;
      padding: 5px 0;
      background-color: #fafafa;
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

  .text-red {
    color: @red;
  }

  .text-money {
    color: @moneyColor;
  }

  .text-plant {
    color: @panGreen;
  }
}
</style>
