<template>
  <div class="checker-evaluate">
    <div class="search-box">
      <div class="search-item">
        <span>时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <div class="staff-search search-item">
        <span>伙伴</span>
        <staff-select v-model="staffId" :props="{ multiple: false }" />
      </div>
      <div class="store-grade search-item">
        <span>门店评分</span>
        <el-select v-model="storeGrade" placeholder="请选择">
          <el-option label="全部星级" :value="0" />
          <el-option label="一星" :value="1" />
          <el-option label="二星" :value="2" />
          <el-option label="三星" :value="3" />
          <el-option label="四星" :value="4" />
          <el-option label="五星" :value="5" />
        </el-select>
      </div>
      <div class="button-box">
        <el-button type="primary" @click="getStoreEvaluate(1)">查询</el-button>
      </div>
    </div>
    <!-- 列表 -->
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="store_evaluate_at" label="评价时间" width="180" />
      <el-table-column prop="stream.stream_num" label="流水号" width="200" />
      <el-table-column prop="store_evaluate_star" label="门店评分" />
      <el-table-column prop="stream.retoucher.name" label="修图师" />
      <el-table-column prop="stream.retoucher.retouch_group.name" label="修图小组" />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="linkto(scope.row.stream_num)">详情</el-button>
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
import StaffSelect from '@SelectBox/StaffSelect'
import { joinTimeSpan } from '@/utils/timespan.js'
import * as WorkManage from '@/api/workManage'

export default {
  name: 'CheckerEvaluate',
  components: { DatePicker, StaffSelect },
  data () {
    return {
      timeSpan: null, // 时间
      storeGrade: 0, // 门店评分
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
      if (this.staffId) { req.staffId = this.staffId }
      if (this.storeGrade) { req.star = this.storeGrade }
      return req
    },
    /**
     * @description 获取门店评价
     */
    async getStoreEvaluate (page) {
      try {
        if (page) { this.pager.page = page }
        const req = this.getParams()
        if (!req) return
        this.$store.dispatch('setting/showLoading', this.$route.name)
        const data = await WorkManage.getStoreEvaluate(req)
        this.tableData = data.list
        this.pager.total = data.total
        this.$store.dispatch('setting/hiddenLoading', this.$route.name)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.$route.name)
      }
    }
  }
}
</script>

<style lang="less">
@import "~@/styles/variables.less";
.checker-evaluate {
  .search-box {
    margin-bottom: 24px;

    .store-grade {
      .el-select {
        width: 120px;
      }
    }

    .button-box {
      text-align: right;
    }
  }
}
</style>
