<template>
  <div class="retoucher-goals assessment-report module-panel">
    <el-row class="search-box" :gutter="20">
      <!-- 时间 -->
      <el-col :span="16">
        <div class="date-item">
          <span>选择日期</span>
          <date-picker type="date" v-model="date" @change="handleChangeDate"/>
          <el-button type="primary" class="ml-15"  @click="getData">查 询</el-button>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="search-item set-goals">
          <el-button
            slot="reference"
            type="primary"
            v-show="canShowEditView"
            @click="handleOpenSetView"
          >
            设置修图师基础张数
          </el-button>
        </div>
      </el-col>
    </el-row>

    <el-table :data="tableData" style="width: 100%;" :cell-class-name="handleTableCellClass">
      <el-table-column prop="staff_schedule" label="修图师" width="170px">
        <template slot-scope="{ row }">
          <div class="tag-wrap">
            <div class="mr-10 name">{{ row.staff.nickname || row.staff.name }}</div>
            <div>
              <el-tag
                v-for="(workState, index) in row.tags"
                :key="index"
                :type="workState.type"
                effect="dark"
                size="mini"
                class="mr-10 mt-5"
              >
                {{ workState.name }}
              </el-tag>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="retouchStandardCn" label="修图标准" />
      <el-table-column prop="base_goal_num" label="目标基础值(张)" />
      <el-table-column prop="showExpectFloatNum" label="预计浮动张数" />
      <el-table-column prop="showActualFloatNum" label="实际浮动张数" />
      <el-table-column prop="extend" label="其他张数">
        <template slot-scope="{ row }">
          <p>请假减少：{{ row.extend.leave_decrease_num }} 张</p>
          <p>其他冲抵：{{ row.extend.weight_increase_num }} 张</p>
        </template>
      </el-table-column>
      <el-table-column prop="goal_num" label="目标修图张数(张)" />
      <el-table-column prop="finish_num" label="实际今日已完成(张)" />
      <el-table-column prop="achieveCn" label="是否达标" />
    </el-table>
    <div class="set-info">
      <div><span>今日目标：</span><span>{{ goalStatistical.goal_num || '-' }} 张</span></div>
      <div><span>实际今日已完成：</span><span>{{ goalStatistical.finish_num || '-' }} 张</span></div>
    </div>

    <el-dialog
      width="45%"
      title="修改修图师基础张数"
      center
      custom-class="empty-dialog"
      :visible.sync="showDialog"
    >
      <div class="dialog-content">
        <div class="group-item-wrap">
          <el-row
            class="item"
            v-for="(groupMember, index) in editData"
            :key="index"
            :gutter="10"
          >
            <el-col :span="6">
              <div class="tag-wrap">
                <div class="mr-5 name">{{ groupMember.staff_name }}</div>
                <div>
                  <div class="standard-icon mr-5">
                    <span :class="`iconmap-standard-${groupMember.retouch_standard}`" />
                  </div>
                  <div>
                    <el-tag
                      v-for="(workState, index) in groupMember.tags"
                      :key="index"
                      :type="workState.type"
                      effect="dark"
                      size="mini"
                      class="mr-10 mt-5"
                    >
                      {{ workState.name }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <span class="mr-10">基础张数</span>
              <el-input-number
                class="number-input"
                v-numberOnly
                type="number"
                :min="0"
                :max="9999999"
                @change="handleChangeBaseGoalNum($event, index)"
                v-model.number="groupMember.base_goal_num"
              />
            </el-col>
            <el-col :span="5">
              <span>浮动张数：</span>
              <span>{{ groupMember.float_num }}张</span>
            </el-col>
          </el-row>
        </div>
        <el-divider class="divider"></el-divider>
        <p><span>今日预计完成总量：{{ goalStatistical.goal_num }} 张</span></p>
        <p><span>已分配修图张数：{{ allocationNum }} 张</span></p>
        <p v-if="showTips" style="margin-top: 5px;">
          <span class="el-icon-info"></span>
          如果有小组成员的基础张数为0, 则需要将他的浮动张数摊分给小组的其他成员
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="showDialog = false">取 消</el-button>
        <el-button type="primary" @click="handleConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import { retouchStandardToCN } from '@/utils/enumerate'
import dayjs from 'dayjs'
import * as RetouchLeaderApi from '@/api/retouchLeader.js'

export default {
  name: 'RetouchingGroupGoals',
  components: { DatePicker },
  data () {
    return {
      routeName: this.$route.name,
      retouchStandardToCN,
      showDialog: false,
      date: dayjs().format('YYYY-MM-DD'), // 查询时间
      goalStatistical: {}, //  获取今日目标统计
      tableData: [],
      totalGoals: 0,
      editData: [] // 弹窗编辑的数据
    }
  },
  computed: {
    // 是否可以编辑
    canShowEditView () {
      if (!this.goalStatistical.goal_num){
        return false
      }
      const yesterday = dayjs().subtract(2, 'day').endOf('date') // 昨天凌晨
      return dayjs(this.date).isAfter(yesterday)
    },
    // 已经分陪的修图张数
    allocationNum () {
      return this.editData.reduce((tol, cur) => {
        return tol + (cur.base_goal_num || 0) + (cur.float_num || 0)
      }, 0)
    },
    // 是否展示tio
    showTips () {
      return this.editData.find(item => !item.base_goal_num)
    }
  },
  mounted () {
    this.getData()
  },
  methods: {
    /**
     * 修改了时间之后需要吧之前的清楚， 否则会干扰canShowEditView的判断
     */
    handleChangeDate () {
      this.goalStatistical = {}
    },
    /**
     * @description 获取数据
     */
    async getData () {
      if (!this.date) return this.$message.error('请先选择日期')
      this.$store.dispatch('setting/showLoading', this.routeName)
      try {
        await Promise.all([this.getRetoucherGoalList(), this.getRetoucherStatistical()])
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 获取组员目标
     */
    async getRetoucherGoalList () {
      this.$store.dispatch('setting/showLoading', this.routeName)
      const params = {
        date: this.date
      }
      try {
        const tableData = await RetouchLeaderApi.getRetoucherGoalList(params)
        this.tableData = tableData || []
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 获取今日目标统计
     */
    async getRetoucherStatistical () {
      const params = {
        date: this.date
      }
      const goalStatistical = await RetouchLeaderApi.getRetoucherStatistical(params)
      this.goalStatistical = goalStatistical || {}
    },
    /**
     * @description 打开修图师目标张数的弹窗
     */
    handleOpenSetView () {
      const data = this.tableData.map(item => {
        // 浮动张数取预计浮动和实际浮动中最小的那个
        let float_num = this.getFloatNum()
        // 如果这个人的基础张数为0， 则浮动张数也是0
        float_num = item.base_goal_num === 0 ? 0 : float_num
        return {
          staff_id: item.staff.id,
          staff_name: item.staff.nickname || item.staff.name,
          base_goal_num: item.base_goal_num,
          retouch_standard: item.retouch_standard,
          float_num,
          copy_base_goal_num: item.base_goal_num,
          tags: item.tags
        }
      })
      this.editData = data
      this.showDialog = true
    },
    /**
     * @description 修改组员目标， 如果基础张数是0， 浮动也调成0
     */
    handleChangeBaseGoalNum (num, index) {
      if (num === 0) {
        this.editData[index].float_num = 0
      } else {
        this.editData[index].float_num = this.getFloatNum()
      }
    },
    /**
     * @description 提交
     */
    async handleConfirm () {
      const hasUndefined = this.editData.some(item => {
        return item.base_goal_num === '' || item.base_goal_num === undefined
      })
      if (hasUndefined) return this.$message.error('请填写基础张数')
      // 判断是否可以保存
      if (this.allocationNum < this.goalStatistical.goal_num) {
        return this.$message.error('已分配修图张数小于今日预计完成总量')
      }

      this.$store.dispatch('setting/showLoading', this.routeName)

      const staffGoals = this.editData.map(item => {
        return {
          staffId: item.staff_id,
          baseGoalNum: item.base_goal_num
        }
      })
      const req = {
        date: this.date,
        staffGoals
      }

      try {
        await RetouchLeaderApi.updateRetoucherGoal(req)
        this.showDialog = false
        await this.getData()
        this.$message.success('设置云端今日目标值成功。')
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 预计浮动张数和实际浮动张数最低的一个特殊标注
     */
    handleTableCellClass ({ row, columnIndex }) {
      if (columnIndex !== 3 && columnIndex !== 4) return ''
      // 当前单元格的数据
      const currentCellNum = columnIndex === 3 ? row.expect_float_num : row.actual_float_num
      const contrastCellNum = columnIndex === 3 ? row.actual_float_num : row.expect_float_num
      if (currentCellNum < contrastCellNum && currentCellNum !== 0) return 'color-tag'
      if (currentCellNum !== 0 && contrastCellNum === 0) return 'color-tag'
      return ''
    },
    /**
     * @description 获取实际浮动张数, 从预计和实际中取最小的那个
     */
    getFloatNum () {
      if (!this.goalStatistical.expect_float_num && !this.goalStatistical.actual_float_num) return 0
      const expect_float_num = this.goalStatistical.expect_float_num || Number.MAX_VALUE
      const actual_float_num = this.goalStatistical.actual_float_num || Number.MAX_VALUE
      return Math.min(Number(expect_float_num), Number(actual_float_num))
    }
  }
}
</script>

<style lang="less" scoped>
.retoucher-goals {
  border-top-left-radius: 0;

  .date-item {
    display: flex;
    align-items: center;
    margin-right: 0;
    margin-bottom: 20px;

    > span {
      flex-shrink: 0;
      margin-right: 12px;
      font-size: 14px;
      color: #303133;
    }
  }

  .set-goals {
    justify-content: flex-end;
  }

  .set-info {
    display: flex;
    align-items: center;
    margin-top: 15px;
    font-size: 14px;

    & > div {
      margin-right: 15px;
    }
  }

  .module-table-box {
    & /deep/ .el-table__body-wrapper {
      max-height: calc(100vh - 396px);
      overflow-y: auto;
    }
  }
}

.group-item-wrap {
  max-height: 400px;
  overflow-x: hidden;
  overflow-y: auto;

  .item {
    display: flex;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #ecedee;

    &:last-child {
      border: none;
    }

    .number-input {
      width: calc(100% - 100px);
    }
  }
}

.tag-wrap {
  display: flex;
  align-items: center;

  .name {
    flex-shrink: 0;
    min-width: 50px;
    margin-left: 5px;
  }
}

// 引导的问号
.driver-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-bottom: 4px;
  margin-left: 4px;
  font-size: 12px;
  line-height: 16px;
  color: #edf0ff;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  background-color: #c0c4cc;
  border-radius: 50%;
}

.divider {
  margin-top: 16px;
  margin-bottom: 16px;
}

.ml-10 {
  margin-left: 5px;
}

.ml-15 {
  margin-left: 15px;
}

.mr-5 {
  margin-right: 5px;
}

.mt-5 {
  margin-top: 5px;
}

.mr-10 {
  margin-right: 10px;
}
</style>

<style>
.color-tag {
  color: #ff3974;
}
</style>
