<template>
  <div class="search-retouch-record">
    <!-- 修图记录 -->
    <el-button type="primary" @click="openShowSearchPage">{{ searchRole === SEARCH_ROLE.GROUP_LEADER ? '组员修图记录' : '云端全流水查询' }}</el-button>
    <div class="search-page" v-if="searchPage" v-loading="loading">
      <div class="header-box">
        <h3>{{ searchRole === SEARCH_ROLE.GROUP_LEADER ? '组员修图记录' : '云端全流水查询' }}</h3>
        <div class="header-plugin">
          <el-button @click="closeShowSearchPage" type="primary" plain>返回</el-button>
        </div>
      </div>
      <!-- 搜索框 -->
      <el-row class="search-box" :gutter="20">
        <!-- 门店退单时间 -->
        <el-col :span="8" :xl="8">
          <div class="search-item">
            <span>门店退单时间</span>
            <date-picker v-model="reworkTimeSpan" :disabled="canSelectTimeSpan('reworkTimeSpan')" />
          </div>
        </el-col>
        <!-- 云端审核通过时间 -->
        <el-col :span="8" :xl="8">
          <div class="search-item">
            <span>云端审核通过时间</span>
            <date-picker
              v-model="cloudAuditTimeSpan"
              :disabled="canSelectTimeSpan('cloudAuditTimeSpan')"
            />
          </div>
        </el-col>
        <!-- 门店评价时间 -->
        <el-col :span="8" :xl="8">
          <div class="search-item">
            <span>门店评价时间</span>
            <date-picker
              v-model="storeEvaluateTimeSpan"
              :disabled="canSelectTimeSpan('storeEvaluateTimeSpan')"
            />
          </div>
        </el-col>
        <!-- 云学院评价时间 -->
        <el-col :span="12" :xl="6">
          <div class="search-item">
            <span>云学院评价时间</span>
            <date-picker
              v-model="cloudEvaluateTimeSpan"
              :disabled="canSelectTimeSpan('cloudEvaluateTimeSpan')"
            />
          </div>
        </el-col>
        <!-- 云学院标签 -->
        <el-col :span="12" :xl="6">
          <div class="search-item">
            <span>云学院标签</span>
            <issue-label-select :disabled="canSelectTimeSpan('cloudIssueValue')" v-model="cloudIssueValue" :type="GRADE_LABEL_TYPE.CLOUD"/>
          </div>
        </el-col>
        <!-- 修修兽评分时间 -->
        <el-col :span="12" :xl="6">
          <div class="search-item">
            <span>修修兽评分时间</span>
            <date-picker
              v-model="showEvaluateTimeSpan"
              :disabled="canSelectTimeSpan('showEvaluateTimeSpan')"
            />
          </div>
        </el-col>
        <!-- 修修兽标签 -->
        <el-col :span="12" :xl="6">
          <div class="search-item">
            <span>修修兽标签</span>
            <issue-label-select :disabled="canSelectTimeSpan('showIssueValue')" v-model="showIssueValue" :type="GRADE_LABEL_TYPE.SHOW_PIC"/>
          </div>
        </el-col>
        <!-- 门店退回问题 -->
        <el-col :span="6" :xl="6">
          <div class="search-item">
            <span>门店退回类型</span>
            <quality-select v-model="returnType" />
          </div>
        </el-col>
        <!-- 门店评价 -->
        <el-col :span="6" :xl="6">
          <div class="search-item">
            <span>门店评价</span>
            <evaluate-select v-model="isGood" />
          </div>
        </el-col>
        <!-- 伙伴 -->
        <el-col :span="6" :xl="6">
          <div class="staff-option search-item" v-if="searchRole === SEARCH_ROLE.GROUP_LEADER">
            <span>组员</span>
            <crew-select v-model="staffId" />
          </div>
          <div class="staff-search search-item" v-if="searchRole === SEARCH_ROLE.OPERATE">
            <span>云端伙伴</span>
            <staff-select v-model="staffIds" />
          </div>
        </el-col>
        <!-- 查 询 -->
        <el-col :span="6" :xl="6">
          <div class="search-item">
            <el-button type="primary" @click="searchCloudInfo(1)">查 询</el-button>
          </div>
        </el-col>
      </el-row>
      <!-- 列表数据 -->
      <div class="table-box">
        <el-table :data="tableData" style="width: 100%;">
          <el-table-column prop="retoucher" label="组员" />
          <el-table-column prop="streamNum" label="流水号" width="180" />
          <el-table-column label="修图时间">
            <template slot-scope="{ row }">
              <div class="table-detail-box">
                <p>时长：{{ row.retouchAllTime }}</p>
                <p>接单时间：{{ row.receiptAt }}</p>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="退回张数">
            <template slot-scope="{ row }">
              <div class="table-detail-box">
                <p>总张数：{{ row.allReturnPhotoNum }}</p>
                <p>退回时间：{{ row.storeReturnTime }}</p>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="抽查类型">
            <template slot-scope="{ row }">
              <div class="table-detail-box">
                <p>抽查类型：{{ row.evaluationTypeCN || '-' }}</p>
                <p>评价时间：{{ row.cloudEvaluateTime }}</p>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="评价" width="120">
            <template slot-scope="{ row }">
              <div class="table-detail-box">
                <p>门店评价：<show-evaluate :evaluate="row.goodEvaluate" /></p>
                <p>顾客评价：{{ row.retoucherNpsAvg || '-' }}</p>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="right" width="80">
            <template slot-scope="{ row }">
              <el-button type="primary" size="small" @click="linkto(row.streamId)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页html -->
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
import IssueLabelSelect from '@SelectBox/IssueLabelSelect'
import DatePicker from '@/components/DatePicker'
import EvaluateSelect from '@SelectBox/EvaluateSelect'
import QualitySelect from '@SelectBox/QualitySelect'
import CrewSelect from '@SelectBox/CrewSelect'
import StaffSelect from '@SelectBox/StaffSelect'
import ShowEvaluate from '@/components/ShowEvaluate'
import moment from 'moment'

