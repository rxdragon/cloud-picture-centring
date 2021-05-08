<template>
  <div class="retoucher-group-goals" v-loading="loading">
    <el-row class="search-box" :gutter="20">
      <!-- 时间 -->
      <el-col :span="16">
        <div class="date-item">
          <span>选择日期</span>
          <date-picker type="date" v-model="date" />
          <el-button type="primary" class="ml-15" @click="getData">查 询</el-button>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="search-item set-goals">
          <el-button
            slot="reference"
            type="primary"
            @click="handleSetGoalNum"
            v-if="canShowEditView"
          >
            设置每日目标完成总量
          </el-button>
        </div>
      </el-col>
    </el-row>

    <div class="set-info">
      <div><span>今日设定值：</span><span>{{ retoucherStatistics.goal_num }} 张</span></div>
      <div><span>今日基础总张数：</span><span>{{ retoucherStatistics.base_goal_num }} 张</span></div>
      <div><span>实际已完成：</span><span>{{ retoucherStatistics.finish_num }} 张</span></div>
      <div><span>摄影上传总张数：</span><span>{{ retoucherStatistics.photography_org_upload_num }} 张</span></div>
    </div>

    <el-table :data="tableData" style="width: 100%;" :cell-class-name="handleTableCellClass">
      <el-table-column prop="groupName" label="修图组">
        <template slot-scope="{ row }">
          <p>组名：{{ row.groupName || '-'  }}</p>
          <p>主管：{{ row.leaderName ? `${row.leaderName} (${row.leaderId})` : '-' }}</p>
        </template>
      </el-table-column>
      <el-table-column prop="on_duty_staff_num" label="上班人数" width="80px"/>
      <el-table-column prop="base_goal_num" label="基础修图总张数" />
      <el-table-column prop="enable_float_staff_num" label="加浮动人数" />
      <el-table-column prop="expect_float_num" label="预计浮动张数" />
      <el-table-column prop="actual_float_num" label="实际浮动张数" />
      <el-table-column prop="extend" label="其他张数">
        <template slot-scope="{ row }">
          <p>请假减少：{{ row.extend.leave_decrease_num }} 张</p>
          <p>其他冲抵：{{ row.extend.weight_increase_num }} 张</p>
        </template>
      </el-table-column>
      <el-table-column prop="goal_num" label="目标修图张数" />
      <el-table-column prop="finish_num" label="实际今日已完成" />
      <el-table-column prop="achieve" label="是否达标">
        <template slot-scope="{ row }">
          <p>{{ row.achieve === 1 ? '是' : '否' }}</p>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80px">
        <template slot-scope="{ row }">
          <el-button @click="handleEditGroup(row)" :disabled="canEditRow">修改</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      width="35%"
      :title="dialogMode === 'edit' ? '修改小组每日完成基础目标' : '设置每日目标完成总量'"
      center
      custom-class="empty-dialog"
      :visible.sync="showDialog"
    >
      <div>
        <span class="empty-title">预计完成总张数:</span>
        <el-input-number
          v-numberOnly
          type="number"
          style="width: 180px; margin-left: 20px;"
          class="ml-10"
          :min="0"
          :max="9999999"
          v-model="editGoals"
        ></el-input-number>
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
import * as PerformanceApi from '@/api/performance.js'
import dayjs from 'dayjs'

