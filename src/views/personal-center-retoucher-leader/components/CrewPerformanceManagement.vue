<template>
  <div class="crew-performance-management module-panel">
    <div class="search-box">
      <div class="search-item">
        <span>绩效月份</span>
        <el-date-picker
          v-model="timeSpan"
          type="month"
          clearable
          value-format="yyyyMM"
          placeholder="选择月"
        />
      </div>
      <div class="search-item">
        <el-button type="primary" @click="getRetouchPerformanceList">查 询</el-button>
      </div>
      <div class="search-item button-box">
        <el-button type="primary" plain @click="downPerformanceTemplete">下载绩效模版</el-button>
        <upload-excel
          btn-text="导入当月绩效"
          :header-data="headerKeys"
          :on-success="handleSuccess"
          :before-upload="beforeUpload"
        />
      </div>
    </div>
    <div class="module-tabel-box">
      <el-table :data="tableData" style="width: 100%;">
        <el-table-column prop="joinName" label="伙伴姓名（花名）" />
        <el-table-column prop="jobNumber" label="工号" />
        <el-table-column prop="performanceScode" label="绩效得分" />
        <el-table-column prop="updatedAt" label="最后操作时间" />
        <el-table-column label="操作">
          <template slot-scope="{ row }">
            <el-button type="primary" size="mini" @click="alterPerformance(row)">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <alter-performance v-if="dialogVisible" :edit-info="editInfo" @visibeClose="closeDialog" />
  </div>
</template>

<script>
import UploadExcel from '@/components/UploadExcel'
import exportPerformanceExcel, { headerCellkeys, getGradeMouth } from "@/utils/exportPerformanceExcel.js"
import AlterPerformance from '@/components/AlterPerformance'
import moment from 'moment'
import * as Performance from '@/api/performance.js'

export default {
  name: 'CrewPerformanceManagement',
  components: { UploadExcel, AlterPerformance },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null,
      tableData: [],
      dialogVisible: false,
      headerKeys: headerCellkeys,
      editInfo: {}
    }
  },
  created () {
    const nowDate = moment(new Date())
    this.timeSpan = nowDate.format('YYYYMM')
    this.getRetouchPerformanceList()
  },
  methods: {
    /**
     * @description 获取组员绩效
     */
    async getRetouchPerformanceList () {
      try {
        if (!this.timeSpan) return this.$newMessage.warning('请输入时间')
        this.$store.dispatch('setting/showLoading', this.routeName)
        const req = {
          type: 'retoucher',
          cycle: this.timeSpan
        }
        this.tableData = await Performance.getStaffPerformance(req)
      } catch (error) {
        console.error(error)
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
      
    },
    /**
     * @description 修改成绩
     */
    alterPerformance (performanceInfo) {
      this.editInfo = performanceInfo
      this.dialogVisible = true
    },
    /**
     * @description 关闭弹出框
     */
    closeDialog (action) {
      this.dialogVisible = false
      if (action === 'refreshList') {
        this.getRetouchPerformanceList()
      }
    },
    /**
     * @description 处理完成
     */
    async handleSuccess ({ results }) {
      try {
        results.splice(0, 1)
        const hasEveryScore = results.every(item => item.score)
        if (!hasEveryScore) return this.$newMessage.warning('分数没有填写完整！')
        const staffScores = results.map(item => {
          return {
            id: item.staffNum,
            score: Number(item.score)
          }
        })
        await this.saveRetouchPerformance(staffScores)
        const nowDate = moment(new Date())
        this.timeSpan = nowDate.format('YYYYMM')
        this.getRetouchPerformanceList()
      } catch (error) {
        console.error(error)
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 批量保存组员分数
     */
    async saveRetouchPerformance (staffScores) {
      const req = {
        type: 'retoucher',
        staffScores
      }
      await Performance.batchSaveStaffScores(req)
    },
    /**
     * @description 上传表格前
     */
    beforeUpload () {
      if (!this.canUpdatePerformance()) return false
      this.$store.dispatch('setting/showLoading', this.routeName)
      return true
    },
    /**
     * @description 下载绩模版
     */
    async downPerformanceTemplete () {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await Performance.getCanScoreStaff('retoucher')
        const gradeMouth = getGradeMouth()
        this.canUpdatePerformance()
        exportPerformanceExcel(`组员${gradeMouth}月`, data)
      } catch (error) {
        console.error(error)
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 判断能否导入绩效
     */
    canUpdatePerformance() {
      const nowDate = moment(new Date())
      const day = nowDate.date()
      if (day > 10 && day < 20) {
        this.$newMessage.warning('只能在当月20日后和次月10日后导入绩效')
        return false
      }
      return true
    }
  }
}
</script>

<style lang="less" scoped>
.crew-performance-management {
  .search-box {
    margin-bottom: 20px;

    .button-box {
      margin-left: auto;
    }
  }
}
</style>
