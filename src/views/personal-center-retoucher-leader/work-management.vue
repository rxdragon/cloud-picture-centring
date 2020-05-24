<template>
  <div class="work-management">
    <div class="header">
      <h3>组员工作管理</h3>
    </div>
    <!-- 今日指标 -->
    <div class="module-panel today-info">
      <div class="panel-title">今日指标</div>
      <div class="panel-main">
        <el-progress
          :percentage="todayData.todayFinishPhotoNumProgress"
          :stroke-width="12"
          :width="180"
          type="circle"
        />
        <div class="progress-num">
          <span class="num">{{ todayData.todayFinishPhotoNumProgress || 0 }}%</span>
          <span>完成率</span>
        </div>
      </div>
      <div class="panel-footer">
        <div class="footer-left">目标张数：{{ todayData.todayExpectFinishPhotoNum || '暂无数据' }}</div>
        <div class="footer-right">已完成：{{ todayData.todayFinishedPhotoNum || '暂无数据' }}</div>
      </div>
    </div>
    <!-- 组员数据 -->
    <div class="table-box">
      <el-table :data="tableData" style="width: 100%;">
        <el-table-column prop="name" label="组员" />
        <el-table-column prop="retoucherClass" label="修图身份" />
        <el-table-column prop="entryMonths" label="入职时长（月）" />
        <el-table-column prop="todayExceptPhotoNum" label="预计完成（张）" />
        <el-table-column prop="todayFinishedPhotoNum" label="实际完成（张）" />
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="adjustWorkload(scope.row)">调整工作量</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 弹出框 -->
    <el-dialog
      title="调整工作量"
      width="30%"
      :before-close="beforClose"
      :visible.sync="dialogFormVisible"
    >
      <div class="dialog-content">
        <el-form ref="form" label-width="100px">
          <el-form-item label="预计工作量：">
            <span>{{ todaySuggestPhotoNum }}</span>
          </el-form-item>
          <el-form-item label="预计工作量：">
            <el-input v-model="staffPracticalValue" v-numberOnly />
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="changeGroupStaffWorkLoad">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import limitNum from '@/directive/limit-num'

import * as RetouchLeader from '@/api/retouchLeader.js'

export default {
  name: 'WorkManagement',
  directives: { limitNum },
  data () {
    return {
      todayData: {},
      tableData: [],
      dialogFormVisible: false,
      staffPracticalValue: '',
      todaySuggestPhotoNum: 0, // 建议工作量
      staffId: '' // 伙伴id
    }
  },
  created () {
    this.getTodayQuota()
    this.getGroupStaffTodayQuotaList()
  },
  methods: {
    /**
     * @description 打开调整工作量
     */
    adjustWorkload (staffInfo) {
      this.todaySuggestPhotoNum = staffInfo.todaySuggestPhotoNum
      this.staffId = staffInfo.staffId
      this.dialogFormVisible = true
    },
    /**
     * @description 关闭窗口回调
     */
    beforClose () {
      this.todaySuggestPhotoNum = 0
      this.staffId = ''
      this.staffPracticalValue = ''
      this.dialogFormVisible = false
    },
    /**
     * @description 获取今日指标
     */
    async getTodayQuota () {
      this.todayData = await RetouchLeader.getTodayQuota()
    },
    /**
     * @description 获取组员今日指标列表
     */
    async getGroupStaffTodayQuotaList () {
      const data = await RetouchLeader.getGroupStaffTodayQuotaList()
      this.tableData = data
    },
    /**
     * @description 修改组员工作量(下一版迭代))
     */
    changeGroupStaffWorkLoad () {
      if (!this.staffId || !this.staffPracticalValue) {
        this.$newMessage.warning('请填写完整信息')
        return false
      }
      const reqData = {
        staffId: this.staffId,
        expect: this.staffPracticalValue
      }
      RetouchLeader.changeGroupStaffWorkLoad(reqData)
        .then(() => {
          this.$newMessage.success('修改成功')
          this.dialogFormVisible = false
        })
    }
  }
}
</script>

<style lang="less">
@import "~@/styles/variables.less";

.work-management {
  .today-info {
    width: 289px;
    margin-right: 24px;

    .panel-main {
      position: relative;
      text-align: center;

      .el-progress__text {
        display: none;
      }

      .progress-num {
        position: absolute;
        top: 50%;
        left: 50%;
        display: flex;
        flex-direction: column;
        color: #606266;
        transform: translateX(-50%) translateY(-50%);

        .num {
          font-family: @DINAlternate;
          font-size: 44px;
          font-weight: bold;
          color: @blue;
        }
      }
    }

    .panel-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
      font-family: @pingFang;
      font-size: 12px;
      line-height: 20px;
      color: #606266;

      & > div {
        &::before {
          display: inline-block;
          width: 8px;
          height: 8px;
          margin-right: 4px;
          content: '';
          background: @borderColor;
          border-radius: 50%;
        }
      }

      .footer-right {
        &::before {
          background: linear-gradient(51deg, rgba(145, 245, 255, 1) 0%, rgba(70, 105, 251, 1) 100%);
        }
      }
    }
  }

  .data-panel {
    margin-bottom: 20px;

    .panel-title {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
    }

    .search-box {
      display: flex;
      align-items: center;
      margin-top: 20px;

      button {
        margin-left: 20px;
      }
    }

    .panel-content {
      margin-top: 20px;
    }
  }

  .table-box {
    box-shadow: @boxShadow;
  }
}
</style>