export default {
  name: 'RetouchingGroupGoals',
  components: { DatePicker },
  data () {
    return {
      loading: false,
      showDialog: false,
      dialogMode: 'create', // create or edit
      date: dayjs().format('YYYY-MM-DD'), // 查询时间
      tableData: [],
      retoucherStatistics: {},
      editGoals: 0, // 当前编辑的num
      editGroupId: null
    }
  },
  computed: {
    // 是否可以编辑
    canShowEditView () {
      // 每天7点 之前可以编辑当日的, 8点之前没有考勤数据， 所以取中间
      const endTag = dayjs().hour(17).startOf('hour')
      const startTag = dayjs().hour(8).startOf('hour')
      if (dayjs().isAfter(endTag) || dayjs().isBefore(startTag)) {
        return false
      }
      if (dayjs(this.date).format('YYYY-MM-dd') !== dayjs().format('YYYY-MM-dd')) {
        return false
      }
      return true
    },
    // 是否可以编辑修图组基础张数， 次日可以修改前日
    canEditRow () {
      const yesterday = dayjs().subtract(1, 'day').startOf('date') // 昨天凌晨
      if (dayjs(this.date).isBefore(yesterday)) {
        return true
      }
      return false
    },
  },
  mounted () {
    this.getData()
  },
  methods: {
    /**
     * @description 获取页面数据
     */
    async getData () {
      this.loading = true
      await Promise.all([
        this.getRetoucherGoalList(),
        this.getRetoucherGoalStatistics()
      ]).finally(() => {
        this.loading = false
      })
    },
    /**
     * @description 获取云端总体张数相关统计
     */
    async getRetoucherGoalStatistics () {
      const req = { date: this.date }
      const data = await PerformanceApi.getRetoucherGoalStatistics(req)
      this.retoucherStatistics = data || {}
    },
    /**
     * @description 获取列表
     */
    async getRetoucherGoalList () {
      this.loading = true
      const params = {
        date: this.date
      }
      const tableData = await PerformanceApi.getRetoucherGoalList(params)
        .finally(() => {
          this.loading = false
        })
      this.tableData = tableData || []
    },
    /**
     * @description 设置目标
     */
    async handleConfirm () {
      try {
        const req = {
          date: this.date,
          num: this.editGoals
        }
        if (this.dialogMode === 'edit') {
          req.groupId = this.editGroupId
        }
        const action = this.dialogMode === 'create'
          ? PerformanceApi.setOverallPhotoNumGoal // 总体
          : PerformanceApi.setGroupPhotoNumGoal // 小组
        const successMessage = this.dialogMode === 'create'
          ? '设置云端今日目标完成值成功' // 总体
          : '修改修图组每日基础目标值成功' // 小组
        this.loading = true
        const res = await action(req)
        if (!res) throw new Error('设置修图目标失败')
        this.showDialog = false
        await this.getData()
        this.$message.success(successMessage)
      } finally {
        this.loading = false
      }
    },
    /**
     * @description 云端小组每日目标张数设定, 修改小组的基础张数
     */
    handleEditGroup (row) {
      this.editGoals = row.base_goal_num
      this.dialogMode = 'edit'
      this.editGroupId = row.group_info.id // todo
      this.showDialog = true
    },
    /**
     * @description 云端小组每日目标张数设定, 修改小组的基础张数
     */
    handleSetGoalNum () {
      this.editGoals = this.retoucherStatistics.base_goal_num || 0
      this.dialogMode = 'create'
      this.showDialog = true
    },
    /**
     * @description 预计浮动张数和实际浮动张数最低的一个特殊标注
     */
    handleTableCellClass ({ row, columnIndex }) {
      if (columnIndex !== 4 && columnIndex !== 5) return ''
      // 当前单元格的数据
      const currentCellNum = columnIndex === 4 ? row.expect_float_num : row.actual_float_num
      const contrastCellNum = columnIndex === 4 ? row.actual_float_num : row.expect_float_num
      if (currentCellNum < contrastCellNum) return 'color-tag'
      return ''
    }
  }
}
</script>

<style lang="less" scoped>
.retoucher-group-goals {
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

  .ml-15 {
    margin-left: 15px;
  }

  .set-goals {
    justify-content: flex-end;
  }

  .set-info {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    font-size: 14px;

    & > div {
      margin-right: 20px;
    }
  }

  .module-table-box {
    & /deep/ .el-table__body-wrapper {
      max-height: calc(100vh - 396px);
      overflow-y: auto;
    }
  }
}

.red {
  color: red;
}
</style>

<style>
.color-tag {
  color: #ff3974;
}
</style>
