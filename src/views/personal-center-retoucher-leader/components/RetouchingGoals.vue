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
          <date-picker type="date" v-model="timeSpan" />
        </div>
      </el-col>
      <!-- 修图组 -->
      <el-col :span="8">
        <div class="staff-search search-item">
          <el-button type="primary">查 询</el-button>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="search-item set-goals">
          <el-button slot="reference" type="primary" @click="showDialog = true">设置每日目标完成总量</el-button>
        </div>
      </el-col>
    </el-row>

    <div class="module-table-box">
      <el-table :data="tableData" style="width: 100%;">
        <el-table-column prop="groupName" label="修图师"/>
        <el-table-column prop="groupLeader" label="修图标准" />
        <el-table-column prop="groupLeaderJobNumber" label="目标基础值(张)" />
        <el-table-column prop="groupLeaderJobNumber" label="预计浮动值(张)" />
        <el-table-column prop="groupLeaderJobNumber" label="实际浮动值(张)" />
        <el-table-column prop="groupLeaderJobNumber" label="其他张数">
          <template slot-scope="{ row }">
            <p>请假减少：{{ row.returnRate }}%</p>
            <p>其他冲抵：{{ row.returnRateRank }}</p>
          </template>
        </el-table-column>
        <el-table-column prop="groupLeaderJobNumber" label="目标修图张数(张)" />
        <el-table-column prop="groupLeaderJobNumber" label="实际今日已完成(张)" />
        <el-table-column prop="groupLeaderJobNumber" label="是否达标" />
      </el-table>
    </div>
    <div class="set-info">
      <div><span>今日目标：</span><span>4000张</span></div>
      <div><span>实际今日已完成：</span><span>1099张</span></div>
    </div>

    <el-dialog
      width="40%"
      title="修改修图师目标张数"
      center
      custom-class="empty-dialog"
      :visible.sync="showDialog"
    >
      <div class="dialog-content">
        <div class="group-item-wrap">
          <el-row
            class="item"
            v-for="(i, index) in 12"
            :key="index"
            :gutter="10"
          >
            <el-col :span="6">
              <span class="mr-5">张三</span>
              <el-tag size="mini" class="mr-5">请假</el-tag>
              <span class="standard-icon">
                <span :class="`iconmap-standard-master`" />
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
                v-model="totalGoals"
              />
            </el-col>
            <el-col :span="4">
              <span>浮动张数：</span>
              <span>68</span>
            </el-col>
          </el-row>
        </div>
        <el-divider class="divider"></el-divider>
        <p><span>今日预计完成总量：10000 张</span></p>
        <p><span>已分配修图张数：1500 张</span></p>
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

export default {
  name: 'RetouchingGroupGoals',
  components: { DatePicker },
  data () {
    return {
      loading: false,
      showDialog: false,
      timeSpan: null, // 查询时间
      tableData: [],
      totalGoals: 0
    }
  },
  methods: {
    handleEdit (row) {
      row.a = 1 // not empty
      // console.log(row)
    },
    handleConfirm () {
      this.showDialog = false
      this.$message.success('设置云端今日目标完成值成功。')
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
    margin-bottom: 15px;

    .number-input {
      width: calc(100% - 100px);
    }
  }
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
