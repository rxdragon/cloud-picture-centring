<template>
  <div class="charge-performance">
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
      <div class="search-item button-box" v-if="showPerformanceEdit">
        <el-button type="primary" plain @click="downPerformanceTemplete">下载绩效模版</el-button>
        <upload-excel
          btn-text="导入当月绩效"
          :header-data="headerKeys"
          :on-success="handleSuccess"
          :before-upload="beforeUpload"
        />
      </div>
    </div>
    <div class="table-module-box">
      <el-table :data="tableData" style="width: 100%;">
        <el-table-column prop="joinName" label="伙伴姓名（姓名）" />
        <el-table-column prop="retouchGroupName" label="修图组" />
        <el-table-column prop="jobNumber" label="工号" />
        <el-table-column prop="performanceScode" label="绩效得分" />
        <el-table-column prop="updatedAt" label="最后操作时间" />
        <el-table-column prop="updatedName" label="最后操作人" />
        <el-table-column label="操作">
          <template slot-scope="{ row }">
            <el-button
              v-if="canEditScore"
              type="primary"
              size="mini"
              @click="alterPerformance(row)"
            >
              修改
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <alter-performance v-if="dialogVisible" :edit-info="editInfo" @visibeClose="closeDialog" />
  </div>
</template>

<script>
import AlterPerformance from '@/components/AlterPerformance'
import UploadExcel from '@/components/UploadExcel'
import PerformanceMix from '@/mixins/performance-mixins'
import { getSearchMonth } from '@/utils/exportPerformanceExcel'

export default {
  name: 'ChargePerformance',
  components: { UploadExcel, AlterPerformance },
  mixins: [PerformanceMix],
  data() {
    return {
      searchType: 'retoucherLeader',
      routeName: this.$route.name, // 路由名字
      timeSpan: null,
      tableData: [], // 修图师组管绩效
      dialogVisible: false, // 显示修改成绩弹出框
    }
  },
  created () {
    this.timeSpan = getSearchMonth()
    this.searchPerformance()
  }
}
</script>

<style lang="less" scoped>
.charge-performance {
  .search-box {
    margin-bottom: 20px;

    .button-box {
      margin: 0 0 0 auto;
    }
  }
}
</style>
