<template>
  <div class="audit-history">
    <div class="header">
      <h3>审核历史记录</h3>
    </div>
    <div class="search-box">
      <div class="search-item">
        <span>时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <div class="audit-grass-box search-item">
        <span>审核种拔草</span>
        <grass-select v-model="auditType" />
      </div>
      <div class="audit-box search-item">
        <span>纠偏</span>
        <check-grass-select v-model="correcType" />
      </div>
      <div class="spot-check-box search-item">
        <span>抽查种拔草</span>
        <spot-grass-select v-model="spotCheckType" />
      </div>
      <div class="button-box">
        <el-button type="primary" @click="getReviewList(1)">查 询</el-button>
      </div>
    </div>

    <div class="table-box">
      <el-table :data="tableData" style="width: 100%;">
        <el-table-column prop="stream_num" label="流水号" width="200" />
        <el-table-column prop="pass_at" label="审核通过时间" width="200">
          <template slot-scope="scope">
            {{ scope.row.pass_at | toTimeSpan }}
          </template>
        </el-table-column>
        <el-table-column prop="reviewAllTime" label="审核总时长" />
        <el-table-column prop="reviewPhoto" label="审核种 / 拔草" />
        <el-table-column label="纠偏">
          <template slot-scope="scope">
            <div>意见相同：{{ scope.row.spotSameNum }}</div>
            <div>意见不同：{{ scope.row.spotDifferentNum }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="checkPhoto" label="抽查种 / 拔草" />
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="linkto(scope.row.id)">详情</el-button>
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
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import GrassSelect from '@SelectBox/GrassSelect'
import SpotGrassSelect from '@SelectBox/SpotGrassSelect'
import CheckGrassSelect from '@SelectBox/CheckGrassSelect'
import { joinTimeSpan } from '@/utils/timespan.js'

import { parseTime } from '@/utils/index.js'
import { SearchType } from '@/utils/enumerate'
import * as ReviewCheck from '@/api/reviewCheck.js'

export default {
  name: 'AuditHistory',
  components: { DatePicker, GrassSelect, CheckGrassSelect, SpotGrassSelect },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 时间戳
      auditType: 0, // 抽片类型
      spotCheckType: 0,
      correcType: 0,
      tableData: [],
      pager: {
        page: 1,
        pageSize: 10,
        total: 10
      }
    }
  },
  watch: {
    '$route.query': {
      handler (query) {
        const { timeSpan, searchType } = query
        if (timeSpan) {
          this.timeSpan = this.$route.query.timeSpan.split(',')
        } else if (!this.timeSpan) {
          const nowTime = parseTime(new Date(), '{y}-{m}-{d}')
          this.timeSpan = [nowTime, nowTime]
        }
        switch (searchType) {
          case SearchType.CheckPlant:
            this.auditType = 'plant'
            break
          case SearchType.CheckPull:
            this.auditType = 'pull'
            break
          case SearchType.SpotPlant:
            this.spotCheckType = 'spotPlant'
            break
          case SearchType.SpotPull:
            this.spotCheckType = 'spotPull'
            break
          case SearchType.RectifySame:
            this.correcType = SearchType.RectifySame
            break
          case SearchType.RectifyPlant:
            this.correcType = SearchType.RectifyPlant
            break
          case SearchType.RectifyPull:
            this.correcType = SearchType.RectifyPull
            break
          case SearchType.RectifyNone:
            this.correcType = SearchType.RectifyNone
            break
          case SearchType.RectifyDifferent:
            this.correcType = SearchType.RectifyDifferent
            break
          default:
            break
        }
        this.getReviewList()
      },
      immediate: true
    }
  },
  methods: {
    /**
     * @description 页面切换
     */
    handleCurrentChange () {
      this.getReviewList()
    },
    /**
     * @description 查看详情
     */
    linkto (streamId) {
      this.$router.push({
        path: '/order-detail',
        query: { streamId }
      })
    },
    /**
     * @description 获取审核历史记录
     */
    async getReviewList (page) {
      if (!this.timeSpan) {
        this.$newMessage.warning('请输入时间')
        return false
      }
      this.pager.page = page || this.pager.page
      const reqData = {
        range: 'self',
        startAt: joinTimeSpan(this.timeSpan[0]),
        endAt: joinTimeSpan(this.timeSpan[1], 1),
        pageSize: this.pager.pageSize,
        page: this.pager.page
      }
      this.auditType && (reqData.plantOrPull = this.auditType)
      this.spotCheckType && (reqData.spotCheckPlantOrPull = this.spotCheckType)
      if (this.correcType) {
        switch (this.correcType) {
          case SearchType.RectifySame:
            reqData.rectify = 'same'
            break
          case SearchType.RectifyDifferent:
            reqData.rectify = 'different'
            break
          case SearchType.RectifyPlant:
            reqData.rectify = 'different'
            reqData.rectifyGrass = 'plant'
            break
          case SearchType.RectifyPull:
            reqData.rectify = 'different'
            reqData.rectifyGrass = 'pull'
            break
          case SearchType.RectifyNone:
            reqData.rectify = 'different'
            reqData.rectifyGrass = 'none'
            break
          default:
            break
        }
      }
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await ReviewCheck.getReviewList(reqData)
        this.tableData = data.list
        this.pager.total = data.total
        delete this.$route.query.searchType
        delete this.$route.query.timeSpan
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    }
  }
}
</script>

<style lang="less">
@import "~@/styles/variables.less";

.audit-history {
  .search-item {
    margin-right: 16px;
  }

  .audit-grass-box,
  .spot-check-box {
    .el-select {
      width: 120px;
    }
  }
}
</style>
