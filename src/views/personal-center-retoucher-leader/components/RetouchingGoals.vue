<template>
  <div
    class="retoucher-goals assessment-report module-panel"
    v-loading="loading"
  >
    <el-row class="search-box" :gutter="20">
      <!-- 时间 -->
      <el-col :span="8">
        <div class="search-item">
          <span>选择日期</span>
          <date-picker type="date" v-model="date" />
        </div>
      </el-col>
      <!-- 修图组 -->
      <el-col :span="8">
        <div class="staff-search search-item">
          <el-button type="primary" @click="queryData">查 询</el-button>
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

    <div class="module-table-box">
      <el-table :data="tableData" style="width: 100%;">
        <el-table-column prop="staff" label="修图师">
          <template slot-scope="{ row }">
            <p>
              <span class="mr-10">{{ row.staff.nickname }}</span>
              <!-- todo:naxi 加班请假标示-->
              <el-tag
                v-if="row.duty_state.includes('加班')"
                type="warning"
                effect="dark"
                size="mini"
              >
                加班
              </el-tag>
              <el-tag
                v-if="row.duty_state.includes('请假')"
                type="danger"
                effect="dark"
                size="mini"
              >
                请假
              </el-tag>
              <el-tag
                v-if="row.is_new_staff === 1"
                type="success"
                effect="dark"
                size="mini"
              >
                新人
              </el-tag>
            </p>
          </template>
        </el-table-column>
        <el-table-column prop="retouch_standard" label="修图标准" />
        <el-table-column prop="base_goal_num" label="目标基础值(张)" />
        <el-table-column prop="expect_float_num" label="预计浮动值(张)" />
        <el-table-column prop="actual_float_num" label="实际浮动值(张)" />
        <el-table-column prop="extend" label="其他张数">
          <template slot-scope="{ row }">
            <p>请假减少：{{ row.extend.leave_decrease_num }} 张</p>
            <p>其他冲抵：{{ row.extend.weight_increase_num }} 张</p>
          </template>
        </el-table-column>
        <el-table-column prop="goal_num" label="目标修图张数(张)" />
        <el-table-column prop="finish_num" label="实际今日已完成(张)" />
        <el-table-column prop="groupLeaderJobNumber" label="是否达标">
          <template slot-scope="{ row }">
            <p>{{ row.achieve === 1 ? '是' : '否' }}</p>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="set-info">
      <div><span>今日目标：</span><span>{{ goalStatistical.enable_float_staff_num || '-' }} 张</span></div>
      <div><span>实际今日已完成：</span><span>{{ goalStatistical.finish_num || '-' }} 张</span></div>
    </div>

    <el-dialog
      width="40%"
      title="修改修图师基础张数"
      center
      custom-class="empty-dialog"
      :visible.sync="showDialog"
    >
      <div class="dialog-content">
        <div class="group-item-wrap">
          <el-row
            class="item"
            v-for="(item, index) in editData"
            :key="index"
            :gutter="10"
          >
            <el-col :span="5">
              <span class="mr-5">{{ item.staff_name }}</span>
              <el-tag
                v-if="item.duty_state.includes('加班')"
                type="warning"
                effect="dark"
                size="mini"
              >
                加班
              </el-tag>
              <el-tag
                v-if="item.duty_state.includes('请假')"
                type="danger"
                effect="dark"
                size="mini"
              >
                请假
              </el-tag>
              <el-tag
                v-if="item.is_new_staff === 1"
                type="success"
                effect="dark"
                size="mini"
              >
                新人
              </el-tag>
              <span class="standard-icon">
                <span :class="`iconmap-standard-${item.retouch_standard}`" />
              </span>
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
                v-model.number="item.base_goal_num"
              />
            </el-col>
            <el-col :span="5">
              <span>浮动张数：</span>
              <span>{{ item.float_num }}张</span>
            </el-col>
          </el-row>
        </div>
        <el-divider class="divider"></el-divider>
        <p><span>今日预计完成总量：{{ goalStatistical.enable_float_staff_num }} 张</span></p>
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
import dayjs from 'dayjs'
import * as RetouchLeaderApi from '@/api/retouchLeader.js'

