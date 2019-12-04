<template>
  <div class="retouch-history transform-fixed page-class">
    <div class="header">
      <h3>修图历史记录</h3>
    </div>
    <div class="search-box">
      <div class="date-search search-item">
        <span>时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <div class="stream-search search-item">
        <span>流水号</span>
        <el-input v-model="streamNum" clearable placeholder="请输入流水号" />
      </div>
      <div class="search-type search-item">
        <span>种拔草</span>
        <grass-select v-model="searchType" />
      </div>
      <div class="search-button-box">
        <el-button type="primary" @click="getRetouchList(1)">查询</el-button>
      </div>
    </div>
    <div class="table-box">
      <el-table :data="tableData" style="width: 100%;">
        <el-table-column prop="stream_num" label="流水号" width="250px" />
        <el-table-column label="接单时间" width="150px">
          <template slot-scope="scope">
            {{ scope.row.receipt_at | toTimeSpan }}
          </template>
        </el-table-column>
        <el-table-column label="审核通过时间" width="150px">
          <template slot-scope="scope">
            {{ scope.row.pass_at | toTimeSpan }}
          </template>
        </el-table-column>
        <el-table-column prop="retouchAllTime" label="修图总时长" />
        <el-table-column prop="plantNum" label="种草" />
        <el-table-column prop="pullNum" label="拔草" />
        <el-table-column prop="exp" label="海草值">
          <template slot-scope="scope">
            <el-popover
              placement="right"
              width="240"
              popper-class="people-table"
              trigger="hover"
            >
              <el-table :key="scope.row.stream_num + 'photo'" :data="scope.row.peopleTable" style="width: 100%;">
                <el-table-column label="人数">
                  <template slot-scope="peopleData">
                    {{ Number(peopleData.row.peopleLabel) ? `${peopleData.row.peopleLabel}人` : peopleData.row.peopleLabel }}
                  </template>
                </el-table-column>
                <el-table-column prop="photoNum" label="数量" />
              </el-table>
              <span slot="reference">{{ scope.row.exp }}</span>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="linkto(scope.row.id)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
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
import { joinTimeSpan } from '@/utils/timespan.js'
import { SearchType } from '@/utils/enumerate'

import * as RetoucherCenter from '@/api/retoucherCenter.js'

export default {
  name: 'RetouchHistory',
  components: { DatePicker, GrassSelect },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 时间
      streamNum: '', // 流水号
      searchType: 0, // 搜索标准
      tableData: [], // 列表数据
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
        const { retouchHistoryTimeSpan, retouchHistorySearchType } = query
        if (retouchHistoryTimeSpan) {
          this.timeSpan = this.$route.query.retouchHistoryTimeSpan.split(',')
        }
        if (retouchHistorySearchType) {
          switch (retouchHistorySearchType) {
            case SearchType.CheckPlant:
              this.searchType = 'plant'
              break
            case SearchType.CheckPull:
              this.searchType = 'pull'
              break
            default:
              break
          }
        }
        this.getRetouchList()
      },
      immediate: true
    }
  },
  methods: {
    /**
     * @description 跳转链接
     */
    linkto (streamId) {
      this.$router.push({
        path: '/order-detail',
        query: { streamId }
      })
    },
    /**
     * @description 获取历史列表
     * @param 页码 如果通过按搜索框搜索,传输1 到第一页
     */
    async getRetouchList (page) {
      try {
        if (page) { this.pager.page = page }
        const reqData = {
          page: this.pager.page,
          pageSize: this.pager.pageSize
        }
        if (this.timeSpan) {
          reqData.startAt = joinTimeSpan(this.timeSpan[0])
          reqData.endAt = joinTimeSpan(this.timeSpan[1], 1)
        }
        if (this.searchType) { reqData.grass = this.searchType }
        if (this.streamNum) { reqData.streamNum = this.streamNum }
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await RetoucherCenter.getRetouchQuotaList(reqData)
        this.pager.total = data.total
        this.tableData = data.list
        delete this.$route.query.retouchHistoryTimeSpan
        delete this.$route.query.retouchHistorySearchType
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    },
    /**
     * @description 页码改变
     */
    handleCurrentChange () {
      this.getRetouchList()
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";

.retouch-history {
  .table-box {
    margin-top: 20px;
  }

  .stream-search {
    span {
      width: 60px;
    }
  }
}
</style>

<style lang="less">
.people-table {
  .el-table {
    max-height: 400px;
    overflow: overlay;
    position: relative;

    &::-webkit-scrollbar {
      width: 5px;
    }

    &::-webkit-scrollbar-thumb {
      background: #cdcdcd;
      border-radius: 10px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-button {
      background: #fff;
      display: none;
    }

    &::-webkit-scrollbar-corner {
      display: none;
    }

    .el-table__header-wrapper {
      position: sticky;
      top: 0;
      z-index: 99;
    }
  }
}
</style>
