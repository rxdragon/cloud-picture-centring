<template>
  <div class="modify-history page-class">
    <div class="header">
      <h3>评分修改记录</h3>
    </div>
    <div class="search-box">
      <!-- 查询条件 -->
      <div class="search-item">
        <span>时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <div class="stream-search search-item">
        <span>流水号</span>
        <el-input clearable v-model="streamNum" placeholder="请输入流水号"></el-input>
      </div>
      <div class="staff-search search-item">
        <span>修图师</span>
        <staff-select v-model="staffIds" :props="{ multiple: true }" />
      </div>
      <!-- 查询按钮 -->
      <div class="button-box">
        <el-button :disabled="!Boolean(timeSpan)" type="primary" class="search-button" @click="getSearchHistory(1)">查询</el-button>
      </div>
    </div>
    <div class="module-panel">
      <div>
        <template>
        <el-table :data="historyList" style="width: 100%;">
          <el-table-column prop="created_at" label="操作时间" width="180" />
          <el-table-column prop="last_score" label="前次评分" />
          <el-table-column prop="after_score" label="更改后评分" />
          <el-table-column prop="take_staff" label="操作人" />
          <el-table-column prop="stream_num" label="流水号" width="180" />
          <el-table-column prop="retoucher_name" label="修图师" />
          <el-table-column prop="retoucher_leader" label="修图主管" />
        </el-table>
      </template>
      </div>
      <div class="page-box">
        <el-pagination
          :hide-on-single-page="true"
          :current-page.sync="pager.page"
          :page-size="pager.pageSize"
          layout="total, prev, pager, next, jumper"
          :total="pager.total"
          @current-change="handlePage"
        />
      </div>
    </div>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import StaffSelect from '@SelectBox/StaffSelect'
import moment from 'moment'
import { joinTimeSpan } from '@/utils/timespan.js'
import { getUpdateHistoryLog } from '@/api/assessmentCenter'

export default {
  name: 'ModifyHistory',
  components: { DatePicker, StaffSelect },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 时间
      streamNum: '', // 流水号
      staffIds: [], // 修图师 id
      historyList: [], // 修改记录数据列表
      pager: {
        page: 1,
        pageSize: 10,
        total: 10
      }
    }
  },
  created () {
    const startAt = moment().subtract('day', 28).locale('zh-cn').format('YYYY-MM-DD')
    const endAt = moment().locale('zh-cn').format('YYYY-MM-DD')
    this.timeSpan = [startAt, endAt]
    this.initial()
  },
  activated () {
    this.initial()
  },
  methods: {
    /**
     * @description 初始化
     */
    initial () {
      this.getSearchHistory(1)
    },
    /**
     * @description 获取搜索数据
     */
    getSearchParams () {
      if (!this.timeSpan) {
        this.$newMessage.warning('请填写正确的时间')
        return false
      }
      const req = {
        startAt: joinTimeSpan(this.timeSpan[0]),
        endAt: joinTimeSpan(this.timeSpan[1], 1),
        page: this.pager.page,
        pageSize: this.pager.pageSize
      }
      this.streamNum && (req.streamNum = this.streamNum)
      this.staffIds.length && (req.retoucherId = this.staffIds.map(item => Number(item)))
      return req
    },
    /**
     * @description 获取评分修改列表
     * @param {*} page
     */
    async getSearchHistory (page) {
      try {
        this.pager.page = page || this.pager.page
        const req = this.getSearchParams()
        if (!req) return false
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await getUpdateHistoryLog(req)
        this.historyList = data.list
        this.pager.total = data.total
      } catch (error) {
        console.error(error)
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 监听页面变化
     */
    handlePage (page) {
      this.$el.parentElement.scrollTop = 0
      this.getSearchHistory()
    }
  }
}
</script>

<style lang="less">
@import "~@/styles/variables.less";

.modify-history {
  .search-box {
    flex-wrap: wrap;

    .search-item {
      margin-bottom: 24px;
    }

    .button-box {
      margin-bottom: 24px;
    }

    .stream-search,
    .staff-search {
      & > span {
        width: 56px;
      }
    }
  }

  .page-box {
    margin-top: 24px;
    text-align: right;
  }

  .el-pagination .btn-next,
  .el-pagination .btn-prev,
  .el-pager li {
    background-color: transparent;
  }
}
</style>
