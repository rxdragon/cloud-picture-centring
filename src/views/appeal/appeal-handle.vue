<template>
  <div class="appeal-handle transform-fixed page-class">
    <div class="header">
      <h3>申诉处理</h3>
    </div>
    <el-tabs v-model="tabCurrent" @tab-click="tabClick">
      <el-tab-pane :label="`初审(${pageCounts.firstPhaseCount})`" name="first"></el-tab-pane>
      <el-tab-pane :label="`复审(${pageCounts.secondPhaseCount})`" name="second"></el-tab-pane>
      <el-tab-pane :label="`全部(${pageCounts.totalCount})`" name="all"></el-tab-pane>
    </el-tabs>
    <!-- 列表主要内容 -->
    <div :class="['history-main', 'table-box', tabCurrent === 'first' ? 'no-border' : '']">
      <el-row class="search-box" :gutter="20">
        <!-- 申诉时间 -->
        <el-col :span="8" :xl="4">
          <div class="date-search search-item">
            <span>申诉时间</span>
            <date-picker v-model="timeSpan" />
          </div>
        </el-col>
        <!-- 流水号 -->
        <el-col :span="8" :xl="4">
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
        <!-- 修图师 -->
        <el-col :span="8" :xl="4">
          <div class="stream-search search-item">
            <span>修图师</span>
            <staff-select v-model="staffId" />
          </div>
        </el-col>
        <!-- 处理状态 -->
        <el-col :span="6" :xl="4">
          <div class="audit-box search-item">
            <span>处理状态</span>
            <appeal-status-select :options="defaultOptions" v-model="appealStatus" />
          </div>
        </el-col>
        <!-- 申诉类型 -->
        <el-col :span="6" :xl="4">
          <div class="audit-box search-item">
            <span>申诉类型</span>
            <appeal-type-select
              needAll
              clearable
              isMulti
              v-model="appealType"
            />
          </div>
        </el-col>
        <!-- 摄影机构 -->
        <el-col :span="6" :xl="4">
          <div class="search-item">
            <span>摄影机构</span>
            <institution-select isMulti v-model="psOrganization" institution-class="photographe" />
          </div>
        </el-col>
        <!-- 是否为本人 -->
        <el-col :span="4" :xl="4">
          <div class="audit-box search-item">
            <el-checkbox v-model="justMe">仅看本人审核申诉</el-checkbox>
          </div>
        </el-col>
        <!-- 查询 -->
        <el-col :span="2" :xl="4">
          <div class="search-button-box search-item">
            <el-button type="primary" @click="searchList(1)">查询</el-button>
          </div>
        </el-col>
      </el-row>

      <div class="table-module">
        <el-table :data="tableData" style="width: 100%;">
          <el-table-column
            prop="streamNum"
            label="申诉信息"
            fixed="left"
            width="250"
          >
            <template slot-scope="{ row }">
              <div>
                <p class="table-title">申诉时间：</p>
                {{ row.createdAt }}
              </div>
              <div>
                <p class="table-title">申诉人：</p>
                {{ row.appealNickName }}（{{ row.appealGroupName }}）
              </div>
              <div>
                <p class="table-title">流水号：</p>
                {{ row.streamNum }}
              </div>
              <div>
                <p class="table-title">机构：</p>
                {{ row.photographerOrgName }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="appealTypeName" label="申诉类型" width="150" />
          <el-table-column prop="appealStatusDesc" label="处理状态" width="100" />
          <el-table-column label="初审详情">
            <template slot-scope="{ row }">
              <div>
                <p class="table-title">初审人：</p>
                {{ row.firstInfo.staffName }}
              </div>
              <div>
                <p class="table-title">初审状态：</p>
                {{ row.firstInfo.status }}
              </div>
              <div>
                <p class="table-title">初审时间：</p>
                {{ row.firstInfo.time }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="复审详情">
            <template slot-scope="{ row }">
              <div>
                <p class="table-title">复审人：</p>
                {{ row.secondInfo.staffName }}
              </div>
              <div>
                <p class="table-title">复审状态：</p>
                {{ row.secondInfo.status }}
              </div>
              <div>
                <p class="table-title">复审时间：</p>
                {{ row.secondInfo.time }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template slot-scope="{ row }">
              <!-- 初审 -->
              <el-button
                v-if="row.showFirstCheck && row.isSelfFirst && showFirstExamine"
                type="primary"
                size="mini"
                @click="firstCheck(row)"
              >
                初审
              </el-button>
              <!-- 复审 -->
              <el-button
                v-if="row.showSecondCheck && row.isSelfSecond && showSecondExamine"
                type="primary"
                size="mini"
                @click="secondCheck(row)"
              >
                复审
              </el-button>
              <!-- 查看 -->
              <el-button
                v-if="row.showDetail"
                type="primary"
                size="mini"
                @click="goDetail(row)"
              >
                查看
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
import InstitutionSelect from '@SelectBox/InstitutionSelect'
import AppealStatusSelect from '@SelectBox/AppealStatusSelect'
import AppealTypeSelect from '@SelectBox/AppealTypeSelect'
import StaffSelect from '@SelectBox/StaffSelect'
import DatePicker from '@/components/DatePicker'

import { allOption, firstOption, secondOption } from './options/index.js'
import { APPEAL_STREAM_STATUS } from '@/utils/enumerate'
import { mapGetters } from 'vuex'

import * as Appeal from '@/api/appeal.js'

export default {
  name: 'AppealHandle',
  components: { AppealStatusSelect, AppealTypeSelect, StaffSelect, DatePicker, InstitutionSelect },
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
      psOrganization: [],
      tableData: [], // 列表数据
      pager: {
        page: 1,
        pageSize: 20,
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
    ...mapGetters(['showFirstExamine', 'showSecondExamine']),
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
      const { id, isFirstChecking } = appealItem
      const linkObj = {
        id,
        type: 'first',
        needBind: !isFirstChecking
      }
      this.linkto(linkObj)
    },
    /**
     * @description 复审
     */
    secondCheck (appealItem) {
      const { id, isSecondChecking } = appealItem
      const linkObj = {
        id,
        type: 'second',
        needBind: !isSecondChecking
      }
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
      if (needBind && type === 'first') {
        this.$store.dispatch('setting/showLoading', this.routeName)
        try {
          await Appeal.bindFirst(query)
        } finally {
          this.$store.dispatch('setting/hiddenLoading', this.routeName)
        }
      }
      if (needBind && type === 'second') {
        this.$store.dispatch('setting/showLoading', this.routeName)
        try {
          await Appeal.bindSecond(query)
        } finally {
          this.$store.dispatch('setting/hiddenLoading', this.routeName)
        }
      }
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
      if (this.psOrganization.length) req.cond.photographerOrgIdsIn = this.psOrganization
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
      if (this.staffId.length) req.cond.appealStaffIdIn = this.staffId
      if (this.appealType) req.cond.typeIn = this.appealType
      if (this.streamNum) req.cond.streamNum = this.streamNum
      if (this.justMe) req.cond.bind = this.justMe
      if (!Object.keys(req.cond).length) delete req.cond // 后端{}报错,如果是{}去掉cond
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const listInfo = await Appeal.getAppealList(req, 'handle')
        const firstPhaseCount = _.get(listInfo, 'counts.first_phase_count') || 0
        const secondPhaseCount = _.get(listInfo, 'counts.second_phase_count') || 0
        const totalCount = _.get(listInfo, 'counts.total_count') || 0
        this.tableData = listInfo.list
        this.pager.total = listInfo.total || 0
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
    },
    /**
     * @description tab点击
     */
    tabClick () {
      this.appealStatus = []
      this.searchList(1)
    }
  }
}
</script>

<style lang="less" scoped>
.appeal-handle {
  .history-main {
    margin-top: 0;

    .table-module {
      .table-title {
        display: inline-block;
        width: 70px;
        text-align: left;
      }
    }

    .stream-search {
      span {
        flex-shrink: 0;
        width: 60px;
      }
    }
  }
}
</style>
