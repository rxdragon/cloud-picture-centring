<template>
  <div class="gold-config page-class">
    <transition name="fade" mode="out-in">
      <div v-if="!isAddConfig && !showTimeAwardInfo" class="gold-list">
        <div class="header">
          <h3>修图师时段奖励配置</h3>
          <el-button type="primary" @click="addConfig">添加新配置</el-button>
        </div>
        <!-- search -->
        <el-row class="search-box" :gutter="20">
          <el-col :span="6" :xl="4">
            <div class="search-item">
              <span>伙伴</span>
              <staff-select v-model="searchInfo.staffId" />
            </div>
          </el-col>
          <el-col :span="6" :xl="4">
            <div class="search-item">
              <span>标题</span>
              <el-input
                @keyup.native.enter="getTimeRewardList(1)"
                v-model="searchInfo.title"
                clearable
                placeholder="请输入标题"
              />
            </div>
          </el-col>
          <el-col :span="6" :xl="4">
            <div class="search-item">
              <span>奖励类型</span>
              <time-reward-type-select placeholder="全部" v-model="searchInfo.rewardType" />
            </div>
          </el-col>
          <el-col :span="4" :xl="4">
            <div class="search-item">
              <span>状态</span>
              <time-reward-state-select v-model="searchInfo.stateType" />
            </div>
          </el-col>
          <el-col :span="2" :xl="4">
            <div class="search-item">
              <el-button type="primary" @click="getTimeRewardList(1)">查 询</el-button>
            </div>
          </el-col>
        </el-row>

        <!-- 列表数据 -->
        <div class="table-box">
          <el-table :data="tableData" style="width: 100%;">
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="typeStr" label="奖励类型" />
            <el-table-column prop="rangeAt" label="有效时段" />
            <el-table-column prop="stateStr" label="状态" />
            <el-table-column prop="createdAt" label="创建时间" />
            <el-table-column prop="creatorName" label="创建人" />
           
            <el-table-column label="操作" width="190">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="timeRewardDetail(scope.row)">
                  详情
                </el-button>
                <el-button
                  v-if="scope.row.state !== TIME_REWARD_STATE.END"
                  type="danger"
                  size="mini"
                  @click="finishReward(scope.row)"
                >
                  结束
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页 -->
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
      <!-- 新增配置 -->
      <add-time-reward-config v-if="isAddConfig" :isAddConfig.sync="isAddConfig" />
      <!-- 配置详情 -->
      <time-award-info :configId="configId" v-if="showTimeAwardInfo" :showTimeAwardInfo.sync="showTimeAwardInfo" />
    </transition>
  </div>
</template>

<script>
import AddTimeRewardConfig from './components/AddTimeRewardConfig'
import TimeAwardInfo from './components/TimeAwardInfo'
import StaffSelect from '@SelectBox/StaffSelect'
import TimeRewardStateSelect from '@SelectBox/TimeRewardStateSelect'
import TimeRewardTypeSelect from '@SelectBox/TimeRewardTypeSelect'

import { TIME_REWARD_STATE } from '@/utils/enumerate.js'
import * as OperationManage from '@/api/operationManage.js'

export default {
  name: 'TimeRewardConfig',
  components: { AddTimeRewardConfig, StaffSelect, TimeRewardStateSelect, TimeRewardTypeSelect, TimeAwardInfo },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      searchInfo: {
        title: '',
        staffId: [],
        rewardType: '',
        stateType: ''
      },
      isAddConfig: false, // 是否添加配置
      showTimeAwardInfo: false, // 配置详情
      tableData: [],
      pager: {
        page: 1,
        pageSize: 10,
        total: 100
      },
      configId: '',
      TIME_REWARD_STATE,
    }
  },
  watch: {
    isAddConfig (value) {
      if (!value) {
        this.getTimeRewardList()
      }
    }
  },
  created () {
    this.getTimeRewardList()
  },
  methods: {
    /**
     * @description 添加时段奖励配置
     */
    addConfig () {
      this.isAddConfig = true
    },
    /**
     * @description 监听页面切换
     */
    handleCurrentChange () {
      this.getTimeRewardList()
    },
    /**
     * @description 结束活动
     */
    async finishReward (cardItem) {
      await this.$confirm('确认结束该奖励活动吗？', '', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      })
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const reqData = { id: cardItem.id }
        await OperationManage.stopTimeIntervalRewardConfig(reqData)
        this.$newMessage.success('设置成功')
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        this.getTimeRewardList()
      }
    },
    /**
     * @description 获取时段奖励配置列表
     */
    async getTimeRewardList (page) {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        this.pager.page = page || this.pager.page
        const reqData = {
          conds: {},
          page: this.pager.page,
          pageSize: this.pager.pageSize
        }
        if (this.searchInfo.staffId.length) {
          reqData.conds.staffIds = this.searchInfo.staffId
        }
        if (this.searchInfo.title) {
          reqData.conds.titleEqual = this.searchInfo.title
        }
        if (this.searchInfo.rewardType) {
          reqData.conds.typeEqual = this.searchInfo.rewardType
        }
        if (this.searchInfo.stateType) {
          reqData.conds.stateEqual = this.searchInfo.stateType
        }
        const data = await OperationManage.getTimeIntervalRewardConfigList(reqData)
        this.tableData = data.list
        this.pager.total = data.total
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 奖励设置详情
     */
    timeRewardDetail (listItem) {
      this.configId = listItem.id
      this.showTimeAwardInfo = true
    }
  }
}
</script>

<style lang="less" scoped>
.table-box {
  margin-top: 0;
}
</style>
