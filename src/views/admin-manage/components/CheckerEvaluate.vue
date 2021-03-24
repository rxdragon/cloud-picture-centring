<template>
  <div v-loading="loading" class="checker-evaluate">
    <el-row class="search-box" :gutter="20">
      <!-- 时间 -->
      <el-col :span="8" :xl="4">
        <div class="search-item">
          <span>时间</span>
          <date-picker v-model="timeSpan" />
        </div>
      </el-col>
      <el-col :span="8" :xl="4">
        <div class="staff-search search-item">
          <span>伙伴</span>
          <staff-select v-model="staffId" :props="{ multiple: false }" />
        </div>
      </el-col>
      <!-- 门店评价 -->
      <el-col :span="4" :xl="4">
        <div class="store-grade search-item">
          <span> 门店评价 </span>
          <evaluate-select v-model="storeEvaluate"/>
        </div>
      </el-col>
      <!-- 查询 -->
      <el-col :span="4" :xl="4">
        <div class="button-box search-item">
          <el-button type="primary" @click="getStoreEvaluate(1)">查询</el-button>
        </div>
      </el-col>
    </el-row>

    <!-- 列表 -->
    <el-table :data="tableData" style="width: 100%;">
      <el-table-column label="评价时间" width="180">
        <template slot-scope="scope">
          {{ scope.row.store_evaluate_at | toTimeSpan }}
        </template>
      </el-table-column>
      <el-table-column prop="stream.stream_num" label="流水号" width="200" />
      <el-table-column prop="retoucherName" label="修图师" />
      <el-table-column prop="retouchGroupName" label="修图小组" />
      <el-table-column label="门店评价">
        <template slot-scope="scope">
          <show-evaluate :evaluate="scope.row.store_evaluate" />
        </template>
      </el-table-column>
      <el-table-column prop="retoucherNpsAvg" label="顾客满意度" />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="linkto(scope.row.stream_id)">详情</el-button>
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
</template>

<script>
import DatePicker from '@/components/DatePicker'
import ShowEvaluate from '@/components/ShowEvaluate'
import StaffSelect from '@SelectBox/StaffSelect'
import EvaluateSelect from '@SelectBox/EvaluateSelect'
import { joinTimeSpan, delayLoading } from '@/utils/timespan.js'
import * as WorkManage from '@/api/workManage'

export default {
  name: 'CheckerEvaluate',
  components: { DatePicker, StaffSelect, EvaluateSelect, ShowEvaluate },
  data () {
    return {
      loading: false,
      timeSpan: null, // 时间
      storeEvaluate: 'all', // 门店评分
      staffId: '', // 伙伴id
      tableData: [], // 列表
      pager: {
        page: 1,
        pageSize: 10,
        total: 10
      }
    }
  },
  methods: {
    /**
     * @description 监听页面变化
     */
    handleCurrentChange () {
      this.getStoreEvaluate()
    },
    /**
     * @description 跳转到流水详情页
     */
    linkto (streamId) {
      this.$router.push({
        path: '/order-detail',
        query: { streamId }
      })
    },
    /**
     * @description 获取门店评价数据
     */
    getParams () {
      if (!this.timeSpan) {
        this.$newMessage.warning('请输入时间')
        return false
      }
      const req = {
        page: this.pager.page,
        pageSize: this.pager.pageSize,
        startAt: joinTimeSpan(this.timeSpan[0]),
        endAt: joinTimeSpan(this.timeSpan[1], 1)
      }
      if (this.staffId) {
        req.staffId = this.staffId
      }
      if (this.storeEvaluate !== 'all') {
        req.storeEvaluation = this.storeEvaluate ? 'good' : 'bad'
      }
      return req
    },
    /**
     * @description 获取门店评价
     */
    async getStoreEvaluate (page) {
      try {
        if (page) {
          this.pager.page = page
        }
        const req = this.getParams()
        if (!req) return
        this.loading = true
        const data = await WorkManage.getStoreEvaluate(req)
        this.tableData = data.list
        this.pager.total = data.total
      } catch (error) {
        console.error(error)
      } finally {
        await delayLoading()
        this.loading = false
      }
    }
  }
}
</script>