import { SEARCH_ROLE, GRADE_LABEL_TYPE, SPOT_CHECK_MAP } from '@/utils/enumerate'
import { joinTimeSpan, delayLoading } from '@/utils/timespan.js'

import * as OperationManage from '@/api/operationManage.js'
import * as RetouchLeader from '@/api/retouchLeader.js'

export default {
  name: 'SearchRetouchRecord',
  components: { DatePicker, IssueLabelSelect, EvaluateSelect, QualitySelect, CrewSelect, StaffSelect, ShowEvaluate },
  props: {
    searchRole: { type: String, required: true },
    searchPage: { type: Boolean, required: true }
  },
  data () {
    return {
      SEARCH_ROLE,
      GRADE_LABEL_TYPE,
      loading: false,
      reworkTimeSpan: null, // 门店退单时间
      storeEvaluateTimeSpan: null, // 门店评价时间
      cloudAuditTimeSpan: null, // 云端审核时间
      cloudEvaluateTimeSpan: null, // 云学院评价时间
      showEvaluateTimeSpan: null, // 修修兽评价时间
      cloudIssueValue: [], // 云学院问题标签
      showIssueValue: [], // 修修兽问题标签
      returnType: '', // 门店退单类型
      isGood: 'all', // 门店评价
      staffId: '', // 组员
      staffIds: [], // 云端伙伴
      tableData: [],
      pager: {
        page: 1,
        pageSize: 10,
        total: 10
      }
    }
  },
  methods: {
    /**
     * @description 搜索流水信息
     */
    async searchCloudInfo (page) {
      try {
        this.pager.page = page === 1 ? 1 : this.pager.page
        // 是否为运营查询
        const req = this.getParams()
        if (!req) return
        this.loading = true
        if (this.searchRole === SEARCH_ROLE.OPERATE) {
          await this.searchForOperate(req)
        } else {
          await this.searchForGroupLeader(req)
        }
      } catch (error) {
        if (error.message) { this.$newMessage.warning(error.message) }
      } finally {
        await delayLoading()
        this.loading = false
      }
    },
    /**
     * @description 获取搜索参数
     */
    getParams () {
      function getDiffDays (timeSpan) {
        if (!timeSpan) return -1
        const startTime = moment(timeSpan[0])
        const endTime = moment(timeSpan[1])
        return endTime.diff(startTime, 'days')
      }
      const req = {
        page: this.pager.page,
        pageSize: this.pager.pageSize
      }
      const timeTypes = [
        'reworkTimeSpan',
        'storeEvaluateTimeSpan',
        'cloudAuditTimeSpan',
        'cloudEvaluateTimeSpan',
        'showEvaluateTimeSpan',
      ]
      if (!timeTypes.some(type => Boolean(this[type]))) {
        this.$newMessage.warning('请填写时间')
        return false
      }
      // 如果选中退回标记问题或者云学院问题标记讲不能查询超过10日的日期
      if (this.cloudIssueValue.length || this.showIssueValue.length || this.returnType) {
        const timeType = ['reworkTimeSpan', 'storeEvaluateTimeSpan', 'cloudAuditTimeSpan', 'cloudEvaluateTimeSpan', 'showEvaluateTimeSpan']
        const timeLess10 = timeType.some(timeTypeItem => {
          const diffDays = getDiffDays(this[timeTypeItem])
          return diffDays <= 10 && diffDays >= 0
        })
        if (!timeLess10) {
          this.$newMessage.warning('选择门店退回类型或者云学院问题标签后，查询日期不能大于10天')
          return false
        }
      }
      if (this.reworkTimeSpan) {
        req.returnStartAt = joinTimeSpan(this.reworkTimeSpan[0])
        req.returnEndAt = joinTimeSpan(this.reworkTimeSpan[1], 1)
      }
      if (this.storeEvaluateTimeSpan) {
        req.storeEvaluateStartAt = joinTimeSpan(this.storeEvaluateTimeSpan[0])
        req.storeEvaluateEndAt = joinTimeSpan(this.storeEvaluateTimeSpan[1], 1)
      }
      if (this.cloudAuditTimeSpan) {
        req.passStartAt = joinTimeSpan(this.cloudAuditTimeSpan[0])
        req.passEndAt = joinTimeSpan(this.cloudAuditTimeSpan[1], 1)
      }
      if (this.cloudEvaluateTimeSpan) {
        req.cloudEvaluateStartAt = joinTimeSpan(this.cloudEvaluateTimeSpan[0])
        req.cloudEvaluateEndAt = joinTimeSpan(this.cloudEvaluateTimeSpan[1], 1)
        req.cloudEvaluateType = SPOT_CHECK_MAP.CHECK_POOL_SPOT
      }
      if (this.showEvaluateTimeSpan) {
        req.cloudEvaluateStartAt = joinTimeSpan(this.showEvaluateTimeSpan[0])
        req.cloudEvaluateEndAt = joinTimeSpan(this.showEvaluateTimeSpan[1], 1)
        req.cloudEvaluateType = SPOT_CHECK_MAP.SHOW_PIC_SPOT
      }
      if (this.cloudIssueValue.length) {
        req.cloudEvaluateType = SPOT_CHECK_MAP.CHECK_POOL_SPOT
        req.cloudTags = this.cloudIssueValue
      }
      if (this.showIssueValue.length) {
        req.cloudEvaluateType = SPOT_CHECK_MAP.SHOW_PIC_SPOT
        req.cloudTags = this.showIssueValue
      }
      if (this.isGood !== 'all') { req.evaluate = this.isGood ? 'good' : 'bad' }
      if (this.returnType) { req.storeReworkType = this.returnType }
      // 伙伴id
      if (this.searchRole === SEARCH_ROLE.GROUP_LEADER && this.staffId) {
        req.retoucherIds = [this.staffId]
      }
      if (this.searchRole === SEARCH_ROLE.OPERATE && this.staffIds.length) {
        req.retoucherIds = this.staffIds
      }
      // 判断时间
      return req
    },
    /**
     * @description 运营搜搜
     */
    async searchForOperate (req) {
      const data = await OperationManage.getAllCloudStream(req)
      this.tableData = data.list
      this.pager.total = data.total
    },
    /**
     * @description 修图组长搜搜
     */
    async searchForGroupLeader (req) {
      const data = await RetouchLeader.getStaffRetouchList(req)
      this.tableData = data.list
      this.pager.total = data.total
    },
    /**
     * @description 打开搜索页面
     */
    openShowSearchPage () {
      this.$emit('update:searchPage', true)
    },
    /**
     * @description 打开搜索页面
     */
    closeShowSearchPage () {
      this.$emit('update:searchPage', false)
    },
    /**
     * @description 是否能选中日期
     */
    canSelectTimeSpan (type) {
      // 互斥规则
      const mutuallyTypes = [
        ['reworkTimeSpan', 'storeEvaluateTimeSpan', 'cloudAuditTimeSpan', 'cloudEvaluateTimeSpan', 'showEvaluateTimeSpan'],
        ['cloudIssueValue', 'showIssueValue'],
        ['cloudEvaluateTimeSpan', 'showIssueValue'],
        ['showEvaluateTimeSpan', 'cloudIssueValue'],
      ]

      const has = (type) => {
        return Array.isArray(this[type]) ? Boolean(this[type].length) : Boolean(this[type])
      }

      return mutuallyTypes.some(types => {
        if (!types.includes(type)) return false
        return types.some(t => has(t) && (t !== type))
      })
    },
    /**
     * @description 跳转详情
     */
    linkto (streamId) {
      const query = { streamId }
      this.$router.push({
        path: '/order-detail',
        query
      })
    },
    /**
     * @description 监听页面切换
     */
    handleCurrentChange () {
      this.searchCloudInfo()
    },
    /**
     * @description 重制搜索条件
     */
    resetSearchType () {
      this.reworkTimeSpan = null
      this.storeEvaluateTimeSpan = null
      this.cloudAuditTimeSpan = null
      this.cloudEvaluateTimeSpan = null
      this.cloudIssueValue = []
      this.showIssueValue = []
      this.returnType = ''
      this.isGood = 'all'
      this.staffId = ''
      this.staffIds = []
      this.tableData = []
      this.pager = {
        page: 1,
        pageSize: 10,
        total: 10
      }
    }
  }
}
</script>

<style lang="less" scoped>
.search-page {
  position: fixed;
  top: calc(~'@{navbarHeight} + @{tagsHeight}');
  left: @sideBarWidth;
  z-index: 3000;
  width: calc(~'100vw - @{sideBarWidth}');
  height: calc(~'@{appMainHeight} + @{headerHeight} ');
  padding: @appMainPadding;
  padding-bottom: 24px;
  overflow: overlay;
  background-color: #f2f6fc;
  transform: scale(1);
  transform-origin: right top;

  .header-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: @headerHeight;
    user-select: none;
    background-color: #f2f6fc;
    box-shadow: var(--boxShadow);

    h3 {
      font-size: 24px;
    }
  }

  .table-box {
    margin-top: 0;

    .table-detail-box {
      p {
        display: flex;
      }
    }
  }
}
</style>
