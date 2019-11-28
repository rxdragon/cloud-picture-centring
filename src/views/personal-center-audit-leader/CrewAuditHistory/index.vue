<template>
  <div class="crew-audit-history">
    <div class="header">
      <h3>
        审核历史记录
        <div class="search-time-panel">查询时间：{{ searchTime[0] }} ~ {{ searchTime[1] }}</div>
      </h3>
      <el-button type="primary" plain @click="goBack">返回</el-button>
    </div>
    <!-- 搜索盒子 -->
    <div class="search-box">
      <div class="staff-box search-item">
        <span>组员</span>
        <crew-select v-model="staffId" />
      </div>
      <div class="audit-box search-item">
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
        <el-table-column prop="staffName" label="组员" />
        <el-table-column prop="stream_num" label="流水号" />
        <el-table-column prop="pass_at" label="审核通过时间" />
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
import GrassSelect from '@SelectBox/GrassSelect'
import SpotGrassSelect from '@SelectBox/SpotGrassSelect'
import CheckGrassSelect from '@SelectBox/CheckGrassSelect'
import CrewSelect from '@SelectBox/CrewSelect'

import * as ReviewCheck from '@/api/reviewCheck.js'
import { SearchType } from '@/utils/enumerate'
import { joinTimeSpan } from '@/utils/timespan.js'

export default {
  name: 'CrewAuditHistory',
  components: { GrassSelect, CheckGrassSelect, CrewSelect, SpotGrassSelect },
  props: {
    isSeachPage: { type: Boolean },
    searchTime: { type: [Object, Array, String], default: () => {} },
    searchStaff: { type: [Number, String], default: '' },
    searchType: { type: String, default: '' } // 搜索类型
  },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      auditType: 0, // 审核种拔草
      spotCheckType: 0, // 抽查种拔草
      correcType: 0, // 纠偏冲拔草
      staffId: 0, // 伙伴id
      tableData: [], // 列表数据
      pager: {
        page: 1,
        pageSize: 10,
        total: 10
      }
    }
  },
  created () {
    this.searchStaff && (this.staffId = this.searchStaff)
    switch (this.searchType) {
      case SearchType.CheckPlant:
        this.auditType = 'plant'
        break
      case SearchType.CheckPull:
        this.auditType = 'pull'
        break
      case SearchType.SpotPlant:
        this.spotCheckType = this.searchType
        break
      case SearchType.SpotPull:
        this.spotCheckType = this.searchType
        break
      case SearchType.SpotNone:
        this.spotCheckType = this.searchType
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
  methods: {
    /**
     * @description 返回
     */
    goBack () {
      this.$emit('update:searchType', '')
      this.$emit('update:isSeachPage', false)
    },
    /**
     * @description 页面更改
     */
    handleCurrentChange () {
      this.getReviewList()
    },
    /**
     * @description 获取信息
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
      this.pager.page = page || this.pager.page
      const reqData = {
        range: 'group',
        startAt: joinTimeSpan(this.searchTime[0]),
        endAt: joinTimeSpan(this.searchTime[1], 1),
        pageSize: this.pager.pageSize,
        page: this.pager.page
      }
      this.auditType && (reqData.plantOrPull = this.auditType)
      this.spotCheckType && (reqData.spotCheckPlantOrPull = this.spotCheckType)
      this.staffId && (reqData.staffId = this.staffId)
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
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";

.crew-audit-history {
  .header {
    display: flex;
    justify-content: space-between;

    h3 {
      display: flex;
      align-items: flex-end;

      .search-time-panel {
        margin-left: 20px;
        font-size: 14px;
        color: #303133;
        font-weight: 400;
        line-height: 22px;
      }
    }
  }
}
</style>
