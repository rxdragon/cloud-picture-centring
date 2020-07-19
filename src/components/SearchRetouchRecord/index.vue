<template>
  <div class="search-retouch-record">
    <!-- 修图记录 -->
    <el-button type="primary" @click="openShowSearchPage">{{ searchRole === SEARCH_ROLE.GROUP_LEADER ? '组员修图记录' : '云端全流水查询' }}</el-button>
    <div class="search-page" v-if="showSearchPage">
      <div class="header-box">
        <h3>{{ searchRole === SEARCH_ROLE.GROUP_LEADER ? '组员修图记录' : '云端全流水查询' }}</h3>
        <div class="header-plugin">
          <el-button @click="closeShowSearchPage" type="primary" plain>返回</el-button>
        </div>
      </div>
      <!-- 搜索框 -->
      <el-row
        class="searhc-row"
        :gutter="20"
        align="center"
        type="flex"
      >
        <!-- 退单时间 -->
        <el-col :span="11" :xl="6">
          <div class="search-item">
            <span>退单时间</span>
            <date-picker v-model="reworkTimeSpan" :disabled="!canSelectTimeSpan('reworkTimeSpan')" />
          </div>
        </el-col>
        <!-- 门店评价时间 -->
        <el-col :span="11" :xl="6">
          <div class="search-item">
            <span>门店评价时间</span>
            <date-picker
              v-model="storeEvaluateTimeSpan"
              :disabled="!canSelectTimeSpan('storeEvaluateTimeSpan')"
            />
          </div>
        </el-col>
        <!-- 云端审核通过时间 -->
        <el-col :span="11" :xl="6">
          <div class="search-item">
            <span>云端审核通过时间</span>
            <date-picker
              v-model="cloudAuditTimeSpan"
              :disabled="!canSelectTimeSpan('cloudAuditTimeSpan')"
            />
          </div>
        </el-col>
        <!-- 云学院评价时间 -->
        <el-col :span="11" :xl="6">
          <div class="search-item">
            <span>云学院评价时间</span>
            <date-picker
              v-model="cloudEvaluateTimeSpan"
              :disabled="!canSelectTimeSpan('cloudEvaluateTimeSpan')"
            />
          </div>
        </el-col>
        <!-- 云学院问题 -->
        <el-col :span="7" :xl="4">
          <div class="search-item">
            <span>云学院问题</span>
            <issue-label-select v-model="issueValue" />
          </div>
        </el-col>
        <!-- 门店退回问题 -->
        <el-col :span="7" :xl="4">
          <div class="search-item">
            <span>门店退回问题</span>
            <!-- TODO 退回问题接口 -->
            <issue-label-select v-model="issueValue" />
          </div>
        </el-col>
        <!-- 门店评价 -->
        <el-col :span="5" :xl="4">
          <div class="search-item">
            <span>门店评价</span>
            <evaluate-select v-model="isGood" />
          </div>
        </el-col>
        <!-- 查 询 -->
        <el-col :span="5" :xl="12">
          <div class="search-item">
            <el-button type="primary">查 询</el-button>
          </div>
        </el-col>
      </el-row>
      <!-- 列表数据 -->
      <div class="table-box">
        <el-table :data="tableData" style="width: 100%;">
          <el-table-column prop="date" label="组员" width="50" />
          <el-table-column prop="name" label="流水号" width="180" />
          <el-table-column prop="address" label="修图时间" />
          <el-table-column prop="address" label="退回张数" />
          <el-table-column prop="address" label="门店评分" />
          <el-table-column prop="address" label="操作" align="right">
            <template slot-scope="{ row }">
              <el-button type="primary" size="small" @click="linkto(row.id)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 分页html -->
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
import { SEARCH_ROLE } from '@/utils/enumerate'
import IssueLabelSelect from '@SelectBox/IssueLabelSelect'
import DatePicker from '@/components/DatePicker'
import EvaluateSelect from '@SelectBox/EvaluateSelect'

export default {
  name: 'SearchRetouchRecord',
  components: { DatePicker, IssueLabelSelect, EvaluateSelect },
  props: {
    searchRole: { type: String, required: true }
  },
  data () {
    return {
      SEARCH_ROLE,
      showSearchPage: false,
      reworkTimeSpan: null, // 门店退单时间
      storeEvaluateTimeSpan: null, // 门店评价时间
      cloudAuditTimeSpan: null, // 云端审核时间
      cloudEvaluateTimeSpan: null, // 云学院评价时间
      issueValue: [], // 问题标签
      isGood: 'all', // 门店评价
      tableData: [],
      pager: {
        page: 1,
        pageSize: 10,
        total: 10
      }
    }
  },
  methods: {
    /**
     * @description 打开搜索页面
     */
    openShowSearchPage () {
      this.showSearchPage = true
    },
    /**
     * @description 打开搜索页面
     */
    closeShowSearchPage () {
      this.showSearchPage = false
    },
    /**
     * @description 是否能选中日期
     */
    canSelectTimeSpan (type) {
      const typeList = ['reworkTimeSpan', 'storeEvaluateTimeSpan', 'cloudAuditTimeSpan', 'cloudEvaluateTimeSpan']
      const filterTypeArr = typeList.filter(item => item !== type)
      return filterTypeArr.every(item => !Boolean(this[item]))
    },
    /**
     * @description 跳转详情
     */
    linkto (streamId) {
      const query = { streamId }
      this.$router.push({
        path: '/order-detail',
        query
      })
    },
    /**
     * @description 监听页面切换
     */
    handleCurrentChange () {
      // TODO
    }
  }
}
</script>

<style lang="less" scoped>
.search-page {
  position: fixed;
  top: calc(~'@{navbarHeight} + @{tagsHeight}');
  left: @sideBarWidth;
  z-index: 3000;
  width: calc(~'100vw - @{sideBarWidth}');
  height: calc(~'@{appMainHeight} + @{headerHeight} ');
  padding: @appMainPadding;
  background-color: #f2f6fc;
  transform: scale(1);
  transform-origin: right top;

  .header-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: @headerHeight;
    -webkit-user-select: none;
    background-color: #f2f6fc;
    box-shadow: var(--boxShadow);

    h3 {
      font-size: 24px;
    }
  }

  .el-col {
    width: max-content;
  }

  & /deep/ .date-picker {
    .el-range-editor.el-input__inner {
      width: auto;
    }
  }

  & /deep/ .issue-label-select {
    .el-cascader {
      width: auto;
    }
  }

  .searhc-row {
    flex-wrap: wrap;
  }

  .search-item {
    margin-right: 0;
    margin-bottom: 20px;

    & > span {
      flex-shrink: 0;
    }
  }

  .table-box {
    margin-top: 0;
  }
}
</style>
