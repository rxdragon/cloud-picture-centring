<template>
  <div class="gold-config">
    <transition name="fade" mode="out-in">
      <div v-if="!isAddConfig" class="gold-list">
        <div class="header">
          <h3>修图师金币奖励配置</h3>
          <el-button type="primary" @click="addConfig">添加新配置</el-button>
        </div>
        <!-- 搜索盒子 -->
        <div class="search-box">
          <div class="staff-box search-item">
            <span>伙伴</span>
            <staff-select v-model="staffId" />
          </div>
          <div class="state-box search-item">
            <span>使用状态</span>
            <state-select v-model="stateType" />
          </div>
          <div class="search-button">
            <el-button type="primary" @click="getGoldConfigList(1)">查 询</el-button>
          </div>
        </div>
        <!-- 列表数据 -->
        <div class="table-box">
          <el-table :data="tableData" style="width: 100%;">
            <el-table-column prop="staffName" label="伙伴姓名" />
            <el-table-column prop="groupName" label="修图小组" />
            <el-table-column prop="multiple" label="金币卡" />
            <el-table-column label="使用状态">
              <template slot-scope="scope">{{ scope.row.state | changeStateName }}</template>
            </el-table-column>
            <el-table-column label="创建时间">
              <template slot-scope="scope">
                {{ scope.row.createTime | toTimeSpan }}
              </template>
            </el-table-column>
            <el-table-column prop="createStaff" label="创建人" />
            <el-table-column label="操作" width="190">
              <template slot-scope="scope">
                <el-button v-if="scope.row.state === 'using'" type="primary" size="mini" @click="closeCard(scope.row)">提前结束</el-button>
                <el-button v-if="scope.row.state === 'unused'" type="danger" size="mini" @click="deleteData(scope.row)">删除</el-button>
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
      <add-gold-config v-else :is-add-config.sync="isAddConfig" />
    </transition>
  </div>
</template>

<script>
import AddGoldConfig from './components/AddGoldConfig'
import StaffSelect from '@SelectBox/StaffSelect'
import StateSelect from '@SelectBox/StateSelect'

import { CardEnum } from '@/utils/enumerate.js'
import * as OperationManage from '@/api/operationManage.js'

export default {
  name: 'GoldConfig',
  components: { AddGoldConfig, StaffSelect, StateSelect },
  filters: {
    changeStateName (value) {
      return CardEnum[value]
    }
  },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      stateType: 0, // 卡片状态
      staffId: [], // 伙伴id
      isAddConfig: false, // 是够添加配置
      tableData: [],
      pager: {
        page: 1,
        pageSize: 10,
        total: 100
      }
    }
  },
  watch: {
    isAddConfig (value) {
      if (!value) { this.getGoldConfigList() }
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
      }).catch(() => {})
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
      }).catch(() => {})
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
        if (this.staffId.length) { reqData.staffIds = this.staffId }
        if (this.stateType) { reqData.state = this.stateType }
        const data = await OperationManage.getStaffCardList(reqData)
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
