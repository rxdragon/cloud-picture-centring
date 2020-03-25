<template>
  <div class="crew-retouch-history">
    <div class="header">
      <h3>
        组员修图记录
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
      <div class="spot-check-box search-item">
        <span>抽查种拔草</span>
        <spot-grass-select v-model="spotCheckType" />
      </div>
      <div class="lekima-box search-item">
        <span>利奇马</span>
        <lekima-select v-model="isLichmaValue" />
      </div>
      <div class="button-box">
        <el-button type="primary" @click="getStaffRetouchList(1)">查 询</el-button>
      </div>
    </div>
    <div class="table-box">
      <el-table :data="tableData" style="width: 100%;">
        <el-table-column prop="retoucherName" label="组员" width="80" />
        <el-table-column prop="stream_num" label="流水号" />
        <el-table-column prop="pass_at" label="审核通过时间" />
        <el-table-column prop="retouchAllTime" label="修图总时长" />
        <el-table-column prop="reviewPhoto" label="审核种 / 拔草" />
        <el-table-column prop="checkPhoto" label="抽查种 / 拔草" />
        <el-table-column prop="lekimaInfo" label="利奇马" />
        <el-table-column prop="checkPhoto" label="评分">
          <template slot-scope="{row}">
            <div class="grade-box">
              <span class="span-row">
                <span class="span-title">门店评分：</span>
                {{ row.gradeInfo.storeGrade }}
              </span>
              <span class="span-row">
                <span class="span-title nps-grade">顾客满意度：</span>
                {{ row.gradeInfo.npsGrade }}
              </span>
            </div>
          </template>
        </el-table-column>
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
import LekimaSelect from '@SelectBox/LekimaSelect'
import CrewSelect from '@SelectBox/CrewSelect'
import { joinTimeSpan } from '@/utils/timespan.js'
import { SearchType } from '@/utils/enumerate'
import * as RetouchLeader from '@/api/retouchLeader.js'

export default {
  name: 'CrewRetouchHistory',
  components: { GrassSelect, CrewSelect, SpotGrassSelect, LekimaSelect },
  props: {
    isSeachPage: { type: Boolean },
    searchTime: { type: [Object, Array, String], default: () => {
      return {}
    } },
    searchStaff: { type: [Number, String], default: '' },
    searchType: { type: String, default: '' } // 搜索类型
  },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      auditType: 0,
      spotCheckType: 0, // 抽片类型
      tableData: [],
      staffId: 0,
      isLichmaValue: '', // 是否利奇马
      pager: {
        page: 1,
        pageSize: 10,
        total: 100
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
      case 'isLichma':
        this.isLichmaValue = 1
        break
      default:
        break
    }
    this.getStaffRetouchList()
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
      this.getStaffRetouchList()
    },
    /**
     * @description 调整到详情页面
     */
    linkto (streamId) {
      this.$router.push({
        path: '/order-detail',
        query: { streamId }
      })
    },
    /**
     * @description 获取组员修图记录
     */
    async getStaffRetouchList (page) {
      try {
        this.pager.page = page || this.pager.page
        const reqData = {
          range: 'group',
          startAt: joinTimeSpan(this.searchTime[0]),
          endAt: joinTimeSpan(this.searchTime[1], 1),
          pageSize: this.pager.pageSize,
          page: this.pager.page
        }
        String(this.isLichmaValue) && (reqData.isLichma = this.isLichmaValue)
        this.auditType && (reqData.plantPull = this.auditType)
        this.spotCheckType && (reqData.spotCheckPlantPull = this.spotCheckType)
        this.staffId && (reqData.staffId = this.staffId)
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await RetouchLeader.getStaffRetouchList(reqData)
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

.crew-retouch-history {
  .header {
    display: flex;
    justify-content: space-between;

    h3 {
      display: flex;
      align-items: flex-end;

      .search-time-panel {
        margin-left: 20px;
        font-size: 14px;
        font-weight: 400;
        line-height: 22px;
        color: #303133;
      }
    }
  }

  .table-box {
    .grade-box,
    .income-box {
      margin: 0;

      .span-row {
        display: flex;
        justify-content: space-between;

        .span-title {
          display: inline-block;
          width: 80px;
          text-align: left;
        }

        .nps-grade {
          width: 90px;
        }
      }
    }
  }
}
</style>
