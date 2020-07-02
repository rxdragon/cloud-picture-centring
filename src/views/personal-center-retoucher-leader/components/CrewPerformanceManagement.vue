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
        <el-button type="primary" @click="searchPerformance">查 询</el-button>
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
import AlterPerformance from '@/components/AlterPerformance'
import moment from 'moment'
import PerformanceMix from '@/mixins/performance-mixins'

export default {
  name: 'CrewPerformanceManagement',
  components: { UploadExcel, AlterPerformance },
  mixins: [PerformanceMix],
  data () {
    return {
      searchType: 'retoucher',
      routeName: this.$route.name, // 路由名字
      timeSpan: null,
      tableData: [],
      dialogVisible: false
    }
  },
  created () {
    const nowDate = moment(new Date())
    this.timeSpan = nowDate.format('YYYYMM')
    this.searchPerformance()
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
