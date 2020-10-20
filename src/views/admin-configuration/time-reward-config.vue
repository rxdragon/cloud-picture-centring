<template>
  <div class="gold-config page-class">
    <transition name="fade" mode="out-in">
      <div v-if="!isAddConfig" class="gold-list">
        <div class="header">
          <h3>修图师时段奖励配置</h3>
          <el-button type="primary" @click="addConfig">添加新配置</el-button>
        </div>
        <!-- search -->
        <div class="search-box">
          <div class="search-item">
            <span>伙伴</span>
            <staff-select v-model="searchInfo.staffId" />
          </div>
          <div class="search-item">
            <span>标题</span>
            <el-input
              @keyup.native.enter="getGoldConfigList(1)"
              v-model="searchInfo.title"
              clearable
              placeholder="请输入标题"
            />
          </div>
          <div class="search-item">
            <span>奖励类型</span>
            <time-reward-type-select v-model="searchInfo.rewardType" />
          </div>
          <div class="search-item">
            <span>状态</span>
            <time-reward-state-select v-model="searchInfo.stateType" />
          </div>
          <div class="search-button">
            <el-button type="primary" @click="getGoldConfigList(1)">查 询</el-button>
          </div>
        </div>
        <!-- 列表数据 -->
        <div class="table-box">
          <el-table :data="tableData" style="width: 100%;">
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="rewardType" label="奖励类型" />
            <el-table-column prop="timeRange" label="有效时段" />
            <el-table-column prop="stateStr" label="状态" />
            <el-table-column prop="timeStr" label="创建时间" />
            <el-table-column prop="createStaff" label="创建人" />
           
            <el-table-column label="操作" width="190">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="deleteData(scope.row)">
                  详情
                </el-button>
                <el-button
                  v-if="!scope.row.isFinish"
                  type="danger"
                  size="mini"
                  @click="deleteData(scope.row)"
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
      <add-time-reward-config v-else :is-add-config.sync="isAddConfig" />
    </transition>
  </div>
</template>

<script>
import AddTimeRewardConfig from './components/AddTimeRewardConfig'
import StaffSelect from '@SelectBox/StaffSelect'
import TimeRewardStateSelect from '@SelectBox/TimeRewardStateSelect'
import TimeRewardTypeSelect from '@SelectBox/TimeRewardTypeSelect'

import { CardEnum, TIME_REWARD_STATE } from '@/utils/enumerate.js'
import * as OperationManage from '@/api/operationManage.js'

export default {
  name: 'TimeRewardConfig',
  components: { AddTimeRewardConfig, StaffSelect, TimeRewardStateSelect, TimeRewardTypeSelect },
  filters: {
    changeStateName (value) {
      return CardEnum[value]
    }
  },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      stateType: 0, // 卡片状态
      searchInfo: {
        title: '',
        staffId: [],
        rewardType: 0,
        stateType: 0
      },
      isAddConfig: true, // 是够添加配置
      tableData: [],
      pager: {
        page: 1,
        pageSize: 10,
        total: 100
      },

      TIME_REWARD_STATE,
    }
  },
  watch: {
    isAddConfig (value) {
      if (!value) {
        this.getGoldConfigList()
      }
    }
  },
  created () {
    this.getGoldConfigList()
  },
  methods: {
    /**
     * @description 添加经验配置
     */
    addConfig () {
      this.isAddConfig = true
    },
    /**
     * @description 监听页面切换
     */
    handleCurrentChange () {
      this.getGoldConfigList()
    },
    /**
     * @description 删除金币配置
     */
    async deleteData (cardItem) {
      this.$confirm('确认删除该金币奖励吗？', '', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        try {
          this.$store.dispatch('setting/showLoading', this.routeName)
          const reqData = { staffCardId: cardItem.id }
          await OperationManage.deleteCard(reqData)
          this.$newMessage.success('删除成功')
          this.getGoldConfigList()
          this.$store.dispatch('setting/hiddenLoading', this.routeName)
        } catch (error) {
          this.$store.dispatch('setting/hiddenLoading', this.routeName)
          console.error(error)
        }
      }).catch()
    },
    /**
     * @description 提前结束
     */
    async closeCard (cardItem) {
      this.$confirm('确认提前结束吗？', '', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        try {
          this.$store.dispatch('setting/showLoading', this.routeName)
          const reqData = { staffCardId: cardItem.id }
          await OperationManage.closeCard(reqData)
          this.$newMessage.success('提前结束')
          this.getGoldConfigList()
          this.$store.dispatch('setting/hiddenLoading', this.routeName)
        } catch (error) {
          this.$store.dispatch('setting/hiddenLoading', this.routeName)
          console.error(error)
        }
      }).catch()
    },
    /**
     * @description 获取金币配置列表
     */
    async getGoldConfigList (page) {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        this.pager.page = page || this.pager.page
        const reqData = {
          type: 'gold_reward',
          page: this.pager.page,
          pageSize: this.pager.pageSize
        }
        if (this.searchInfo.staffId.length) {
          reqData.staffIds = this.searchInfo.staffId
        }
        if (this.stateType) {
          reqData.state = this.stateType
        }
        const data = await OperationManage.getTimeRewardList(reqData)
        this.tableData = data.list
        this.pager.total = data.total
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    }
  }
}
</script>
<style lang="less" scoped>
.search-item > span {
  flex-shrink: 0;
}
</style>
