<template>
  <div class="complain-history transform-fixed page-class">
    <div class="header">
      <h3>申诉记录</h3>
    </div>
    <!-- 列表主要内容 -->
    <div class="history-main table-box">
      <div class="search-box">
        <!-- 申诉时间 -->
        <div class="date-search search-item">
          <span>申诉时间:</span>
          <el-date-picker v-model="timeSpan" type="datetime" placeholder="选择申诉时间" />
        </div>
        <!-- 流水号 -->
        <div class="stream-search search-item">
          <span>流水号:</span>
          <el-input v-model="streamNum" clearable placeholder="请输入流水号" />
        </div>
        <!-- 处理状态 -->
        <div class="audit-box search-item">
          <span>处理状态:</span>
          <complain-status-select v-model="complainStatus" />
        </div>
        <!-- 申诉类型 -->
        <div class="audit-box search-item">
          <span>申诉类型</span>
          <complain-type-select v-model="complainType" />
        </div>
        <div class="search-button-box search-item">
          <el-button type="primary" @click="searchList(1)">查询</el-button>
        </div>
      </div>
      <div class="table-module">
        <el-table :data="tableData" style="width: 100%;">
          <el-table-column
            prop="streamNum"
            label="申诉信息"
            width="160"
            fixed="left"
          />
          <el-table-column label="申诉类型" width="150">
            <template slot-scope="scope">
              {{ scope.row.receiptAt | toTimeSpan }}
            </template>
          </el-table-column>
          <el-table-column prop="retouchAllTime" label="处理状态" width="100" />
          <el-table-column prop="storeReturnNum" label="初审详情" width="80" />
          <el-table-column prop="exp" label="复审详情">
            <template slot-scope="{ row }">
              <el-popover
                placement="right"
                width="240"
                popper-class="people-table"
                trigger="hover"
              >
                <div class="exp-box">
                  <div class="exp-item exp-title">
                    <span>人数</span>
                    <span>数量</span>
                  </div>
                  <div class="exp-item exp-list" v-for="(expItem, expIndex) in row.peopleTable" :key="row.streamNum + expIndex">
                    <span>{{ Number(expItem.expItempeopleLabel) ? `${expItem.peopleLabel}人` : expItem.peopleLabel }}</span>
                    <span>{{ expItem.photoNum }}</span>
                  </div>
                </div>
                <span slot="reference">{{ row.exp }}</span>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="linkto(scope.row.streamId)">详情</el-button>
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
import ComplainStatusSelect from '@SelectBox/ComplainStatusSelect'
import ComplainTypeSelect from '@SelectBox/ComplainTypeSelect'

// import * as RetoucherCenter from '@/api/retoucherCenter.js'
// todo mock
const mockData = [
  {
    "id": 1,
    "stream_id": 1,
    "stream_num": "asdasdasd",
    "created_at": "2019-12-01 10:00:00",
    "streamAppealExamines": [
      [
        {
          "id": 1123123,
          "state": "wait",
          "phase": "st",
          "examine_staff_id": 123,
          "examine_staff_info": {
            "id": 123,
            "nickname": "xxxxx",
            "name": "xxxx"
          }
        },
        {
          "id": 1123123,
          "state": "",
          "phase": "st",
          "examine_staff_id": 123,
          "examine_staff_info": {
            "id": 123,
            "nickname": "xxxxx",
            "name": "xxxx"
          }
        }
      ]
    ],
    "type": "rework",
    "state": "wait_st"
  }
]
export default {
  name: 'ComplainHistory',
  components: { ComplainStatusSelect, ComplainTypeSelect },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 时间
      streamNum: '', // 流水号
      complainStatus: 'all',
      complainType: 'all',
      searchType: 0, // 搜索标准
      tableData: mockData, // 列表数据
      isGood: 'all', // 是否门店点赞
      returnType: 'all', // 退单类型
      pager: {
        page: 1,
        pageSize: 10,
        total: 10
      },
      returnOptions: [{
        label: '质量问题',
        value: 'quality'
      },{
        label: '非质量问题',
        value: 'not_quality'
      }]
    }
  },
  methods: {
    /**
     * @description 跳转链接
     */
    linkto (streamId) {
      const query = { streamId }
      if (this.active === 'others') {
        query.searchOther = 1
      }
      this.$router.push({
        path: '/order-detail',
        query
      })
    },
    /**
     * @description 搜索历史修图记录
     */
    searchList (page) {
      this.pager.page = page ? page : this.pager.page
      this.getComplainList()
    },
    /**
     * @description 获取申诉列表
     */
    async getComplainList () {
      // 
    },
    /**
     * @description 页码改变
     */
    handleCurrentChange () {
      this.searchList()
    }
  }
}
</script>

<style lang="less" scoped>
.complain-history {
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
      margin-top: 0;

      & /deep/ .el-table--scrollable-x .el-table__body-wrapper {
        &::-webkit-scrollbar {
          height: 8px;
        }
      }
    }

    .stream-search {
      span {
        width: 60px;
      }
    }
  }
}
</style>

<style lang="less">
.people-table {
  .exp-box {
    position: relative;
    max-height: 400px;
    overflow: overlay;

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
      display: none;
      background: #fff;
    }

    &::-webkit-scrollbar-corner {
      display: none;
    }

    .exp-item {
      display: flex;

      & > span {
        flex: 1;
        text-align: center;
      }
    }

    .exp-list {
      padding: 3px 0;
      border-bottom: 1px solid #ebeef5;

      &:hover {
        background-color: #f5f7fa;
      }
    }

    .exp-title {
      position: sticky;
      top: 0;
      z-index: 99;
      padding: 5px 0;
      background-color: #fafafa;
    }
  }

  .stream-state {
    .el-tag:nth-last-of-type(1) {
      margin-left: 12px;
    }

    .stream-num {
      display: inline-block;
    }

    &.wrap {
      .stream-num {
        display: block;
      }
    }
  }
}

.income-list {
  p {
    padding: 5px 0;
    font-size: 13px;
    color: #909399;
    text-align: center;
  }

  .text-red {
    color: @red;
  }

  .text-money {
    color: @moneyColor;
  }

  .text-plant {
    color: @panGreen;
  }
}
</style>