export default {
  name: 'RetouchingGroupGoals',
  components: { DatePicker },
  data () {
    return {
      loading: true,
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
      if (!this.goalStatistical.enable_float_staff_num){
        return false
      }
      const yesterday = dayjs().subtract(1, 'day').startOf('date') // 昨天凌晨
      if (dayjs(this.date).isBefore(yesterday)) {
        return false
      }
      return true
    },
    // 已经分陪的修图张数
    allocationNum () {
      return this.editData.reduce((tol, cur) => {
        return tol + (cur.base_goal_num || 0)
      }, 0)
    },
    // 是否展示tio
    showTips () {
      return this.editData.find(item => !item.base_goal_num)
    }
  },
  mounted () {
    this.queryData()
  },
  methods: {
    async queryData () {
      if (!this.date) this.$message.error('请先选择时间')
      this.loading = true
      await Promise.all([this.getRetoucherGoalList(), this.getRetoucherStatistical()])
        .finally(() => {
          this.loading = false
        })
    },
    /**
     * @description 获取组员目标
     */
    async getRetoucherGoalList () {
      this.loading = true
      const params = {
        date: this.date
      }
      const tableData = await RetouchLeaderApi.getRetoucherGoalList(params)
        .finally(() => {
          this.loading = false
        })
      this.tableData = tableData || []
    },
    /**
     * @description 获取今日目标统计
     */
    async getRetoucherStatistical () {
      const params = {
        date: this.date
      }
      const goalStatistical = await RetouchLeaderApi.getRetoucherStatistical(params)
      this.goalStatistical = goalStatistical
    },
    /**
     * @description 打开修图师目标张数的弹窗
     */
    handleOpenSetView () {
      const data = this.tableData.map(item => {
        // 浮动涨势取预计浮动和实际浮动中最小的那个
        const float_num = Math.min(Number(item.expect_float_num), Number(item.actual_float_num || Number.MAX_VALUE))
        return {
          staff_id: item.staff.id,
          staff_name: item.staff.nickname,
          base_goal_num: item.base_goal_num,
          retouch_standard: item.retouch_standard,
          float_num,
          copy_float_num: float_num,
          copy_base_goal_num: item.base_goal_num,
          is_new_staff: item.is_new_staff,
          duty_state: item.duty_state,
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
        this.editData[index].float_num = this.editData[index].copy_float_num
      }
    },
    async handleConfirm () {
      this.loading = true
      const hasUndefined = this.editData.some(item => {
        return item.base_goal_num === '' || item.base_goal_num === undefined
      })
      if (hasUndefined) return this.$message.error('请填写基础张数')
      // 判断是否可以保存
      const needAllocationNum = this.editData.reduce((tol, cur) => {
        return tol +(cur.base_goal_num ? cur.copy_base_goal_num : cur.copy_float_num)
      }, 0)
      if (this.allocationNum < needAllocationNum) return this.$message.error('已分配修图张数若小于今日预计完成总量')
      try {
        await RetouchLeaderApi.updateRetoucherGoal(this.editData)
        await this.queryData()
        this.showDialog = false
        this.$message.success('设置云端今日目标完成值成功。')
        this.loading = false
      } catch (err) {
        this.loading = false
      }

    }
  }
}
</script>

<style lang="less" scoped>
.retoucher-goals {
  border-top-left-radius: 0;

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
    padding: 15px 0;
    border-bottom: 1px solid #ecedee;

    .number-input {
      width: calc(100% - 100px);
    }
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

.mr-5 {
  margin-right: 5px;
}

.mr-10 {
  margin-right: 10px;
}
</style>
