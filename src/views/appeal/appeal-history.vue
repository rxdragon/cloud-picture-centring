<template>
  <div class="appeal-history transform-fixed page-class">
    <div class="header">
      <h3>申诉记录</h3>
    </div>
    <!-- 列表主要内容 -->
    <div class="history-main table-box">
      <div class="search-box">
        <!-- 申诉时间 -->
        <div class="date-search search-item">
          <span>申诉时间：</span>
          <date-picker v-model="timeSpan" />
        </div>
        <!-- 流水号 -->
        <div class="stream-search search-item">
          <span>流水号：</span>
          <el-input
            @keyup.native.enter="searchList(1)"
            v-model="streamNum"
            clearable
            placeholder="请输入流水号"
          />
        </div>
        <!-- 处理状态 -->
        <div class="audit-box search-item">
          <span>处理状态：</span>
          <appeal-status-select v-model="appealStatus" />
        </div>
        <!-- 申诉类型 -->
        <div class="audit-box search-item">
          <span>申诉类型：</span>
          <appeal-type-select v-model="appealType" />
        </div>
        <div class="search-button-box search-item">
          <el-button type="primary" @click="searchList(1)">查询</el-button>
        </div>
      </div>
      <div class="table-module">
        <el-table empty-text="暂无申诉记录" :data="tableData" style="width: 100%;">
          <el-table-column
            prop="streamNum"
            label="申诉信息"
            width="230"
            fixed="left"
          >
            <template slot-scope="{ row }">
              <div>
                <p class="table-title">申诉时间：</p>
                {{ row.createdAt }}
              </div>
              <div>
                <p class="table-title">流水号：</p>
                {{ row.streamNum }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="申诉类型" prop="appealTypeName" width="150" />
          <el-table-column prop="appealStatusDesc" label="处理状态" width="100"/>
          <el-table-column prop="storeReturnNum" label="初审详情" width="240">
            <template slot-scope="{ row }">
              <div>
                <p class="table-title">初审人：</p>
                {{ row.firstInfo.staffName }}
              </div>
              <div>
                <p class="table-title">初审状态：</p>
                {{ row.firstInfo.status }}
              </div>
              <div>
                <p class="table-title">初审时间：</p>
                {{ row.firstInfo.time }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="storeReturnNum" label="复审详情" width="240">
            <template slot-scope="{ row }">
              <div>
                <p class="table-title">复审人：</p>
                {{ row.secondInfo.staffName }}
              </div>
              <div>
                <p class="table-title">复审状态：</p>
                {{ row.secondInfo.status }}
              </div>
              <div>
                <p class="table-title">复审时间：</p>
                {{ row.secondInfo.time }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{ row }">
              <el-button type="primary" size="mini" @click="linkto(row.id)">详情</el-button>
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
  </div>
</template>

<script>
import AppealStatusSelect from '@SelectBox/AppealStatusSelect'
import AppealTypeSelect from '@SelectBox/AppealTypeSelect'
import DatePicker from '@/components/DatePicker'

import * as Appeal from '@/api/appeal.js'

export default {
  name: 'AppealHistory',
  components: { AppealStatusSelect, AppealTypeSelect, DatePicker },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 时间
      streamNum: '', // 流水号
      appealStatus: [],
      appealType: '',
      tableData: [], // 列表数据
      pager: {
        page: 1,
        pageSize: 20,
        total: 10
      }
    }
  },
  created () {
    this.getAppealList()
  },
  methods: {
    /**
     * @description 跳转链接
     */
    linkto (id) {
      const query = { id }
      this.$router.push({
        path: '/appeal-detail',
        query
      })
    },
    /**
     * @description 搜索历史修图记录
     */
    searchList (page) {
      this.pager.page = page ? page : this.pager.page
      this.getAppealList()
    },
    /**
     * @description 获取申诉列表
     */
    async getAppealList () {
      const req = {
        page: this.pager.page,
        pageSize: this.pager.pageSize,
        cond: {}
      }
      if (this.timeSpan) {
        req.cond.startAtGte = this.timeSpan[0]
        req.cond.endAtLte = this.timeSpan[1]
      }
      if (this.appealStatus.length) req.cond.stateIn = this.appealStatus
      if (this.appealType) req.cond.type = this.appealType
      if (this.streamNum) req.cond.streamNum = this.streamNum
      if (!Object.keys(req.cond).length) delete req.cond // 后端{}报错,如果是{}去掉cond
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const listInfo = await Appeal.getAppealList(req)
        this.tableData = listInfo.list
        this.pager.total = listInfo.total || 0
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
      
    },
    /**
     * @description 页码改变
     */
    handleCurrentChange () {
      this.getAppealList()
    }
  }
}
</script>

<style lang="less" scoped>
.appeal-history {
  .history-main {
    margin-top: 0;

    .search-box {
      flex-wrap: wrap;

      .search-item {
        margin-right: 30px;
        margin-bottom: 20px;
      }
    }

    .table-module {
      .table-title {
        display: inline-block;
        width: 70px;
        text-align: left;
      }
    }

    .stream-search {
      span {
        flex-shrink: 0;
        width: 60px;
      }
    }
  }
}
</style>
