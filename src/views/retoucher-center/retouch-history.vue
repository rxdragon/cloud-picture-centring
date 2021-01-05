<template>
  <div class="retouch-history transform-fixed page-class">
    <div class="header">
      <h3>修图历史记录</h3>
    </div>
    <!-- 列表主要内容 -->
    <el-tabs ref="tabs" v-model="activeName" class="tabs-box">
      <el-tab-pane label="修图流水历史记录" :name="SEARCH_TYPE.NORMAL" />
      <el-tab-pane label="被退回流水历史记录" :name="SEARCH_TYPE.REWORK" />
    </el-tabs>
    <div
      class="history-main table-box"
      :class="{'no-border': activeName === SEARCH_TYPE.NORMAL }"
    >
      <!-- 搜索内容 -->
      <el-row class="search-box">
        <!-- 修图完成时间 -->
        <el-col :span="8" :xl="6">
          <div class="date-search search-item">
            <span>{{ activeName === SEARCH_TYPE.NORMAL ? '修图完成时间' : '退单时间' }}</span>
            <date-picker v-model="timeSpan" />
          </div>
        </el-col>
        <!-- 流水号 -->
        <el-col :span="8" :xl="6">
          <div class="stream-search search-item">
            <span>流水号</span>
            <el-input
              @keyup.native.enter="searchList(1)"
              v-model="streamNum"
              clearable
              placeholder="请输入流水号"
            />
          </div>
        </el-col>
        <!-- 门店退回 -->
        <el-col :span="8" :xl="6" v-show="activeName === SEARCH_TYPE.NORMAL">
          <div class="audit-box search-item">
            <span>门店退回</span>
            <return-select v-model="isReturn" />
          </div>
        </el-col>
        <!-- 门店评价 -->
        <el-col :span="8" :xl="6" v-show="activeName === SEARCH_TYPE.NORMAL">
          <div class="spot-check-box search-item">
            <span>门店评价</span>
            <evaluate-select v-model="isGood" />
          </div>
        </el-col>
        <!-- 退单类型 -->
        <el-col :span="activeName === SEARCH_TYPE.NORMAL ? 8 : 6" :xl="6">
          <div class="audit-box search-item">
            <span>退单类型</span>
            <quality-select v-model="returnType" />
          </div>
        </el-col>
        <!-- 云学院抽查类型 -->
        <el-col :span="8" :xl="6" v-show="activeName === SEARCH_TYPE.NORMAL">
          <div class="spot-check-box search-item">
            <span>抽查类型</span>
            <cloud-spot-grass-select v-model="cloudEvaluateType" clearable />
          </div>
        </el-col>
        <!-- 云学院问题标签 -->
        <el-col :span="8" :xl="6" v-if="activeName === SEARCH_TYPE.NORMAL">
          <div class="cloud-issue-box search-item">
            <span>问题标签</span>
            <issue-label-select ref="issueLabelSelect" v-model="issueValue" />
          </div>
        </el-col>
        <!-- 是否云学院抽查 -->
        <el-col :span="8" :xl="4" v-show="activeName === SEARCH_TYPE.NORMAL">
          <div class="spot-check-box search-item">
            <span>云学院抽查</span>
            <cloud-spot v-model="cloudSpot" clearable />
          </div>
        </el-col>
        <!-- 查询按钮 -->
        <el-col :span="activeName === SEARCH_TYPE.NORMAL ? 8 : 2" :xl="2">
          <div class="search-button-box search-item">
            <el-button type="primary" @click="searchList(1)">查询</el-button>
          </div>
        </el-col>
      </el-row>
      
      <!-- 表格内容 -->
      <div class="table-module">
        <el-table :data="tableData" style="width: 100%;" @expand-change="onTableRowChange">
          <el-table-column type="expand" fixed="left">
            <template slot-scope="{ row }">
              <div class="photo-module" v-loading="row.loading">
                <div
                  class="photo-list"
                  v-if="(row.isStoreReturned || row.isCloudEvaluation) && row.listShowPhotoList.length"
                >
                  <template v-for="(photoItem, photoIndex) in row.listShowPhotoList">
                    <div class="photo-chunk" :key="photoIndex">
                      <photo-box
                        :tags="photoItem.baseData.tags"
                        contain-photo
                        :src="photoItem.completePhoto.path"
                        :show-special-effects="false"
                        :show-store-part-rework-reason="false"
                        show-label-info
                      />
                    </div>
                  </template>
                </div>
                <div class="no-data" v-else>暂无可申诉照片</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="流水号" width="200" fixed="left">
            <template slot-scope="{ row }">
              <div>
                <p>{{ row.streamNum }}</p>
                <el-tag
                  v-if="row.isStoreReturned"
                  class="stream-tag"
                  effect="plain"
                  size="mini"
                  type="danger"
                >
                  被退
                </el-tag>
                <el-tag
                  v-if="row.hasOvertimeIncome"
                  class="stream-tag"
                  effect="plain"
                  size="mini"
                  type="warning"
                >
                  沙漏超时
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="接单时间" min-width="70">
            <template slot-scope="scope">
              <span class="time-block"></span>
              {{ scope.row.receiptAt | toTimeSpan }}
            </template>
          </el-table-column>
          <el-table-column prop="retouchAllTime" label="修图总时长" width="100" />
          <el-table-column label="海草值(颗)">
            <template slot-scope="{ row }">
              <el-popover placement="right" popper-class="income-list" trigger="hover">
                <div class="table-detail-box">
                  <p>照片海草：<span>{{ row.exp | toFixedString }}</span></p>
                  <p class="text-red">被退惩罚海草：<span>{{ row.punishExp | toFixedString }}</span></p>
                  <p class="text-red">沙漏超时惩罚海草：<span>{{ row.overtimeExp | toFixedString }}</span></p>
                  <p class="text-money">退单回滚海草：<span>{{ row.rollbackExpRework | toFixedString }}</span></p>
                  <p class="text-money">沙漏回滚海草：<span>{{ row.rollbackExpOvertime | toFixedString }}</span></p>
                  <p class="text-money">时段奖励海草：<span>{{ row.timeIntervalRewardExp | toFixedString }}</span></p>
                  <p>实际获得海草：<span>{{ row.actualExp | toFixedString }}</span></p>
                </div>
                <span class="hover-class" slot="reference">{{ row.actualExp | toFixedString }}</span>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="实际收益(元)">
            <template slot-scope="{ row }">
              <el-popover placement="right" popper-class="income-list" trigger="hover">
                <div class="table-detail-box">
                  <p>照片收益：<span>{{ row.retouchIncome | toFixedString }}</span></p>
                  <p class="text-red">沙漏惩罚收益：<span>{{ row.overtimeIncome | toFixedString }}</span></p>
                  <p class="text-red">退单惩罚收益：<span>{{ row.punishIncome | toFixedString }}</span></p>
                  <p class="text-money">奖励收益：<span>{{ row.rewordIncome | toFixedString }}</span></p>
                  <p class="text-money">时段金币收益：<span>{{ row.timeIntervalRewardIncome | toFixedString }}</span></p>
                  <p class="text-money">退单回滚收益：<span>{{ row.rollbackIncomeRework | toFixedString }}</span></p>
                  <p class="text-money">沙漏回滚收益：<span>{{ row.rollbackIncomeOvertime | toFixedString }}</span></p>
                  <p>实获收益：<span>{{ row.actualIncome | toFixedString }}</span></p>
                </div>
                <span class="hover-class" slot="reference">{{ row.actualIncome | toFixedString }}</span>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="退单张数">
            <template slot-scope="{ row }">
              <el-popover placement="right" popper-class="income-list" trigger="hover">
                <div class="table-detail-box">
                  <p>质量问题数量：<span>{{ row.qualityNum || row.qualityNumForRework }}</span></p>
                  <p>非质量问题数量：<span>{{ row.notQualityNum || row.notQualityNumForRework }}</span></p>
                  <p>质量&非质量问题数量：<span>{{ row.bothNum || row.bothNumForRework }}</span></p>
                  <p>回滚质量问题数量：<span>{{ row.rollbackNumForRework }}</span></p>
                </div>
                <span class="hover-class" slot="reference">{{ row.allReturnPhotoNum }}</span>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="云学院抽查" width="100">
            <template slot-scope="{ row }">
              <div :class="row.isCloudEvaluation && 'spot-class'">{{ row.isCloudEvaluation ? '是' : '否' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="门店评价" width="120">
            <template slot-scope="{ row }">
              <div class="table-detail-box">
                <p>门店评价：<show-evaluate :evaluate="row.goodEvaluate" /></p>
                <p>顾客评价：<span>{{ row.retoucherNpsAvg }}</span></p>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="linkto(scope.row)">详情</el-button>
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
import QualitySelect from '@SelectBox/QualitySelect'
import EvaluateSelect from '@SelectBox/EvaluateSelect'
import CloudSpot from '@SelectBox/CloudSpot'
import IssueLabelSelect from '@SelectBox/IssueLabelSelect'
import ShowEvaluate from '@/components/ShowEvaluate'
import CloudSpotGrassSelect from '@/components/CloudSpotGrassSelect'
import PhotoBox from '@/components/PhotoBox'

import { joinTimeSpan } from '@/utils/timespan.js'
import { SearchType } from '@/utils/enumerate'

import * as RetoucherCenter from '@/api/retoucherCenter.js'
import * as Commonality from '@/api/commonality.js'

const SEARCH_TYPE = {
  NORMAL: 'normal', // 正常流水
  REWORK: 'rework', // 重修流水
}

export default {
  name: 'RetouchHistory',
  components: { DatePicker, ReturnSelect, EvaluateSelect, ShowEvaluate, QualitySelect, IssueLabelSelect, CloudSpot, CloudSpotGrassSelect, PhotoBox },
  data () {
    return {
      SEARCH_TYPE,
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 时间
      streamNum: '', // 流水号
      searchType: 0, // 搜索标准
      tableData: [], // 列表数据
      isReturn: '', // 门店退回
      isGood: 'all', // 是否门店点赞
      returnType: '', // 退单类型
      cloudSpot: '', // 云学院抽查
      cloudEvaluateType: '', // 云学院种草类型
      issueValue: [], // 云学院问题标签
      activeName: SEARCH_TYPE.NORMAL, // 标签显示类型
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
    'activeName': {
      handler (e) {
        if (e === SEARCH_TYPE.REWORK) { this.resetSearchParm('noTime') }
        this.searchList(1)
      }
    }
  },
  /**
   * @description 监听路由
   */
  beforeRouteEnter (to, from, next) {
    next(vm => {
      // 防止重复刷新获取数据
      const keepLiveRoute = ['RetouchHistory', 'orderDetail']
      if (keepLiveRoute.includes(_.get(from, 'name'))) return

      vm.$nextTick(() => {
        const { retouchHistoryTimeSpan, retouchHistorySearchType } = to.query
        if (retouchHistoryTimeSpan) { vm.timeSpan = retouchHistoryTimeSpan.split(',') }
        // 如果如有有带参数，重制条件
        if (retouchHistorySearchType) {
          vm.resetSearchParm()
          switch (retouchHistorySearchType) {
            case SearchType.GoodEvaluation:
              vm.isGood = true
              break
            case SearchType.BadEvaluation:
              vm.isGood = false
              break
            case SearchType.ReworkPhoto:
              vm.activeName = SEARCH_TYPE.REWORK
              break
          }
          vm.resetTabActivePosition(vm.$refs.tabs.$el)
          vm.searchList(1)
        }
      })
    })
  },
  created () {
    this.searchList(1)
  },
  methods: {
    /**
     * @description 重制条件
     */
    resetSearchParm (notChangeTime) {
      this.timeSpan = notChangeTime ? this.timeSpan : null
      this.streamNum = ''
      this.searchType = 0
      this.tableData = []
      this.isReturn = ''
      this.isGood = 'all'
      this.returnType = ''
      this.cloudSpot = ''
      this.cloudEvaluateType = ''
      this.issueValue = []
    },
    /**
     * @description 变更代码
     */
    resetTabActivePosition ($el) {
      setTimeout(() => {
        const activeEl = $el.querySelector('.el-tabs__item.is-active')
        const lineEl = $el.querySelector('.el-tabs__active-bar')
        const style = getComputedStyle(activeEl)
        const pl = style.paddingLeft.match(/\d+/)[0] * 1
        const pr = style.paddingRight.match(/\d+/)[0] * 1
        const w = style.width.match(/\d+/)[0] * 1
        lineEl.style.transform = 'translateX(' + (activeEl.offsetLeft + pl) + 'px)'
        lineEl.style.width = (w - pl - pr)+'px'
      }, 100)
    },
    /**
     * @description 跳转链接
     */
    linkto (row) {
      const { streamId } = row
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
        if (this.activeName === SEARCH_TYPE.REWORK) { reqData.isReturned = true }
        if (this.timeSpan) {
          reqData.startAt = joinTimeSpan(this.timeSpan[0])
          reqData.endAt = joinTimeSpan(this.timeSpan[1], 1)
        }
        if (typeof this.cloudSpot === 'boolean') { reqData.cloudEvaluation = this.cloudSpot }
        if (this.issueValue.length) { reqData.cloudTags = this.issueValue }
        if (this.isReturn) { reqData.isReturn = this.isReturn === 'isReturn' }
        if (this.isGood !== 'all' ) { reqData.evaluate = this.isGood ? 'good' : 'bad' }
        if (this.returnType) { reqData.storeReworkType = this.returnType }
        if (this.streamNum) { reqData.streamNum = this.streamNum }
        if (this.cloudEvaluateType) { reqData.cloudEvaluateType = this.cloudEvaluateType }
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await RetoucherCenter.getRetouchQuotaList(reqData)
        this.pager.total = data.total
        this.tableData = data.list
        delete this.$route.query.retouchHistoryTimeSpan
        delete this.$route.query.retouchHistorySearchType
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 页码改变
     */
    handleCurrentChange () {
      this.searchList()
    },
    /**
     * @description 监听表格框展开缩小
     */
    async onTableRowChange (row, expandedRows) {
      row.isExpanded = !row.isExpanded
      if (!row.listShowPhotoList.length) {
        row.loading = true
        const photos = await this.getIssuePhotos(row.streamId)
        row.listShowPhotoList = photos
      }
      row.loading = false
    },
    /**
     * @description 获取问题照片
     */
    async getIssuePhotos (streamId) {
      const req = { streamId }
      const photos = await Commonality.getIssuePhotos(req)
      return photos
    }
  }
}
</script>

<style lang="less" scoped>
.retouch-history {
  .stream-tag {
    margin-right: 6px;
  }

  .history-main {
    margin-top: 0;

    .search-box {
      flex-wrap: wrap;

      .search-item {
        margin-right: 0;
        margin-bottom: 20px;

        & span {
          display: inline-block;
          flex-shrink: 0;
          width: 98px;
          text-align: right;
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

      .search-button-box {
        justify-content: flex-end;
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

    .photo-module {
      .photo-list {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        margin-right: -10px;
        margin-bottom: -10px;

        .photo-chunk {
          width: 141px;
          height: 141px;
          padding: 6px;
          margin-right: 10px;
          margin-bottom: 10px;
          background-color: #f5f7fa;
          border-radius: 4px;
        }
      }
    }
  }
}

.hover-class {
  color: @blue;
  text-decoration: underline;
  cursor: pointer;
}

.spot-class {
  color: @green;
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

.table-detail-box {
  p {
    display: flex;
    justify-content: space-between;
  }
}
</style>
