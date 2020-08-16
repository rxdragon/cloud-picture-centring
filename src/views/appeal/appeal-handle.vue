<template>
  <div class="appeal-handle transform-fixed page-class">
    <div class="header">
      <h3>申诉处理</h3>
    </div>
    <el-tabs v-model="tabCurrent" @tab-click="getAppealList">
      <el-tab-pane :label="`初审(${pageCounts.firstPhaseCount})`" name="first"></el-tab-pane>
      <el-tab-pane :label="`复审(${pageCounts.secondPhaseCount})`" name="second"></el-tab-pane>
      <el-tab-pane :label="`全部(${pageCounts.totalCount})`" name="all"></el-tab-pane>
    </el-tabs>
    <!-- 列表主要内容 -->
    <div :class="['history-main', 'table-box', tabCurrent === 'first' ? 'no-border' : '']">
      <div class="search-box">
        <!-- 申诉时间 -->
        <div class="date-search search-item">
          <span>申诉时间:</span>
          <date-picker v-model="timeSpan" />
        </div>
        <!-- 流水号 -->
        <div class="stream-search search-item">
          <span>流水号:</span>
          <el-input
            @keyup.native.enter="searchList(1)"
            v-model="streamNum"
            clearable
            placeholder="请输入流水号"
          />
        </div>
        <!-- 修图师 -->
        <div class="stream-search search-item">
          <span>修图师:</span>
          <staff-select v-model="staffId" />
        </div>
        <!-- 处理状态 -->
        <div class="audit-box search-item">
          <span>处理状态:</span>
          <appeal-status-select :options="defaultOptions" v-model="appealStatus" />
        </div>
        <!-- 申诉类型 -->
        <div class="audit-box search-item">
          <span>申诉类型</span>
          <appeal-type-select v-model="appealType" />
        </div>
        <!-- 是否为本人 -->
        <div class="audit-box search-item">
          <el-checkbox v-model="justMe">仅看本人审核申诉</el-checkbox>
        </div>
        <div class="search-button-box search-item">
          <el-button type="primary" @click="searchList(1)">查询</el-button>
        </div>
      </div>
      <div class="table-module">
        <el-table :data="tableData" style="width: 100%;">
          <el-table-column
            prop="streamNum"
            label="申诉信息"
            width="220"
            fixed="left"
          >
            <template slot-scope="{ row }">
              <div>
                <p class="table-title">时间:</p>
                {{ row.createdAt }}
              </div>
              <div>
                <p class="table-title">流水号:</p>
                {{ row.streamNum }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="申诉类型" prop="appealTypeName" width="150" />
          <el-table-column prop="appealStatusDesc" label="处理状态" width="100"/>
          <el-table-column prop="storeReturnNum" label="初审详情">
            <template slot-scope="{ row }">
              <div>
                <p class="table-title">初审人:</p>
                {{ row.firstInfo.staffName }}
              </div>
              <div>
                <p class="table-title">初审状态:</p>
                {{ row.firstInfo.status }}
              </div>
              <div>
                <p class="table-title">初审时间:</p>
                {{ row.firstInfo.time }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="storeReturnNum" label="复审详情">
            <template slot-scope="{ row }">
              <div>
                <p class="table-title">复审人:</p>
                {{ row.secondInfo.staffName }}
              </div>
              <div>
                <p class="table-title">复审状态:</p>
                {{ row.secondInfo.status }}
              </div>
              <div>
                <p class="table-title">复审时间:</p>
                {{ row.secondInfo.time }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template slot-scope="{ row }">
              <el-button
                type="primary"
                v-if="row.showFirstCheck"
                size="mini"
                @click="firstCheck(row)"
              >
                初审
              </el-button>
              <el-button
                type="primary"
                v-if="row.showSecondCheck"
                size="mini"
                @click="secondCheck(row)"
              >
                复审
              </el-button>
              <el-button
                type="primary"
                v-if="row.showDetail"
                size="mini"
                @click="goDetail(row)"
              >
                详情
              </el-button>
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
import AppealStatusSelect from '@SelectBox/AppealStatusSelect'
import AppealTypeSelect from '@SelectBox/AppealTypeSelect'
import StaffSelect from '@SelectBox/StaffSelect'
import DatePicker from '@/components/DatePicker'

import { allOption, firstOption, secondOption } from './options/index.js'
import { APPEAL_STREAM_STATUS } from '@/utils/enumerate'

import * as Appeal from '@/api/appeal.js'

export default {
  name: 'AppealHandle',
  components: { AppealStatusSelect, AppealTypeSelect, StaffSelect, DatePicker },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      staffId: [],
      tabCurrent: 'first',
      timeSpan: null, // 时间
      streamNum: '', // 流水号
      justMe: false, // 仅看本人
      appealStatus: [],
      appealType: '',
      tableData: [], // 列表数据
      pager: {
        page: 1,
        pageSize: 10,
        total: 10
      },
      pageCounts: {
        firstPhaseCount: 0,
        secondPhaseCount: 0,
        totalCount: 0
      }
    }
  },
  computed: {
    defaultOptions () {
      let defaultOption = []
      switch (this.tabCurrent) {
        case 'first':
          defaultOption = firstOption
          break
        case 'second':
          defaultOption = secondOption
          break
        case 'all':
          defaultOption = allOption
          break
        default:
      }
      return defaultOption
    }
  },
  activated () {
    this.getAppealList()
  },
  created () {
    this.getAppealList()
  },
  methods: {
    /**
     * @description 初审
     */
    firstCheck (appealItem) {
      const { id, isSelfFirst, isFirstChecking } = appealItem
      const linkObj = {
        id,
        type: 'first',
        needBind: !isFirstChecking
      }
      if (!isSelfFirst) return this.$newMessage.warning('别人正在审核')
      this.linkto(linkObj)
    },
    /**
     * @description 复审
     */
    secondCheck (appealItem) {
      const { id, isSelfSecond, isSecondChecking } = appealItem
      const linkObj = {
        id,
        type: 'second',
        needBind: !isSecondChecking
      }
      if (!isSelfSecond) return this.$newMessage.warning('别人正在审核')
      this.linkto(linkObj)
    },
    /**
     * @description 查看详情
     */
    goDetail (appealItem) {
      const { id } = appealItem
      const linkObj = { id }
      this.linkto(linkObj)
    },
    /**
     * @description 跳转链接
     */
    async linkto (linkObj) {
      const { id, type, needBind } = linkObj
      const query = { id }
      if (needBind) await Appeal.bindAppeal(query)
      query.type = type
      this.$router.push({
        path: '/appeal-detail',
        query
      })
    },
    /**
     * @description 搜索历史修图记录
     */
    searchList (page) {
      this.pager.page = page ? page : this.pager.page
      this.getAppealList()
    },
    /**
     * @description 获取申诉列表
     */
    async getAppealList () {
      const req = {
        page: this.pager.page,
        pageSize: this.pager.pageSize,
        cond: {}
      }
      if (this.timeSpan) {
        req.cond.startAtGte = this.timeSpan[0]
        req.cond.endAtLte = this.timeSpan[1]
      }
      if (this.appealStatus.length){
        req.cond.stateIn = this.appealStatus
      } else {
        let defaultStateIn = []
        switch (this.tabCurrent) {
          case 'first':
            defaultStateIn = [APPEAL_STREAM_STATUS.WAIT_FIRST, APPEAL_STREAM_STATUS.FIRST_EXAMINE]
            break
          case 'second':
            defaultStateIn = [APPEAL_STREAM_STATUS.WAIT_SECOND, APPEAL_STREAM_STATUS.SECOND_EXAMINE]
            break
          case 'all':
            defaultStateIn = []
            break
          default:
        }
        if (defaultStateIn.length) req.cond.stateIn = defaultStateIn
      }
      if (this.staffId.length) req.cond.appealStaffId = this.staffId
      if (this.appealType) req.cond.type = this.appealType
      if (this.streamNum) req.cond.streamNum = this.streamNum
      if (this.justMe) req.cond.bind = this.justMe
      if (!Object.keys(req.cond).length) delete req.cond // 后端{}报错,如果是{}去掉cond
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const listInfo = await Appeal.getAppealList(req)
        const firstPhaseCount = _.get(listInfo, 'counts.first_phase_count') || 0
        const secondPhaseCount = _.get(listInfo, 'counts.second_phase_count') || 0
        const totalCount = _.get(listInfo, 'counts.total_count') || 0
        this.tableData = listInfo.list
        this.pager.total = totalCount
        this.pageCounts = {
          firstPhaseCount,
          secondPhaseCount,
          totalCount
        }
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 页码改变
     */
    handleCurrentChange () {
      this.getAppealList()
    }
  }
}
</script>

<style lang="less" scoped>
.appeal-handle {
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
      .table-title {
        display: inline-block;
        width: 60px;
        text-align: right;
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
