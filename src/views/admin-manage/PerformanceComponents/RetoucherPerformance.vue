<template>
  <div class="retoucher-performance">
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
        <span>云端伙伴</span>
        <staff-select v-model="staffIds" />
      </div>
      <div class="search-item">
        <el-button type="primary" @click="searchPerformance(1)">查 询</el-button>
      </div>
      <div class="search-item button-box" v-if="showPerformanceEdit">
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
      <!-- 页码 -->
      <div class="page-box">
        <el-pagination
          :hide-on-single-page="true"
          :current-page.sync="pager.page"
          :page-size="pager.pageSize"
          layout="total, prev, pager, next, jumper"
          :total="pager.total"
          :page-count="pager.pages"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <alter-performance v-if="dialogVisible" :edit-info="editInfo" @visibeClose="closeDialog" />
  </div>
</template>

<script>
import StaffSelect from '@SelectBox/StaffSelect'
import UploadExcel from '@/components/UploadExcel'
import AlterPerformance from '@/components/AlterPerformance'
import PerformanceMix from '@/mixins/performance-mixins'
import { getSearchMonth } from '@/utils/exportPerformanceExcel'


export default {
  name: 'RetoucherPerformance',
  components: { StaffSelect, UploadExcel, AlterPerformance },
  mixins: [PerformanceMix],
  data() {
    return {
      searchType: 'retoucher',
      performancType: 'all',
      routeName: this.$route.name, // 路由名字
      timeSpan: null,
      tableData: [],
      staffIds: [],
      pager: {
        page: 1,
        pageSize: 10,
        total: 10
      },
      dialogVisible: false
    }
  },
  created () {
    this.timeSpan = getSearchMonth()
    this.searchPerformance(1)
  },
  methods: {
    /**
     * @description 页面更改
     */
    handleCurrentChange () {
      this.searchPerformance()
    }
  }
}
</script>

<style lang="less" scoped>
.retoucher-performance {
  .search-box {
    margin-bottom: 20px;

    .button-box {
      margin: 0 0 0 auto;
    }
  }
}
</style>
