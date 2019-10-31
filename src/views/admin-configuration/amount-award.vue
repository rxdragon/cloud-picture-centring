<template>
  <div class="amount-award">
    <transition name="fade-transform" mode="out-in">
      <div v-if="!isAddConfig && !showAmountInfo">
        <div class="header">
          <h3>修图师冲量奖励配置</h3>
          <el-button type="primary" @click="addConfig">添加新配置</el-button>
        </div>
        <!-- 搜索框 -->
        <div class="search-box">
          <div class="staff-box search-item">
            <span>伙伴</span>
            <staff-select v-model="staffId" @change="onSearchChange" />
          </div>
          <div class="staff-box search-item">
            <span>机构</span>
            <institution-select v-model="institutionId" @change="onSearchChange" />
          </div>
          <div class="state-box search-item">
            <span>使用状态</span>
            <state-select v-model="stateType" @change="onSearchChange" />
          </div>
          <div class="search-button">
            <el-button type="primary" @click="getImpulseList">查 询</el-button>
          </div>
        </div>
        <!-- 表格框 -->
        <div class="table-box">
          <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="title" label="冲量标题" />
            <el-table-column prop="award" label="冲量奖励">
              <template slot-scope="scope">
                <el-popover
                  placement="bottom-start"
                  trigger="hover"
                >
                  <p v-for="(awardItem, awardIndex) in scope.row.impulse_setting_item" :key="awardIndex">
                    奖励{{ awardIndex + 1 }}：当日海草值达到{{ awardItem.reach_exp }} 额外奖励¥{{ awardItem.reward }}
                  </p>
                  <el-button slot="reference" type="text">详情</el-button>
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column label="有效时间" width="200">
              <template slot-scope="scope">
                <p>开始：{{ scope.row.start_at }}</p>
                <p>结束：{{ scope.row.end_at }}</p>
              </template>
            </el-table-column>
            <el-table-column prop="state" label="使用状态">
              <template slot-scope="scope">{{ scope.row.state | changeStateName }}</template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" width="180" />
            <el-table-column prop="createName" label="创建人" />
            <el-table-column label="操作" width="200">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="getAmountDetail(scope.row)">详 情</el-button>
                <el-button v-if="scope.row.state === 'using'" type="primary" size="mini" @click="disableImpulse(scope.row)">提前结束</el-button>
                <el-button v-if="scope.row.state === 'unused'" type="danger" size="mini" @click="deleteImpulse(scope.row)">删除</el-button>
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
      <!-- 新增冲量奖励 -->
      <add-amount-award v-if="isAddConfig" :is-add-config.sync="isAddConfig" />
      <!-- 查看冲量奖励 -->
      <amount-award-info v-if="showAmountInfo" :edit-id="editId" :show-amount-info.sync="showAmountInfo" />
    </transition>
  </div>
</template>

<script>
import AddAmountAward from './components/AddAmountAward'
import AmountAwardInfo from './components/AmountAwardInfo'
import StaffSelect from '@SelectBox/StaffSelect'
import InstitutionSelect from '@SelectBox/InstitutionSelect'
import StateSelect from '@SelectBox/StateSelect'

import { CardEnum } from '@/utils/enumerate.js'
import * as OperationManage from '@/api/operationManage.js'
export default {
  name: 'AmountAward',
  components: { AddAmountAward, AmountAwardInfo, StaffSelect, InstitutionSelect, StateSelect },
  filters: {
    changeStateName (value) {
      return CardEnum[value]
    }
  },
  props: {},
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      isAddConfig: false, // 是否展示添加页面详情
      showAmountInfo: false, // 展示配置详情
      firstSearch: true, // 是否第一次搜索
      staffId: [], // 选中伙伴
      institutionId: '', // 机构id
      stateType: 0, // 状态信息
      editId: '',
      tableData: [],
      pager: {
        page: 1,
        pageSize: 10,
        total: 10
      }
    }
  },
  watch: {
    isAddConfig: {
      handler: function (value) {
        if (!value) { this.getImpulseList() }
      }
    },
    showAmountInfo: {
      handler: function (value) {
        if (!value) { this.editId = '' }
      }
    }
  },
  created () {
    this.getImpulseList()
  },
  methods: {
    /**
     * @description 添加冲量奖
     */
    addConfig () {
      this.isAddConfig = true
    },
    /**
     * @description 监听页面变化
     */
    handleCurrentChange () {
      this.getImpulseList()
    },
    /**
     * @description 监听搜索条件变更
     */
    onSearchChange () {
      this.firstSearch = false
    },
    /**
     * @description 获取冲量奖详情
     */
    getAmountDetail (listItem) {
      this.editId = listItem.id
      this.showAmountInfo = true
    },
    /**
     * @description 获取冲量奖励列表
     */
    async getImpulseList () {
      try {
        this.pager.page = this.firstSearch ? 1 : this.pager.page
        const reqData = {
          page: this.pager.page,
          pageSize: this.pager.pageSize
        }
        if (this.staffId.length) { reqData.staffIds = this.staffId }
        if (this.institutionId) { reqData.retoucherOrgIds = [this.institutionId] }
        if (this.stateType) { reqData.state = this.stateType }

        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await OperationManage.getImpulseList(reqData)
        this.tableData = data.list
        this.pager.total = data.total
        this.firstSearch = false
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    },
    /**
     * @description 删除冲量奖励
     */
    deleteImpulse (listItem) {
      const reqData = { impulseId: listItem.id }
      this.$store.dispatch('setting/showLoading', this.routeName)
      OperationManage.deleteImpulse(reqData)
        .then(() => {
          this.$newMessage.success('删除' + listItem.title + '成功')
          this.getImpulseList()
        })
    },
    /**
     * @description 提前结束
     */
    disableImpulse (listItem) {
      const reqData = { impulseId: listItem.id }
      this.$store.dispatch('setting/showLoading', this.routeName)
      OperationManage.disableImpulse(reqData)
        .then(() => {
          this.$newMessage({
            message: listItem.title + '已提前结束',
            type: 'success',
            duration: 1500,
            onClose: () => {
              this.getImpulseList()
            }
          })
        })
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";
.amount-award {
  .button-box {
    text-align: right;
  }
}
</style>
