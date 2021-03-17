<template>
  <div class="experience-config page-class">
    <transition name="fade" mode="out-in">
      <div v-if="!isAddConfig" class="data-list">
        <div class="header">
          <h3>修图师翻倍经验配置</h3>
          <el-button type="primary" @click="addConfig">添加新配置</el-button>
        </div>
        <!-- 含有数据 -->
        <div class="has-data">
          <!-- 搜索盒子 -->
          <el-row class="search-box" :gutter="20">
            <el-col :span="6" :xl="4">
              <div class="staff-box search-item">
                <span>伙伴</span>
                <staff-select v-model="staffId" />
              </div>
            </el-col>
            <el-col :span="6" :xl="4">
              <div class="state-box search-item">
                <span>使用状态</span>
                <state-select v-model="stateType" />
              </div>
            </el-col>
            <el-col :span="6" :xl="4">
              <div class="search-item">
                <el-button type="primary" @click="getExperienceConfigList(1)">查 询</el-button>
              </div>
            </el-col>
          </el-row>
          <!-- 列表数据 -->
          <div class="table-box">
            <el-table :data="tableData" style="width: 100%;">
              <el-table-column prop="staffName" label="伙伴姓名" />
              <el-table-column prop="groupName" label="修图小组" />
              <el-table-column prop="multiple" label="经验倍数" />
              <el-table-column label="使用状态">
                <template slot-scope="scope">{{ scope.row.state | changeStateName }}</template>
              </el-table-column>
              <el-table-column label="创建时间" width="190">
                <template slot-scope="scope">
                  {{ scope.row.createTime | toTimeSpan }}
                </template>
              </el-table-column>
              <el-table-column prop="createStaff" label="创建人" />
              <el-table-column label="操作" width="190">
                <template slot-scope="scope">
                  <el-button
                    v-if="scope.row.state === 'using'"
                    type="primary"
                    size="mini"
                    @click="closeCard(scope.row)"
                  >
                    提前结束
                  </el-button>
                  <el-button
                    v-if="scope.row.state === 'unused'"
                    type="danger"
                    size="mini"
                    @click="deleteData(scope.row)"
                  >
                    删除
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
      </div>
      <!-- 新增配置 -->
      <edit-experience-config v-if="isAddConfig" :is-add-config.sync="isAddConfig" />
    </transition>
  </div>
</template>

<script>
import EditExperienceConfig from './components/EditExperienceConfig'
import StaffSelect from '@SelectBox/StaffSelect'
import StateSelect from '@SelectBox/StateSelect'

import { CardEnum } from '@/utils/enumerate.js'
import * as OperationManage from '@/api/operationManage.js'

export default {
  name: 'ExperienceConfig',
  components: { EditExperienceConfig, StaffSelect, StateSelect },
  filters: {
    changeStateName (value) {
      return CardEnum[value]
    }
  },
  props: {},
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      stateType: 0, // 卡片状态
      staffId: [], // 选中伙伴id
      isAddConfig: false, // 是够添加配置
      tableData: [], // 列表数据
      pager: {
        page: 1,
        pageSize: 10,
        total: 0
      }
    }
  },
  watch: {
    isAddConfig (value) {
      if (!value) {
        this.getExperienceConfigList()
      }
    }
  },
  created () {
    this.getExperienceConfigList()
  },
  methods: {
    /**
     * @description 监听页面切换
     */
    handleCurrentChange () {
      this.getExperienceConfigList()
    },
    /**
     * @description 添加经验配置
     */
    addConfig () {
      this.isAddConfig = true
    },
    /**
     * @description 删除经验配置
     */
    deleteData (cardItem) {
      this.$confirm('确认删除该经验配置吗？', '', {
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
          this.getExperienceConfigList()
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
          this.getExperienceConfigList()
          this.$store.dispatch('setting/hiddenLoading', this.routeName)
        } catch (error) {
          this.$store.dispatch('setting/hiddenLoading', this.routeName)
          console.error(error)
        }
      }).catch()
    },
    /**
     * @description 获取经验配置列表
     */
    async getExperienceConfigList (page) {
      this.pager.page = page || this.pager.page
      const reqData = {
        type: 'exp',
        page: this.pager.page,
        pageSize: this.pager.pageSize
      }
      if (this.staffId.length) {
        reqData.staffIds = this.staffId
      }
      if (this.stateType) {
        reqData.state = this.stateType
      }
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
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

<style lang="less">

.experience-config {
  .no-data {
    padding: 40px 0;
    margin-top: 20px;
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    box-shadow: @boxShadow;
  }

  .table-box {
    margin-top: 0;
  }
}
</style>
