<template>
  <div class="WorkBoard">
    <div class="header">
      <h3>云端工作看板</h3>
      <el-button type="primary" @click="showFlow">流量看板</el-button>
    </div>
    <!-- 加急操作 -->
    <div class="module-panel">
      <div class="panel-title">加急操作</div>
      <div class="search-box">
        <div class="search-item">
          <span>顾客姓名</span>
          <el-input v-model="urgentSearch.name" :disabled="Boolean(urgentSearch.caid) || Boolean(urgentSearch.id)" placeholder="请输入顾客姓名" />
        </div>
        <div class="search-item">
          <span>订单号</span>
          <el-input v-model="urgentSearch.id" :disabled="Boolean(urgentSearch.caid) || Boolean(urgentSearch.name)" placeholder="请输入订单号" />
        </div>
        <div class="search-item">
          <span>流水号</span>
          <el-input v-model="urgentSearch.caid" :disabled="Boolean(urgentSearch.id) || Boolean(urgentSearch.name)" placeholder="请输入流水号" />
        </div>
        <el-button type="primary" @click="getStreamList(1)">查询</el-button>
      </div>
      <el-table v-show="searchTableData.length" class="search-table-box" :data="searchTableData" style="width: 100%">
        <el-table-column prop="index" label="位置">
          <template slot-scope="scope">
            <div class="index-box">
              <span>{{ scope.row.queue_index || '-' }}</span>
              <div class="icon-box">
                <el-tag v-if="scope.row.staticsUrgent" type="danger" size="mini">急</el-tag>
                <el-tag v-if="scope.row.isReturn" type="danger" size="mini">审核退回</el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="修图标准">
          <template slot-scope="scope">
            {{ scope.row.retouchType | toRetouchClass }}
          </template>
        </el-table-column>
        <el-table-column label="订单信息" width="220">
          <template slot-scope="scope">
            <div v-if="scope.row.order" class="order-info">
              <span>订单号：{{ scope.row.order.id }}</span>
              <span>流水号：{{ scope.row.stream_num }}</span>
              <span>拍摄产品：{{ scope.row.product.name }}</span>
              <span>照片数量：{{ scope.row.photos.length }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="修图师">
          <template slot-scope="scope">
            <div class="staff-info">
              <span>修图师：{{ scope.row.retoucherName }}</span>
              <span>组长 ：{{ scope.row.retouchLeader }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="reviewerName" label="审核人" />
        <el-table-column prop="waitTime" label="等待时间" />
        <el-table-column prop="streamState" label="当前状态" />
        <el-table-column label="操作" width="160">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="linkto(scope.row.stream_num)">详情</el-button>
            <el-button v-if="!scope.row.staticsUrgent" type="danger" size="mini" @click="urgentStream(scope.row.id, 'urgent')">加急</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="page-box">
        <el-pagination
          :hide-on-single-page="true"
          :current-page.sync="urgentPager.page"
          :page-size="urgentPager.pageSize"
          layout="total, prev, pager, next, jumper"
          :total="urgentPager.total"
          :page-count="urgentPager.pages"
          @current-change="urgentPageChange"
        />
      </div>
    </div>
    <!-- 更换标签 -->
    <el-tabs v-model="activeName" class="tabs-box">
      <el-tab-pane :label="`修图队列（${retouchCount}）`" name="retouch" />
      <el-tab-pane :label="`审核队列（${reviewCount}）`" name="check" />
    </el-tabs>
    <!-- 列表数据 -->
    <div class="table-box" :class="{'no-border': activeName === 'retouch'}">
      <!-- 搜索框 -->
      <div class="search-button search-box">
        <!-- 修图标准 -->
        <div class="retouch-type search-item">
          <span>修图标准</span>
          <Retouch-kind-select v-model="retouchType" />
        </div>
        <!-- 状态 -->
        <div class="retouch-state search-item">
          <span>{{ activeName === 'retouch' ? '修图状态' : '审核状态' }}</span>
          <el-select v-model="retouchState" placeholder="请选择">
            <el-option label="全部" :value="0" />
            <el-option v-show="activeName === 'retouch'" label="待修图" value="wait_retouch" />
            <el-option v-show="activeName === 'retouch'" label="修图中" value="retouching" />
            <el-option v-show="activeName !== 'retouch'" label="待云端审核" value="wait_review" />
            <el-option v-show="activeName !== 'retouch'" label="云端审核中" value="reviewing" />
            <el-option v-show="activeName !== 'retouch'" label="待外包审核" value="wait_review" />
            <el-option v-show="activeName !== 'retouch'" label="外包审核中" value="reviewing" />
          </el-select>
        </div>
        <div class="button-box">
          <el-button type="primary" @click="getList(1)">查询</el-button>
        </div>
      </div>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="index" label="位置">
          <template slot-scope="scope">
            <div class="index-box">
              <span>{{ scope.row.queue_index || '-' }}</span>
              <div class="icon-box">
                <el-tag v-if="scope.row.staticsUrgent" type="danger" size="mini">急</el-tag>
                <el-tag v-if="scope.row.isReturn" type="danger" size="mini">审核退回</el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="修图标准">
          <template slot-scope="scope">
            {{ scope.row.retouchType | toRetouchClass }}
          </template>
        </el-table-column>
        <el-table-column label="订单信息" width="220">
          <template slot-scope="scope">
            <div v-if="scope.row.order" class="order-info">
              <span>订单号：{{ scope.row.order.id }}</span>
              <span>流水号：{{ scope.row.stream_num }}</span>
              <span>拍摄产品：{{ scope.row.product.name }}</span>
              <span>照片数量：{{ scope.row.photos.length }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="index" label="修图师">
          <template slot-scope="scope">
            <div class="staff-info">
              <span>修图师：{{ scope.row.retoucherName }}</span>
              <span>组长：{{ scope.row.retouchLeader }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="activeName === 'check'" prop="reviewerName" label="审核人" />
        <el-table-column prop="waitTime" label="等待时间" />
        <el-table-column prop="streamState" label="当前状态" />
        <el-table-column label="操作" width="160">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="linkto(scope.row.stream_num)">详情</el-button>
            <el-button v-if="!scope.row.staticsUrgent" type="danger" size="mini" @click="urgentStream(scope.row.id, 'other')">加急</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 页码 -->
      <div class="page-box">
        <el-pagination
          :hide-on-single-page="true"
          :current-page.sync="pager.page"
          :page-size="pager.pageSize"
          layout="total, prev, pager, next, jumper"
          :total="pager.total"
          :page-count="pager.pages"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <flow-board v-if="showFlowBoard" :show-flow-board.sync="showFlowBoard" />
  </div>
</template>

<script>
import FlowBoard from './components/FlowBoard'
import RetouchKindSelect from '@SelectBox/RetouchKindSelect'

import * as AdminManage from '@/api/adminManage'

export default {
  name: 'WorkBoard',
  components: { FlowBoard, RetouchKindSelect },
  data () {
    return {
      urgentSearch: { // 加急搜索
        name: '',
        id: '',
        caid: ''
      },
      urgentPager: {
        page: 1,
        pageSize: 10,
        total: 10
      },
      showFlowBoard: false,
      activeName: 'retouch', //
      retouchType: '',
      retouchState: 0,
      reviewCount: '', // 审核队列数量
      retouchCount: '', // 修图队列数量
      tableData: [],
      searchTableData: [],
      pager: {
        page: 1,
        pageSize: 10,
        total: 10
      },
      allRetouchClass: {}
    }
  },
  watch: {
    activeName: function (val) {
      this.retouchState = 0
      this.retouchType = ''
      this.getList(1)
    }
  },
  created () {
    this.getList()
  },
  methods: {
    /**
     * @description 监听页面变化
     */
    handleCurrentChange () {
      this.getList()
    },
    /**
     * @description 加急查询
     */
    urgentPageChange () {
      this.getStreamList()
    },
    /**
     * @description 跳转
     */
    linkto (workBoardStreamNum) {
      this.$router.push({
        path: '/order-detail',
        query: { workBoardStreamNum }
      })
    },
    /**
     * @description 展示流量看板
     */
    showFlow () {
      this.showFlowBoard = true
    },
    /**
     * @description 获取请求参数
     */
    getParams () {
      const req = {
        page: this.pager.page,
        pageSize: this.pager.pageSize
      }
      if (this.retouchType) { req.retoucherStandard = this.retouchType }
      if (this.retouchState) { req.streamState = this.retouchState }
      return req
    },
    /**
     * @description 获取列表数据
     */
    getList (page) {
      if (this.activeName === 'retouch') {
        this.getRetouchStreamList(page)
      } else {
        this.getReviewStreamList(page)
      }
    },
    /**
     * @description 获取修图流水列表
     */
    async getRetouchStreamList (page) {
      if (page) { this.pager.page = page }
      this.$store.dispatch('setting/showLoading')
      const req = this.getParams()
      const data = await AdminManage.getRetouchStreamList(req)
      this.tableData = data.list
      this.pager.total = data.total
      this.reviewCount = data.reviewCount
      this.retouchCount = data.retouchCount
      this.$store.dispatch('setting/hiddenLoading')
    },
    /**
     * @description 获取审核流水列表
     */
    async getReviewStreamList (page) {
      if (page) { this.pager.page = page }
      this.$store.dispatch('setting/showLoading')
      const req = this.getParams()
      const data = await AdminManage.getReviewStreamList(req)
      this.tableData = data.list
      this.pager.total = data.total
      console.log(data, '获取审核流水列表')
      this.reviewCount = data.reviewCount
      this.retouchCount = data.retouchCount
      this.$store.dispatch('setting/hiddenLoading')
    },
    /**
     * @description 加急流水
     */
    async urgentStream (streamId, type) {
      this.$store.dispatch('setting/showLoading')
      const req = { streamId }
      const data = await AdminManage.urgentStream(req)
      if (data) {
        this.$newMessage.success('操作成功!')
        if (type === 'urgent') {
          this.getStreamList(1)
        } else {
          this.getList(1)
        }
      }
    },
    /**
     * @description 加急流水查询
     */
    async getStreamList (page) {
      if (page) { this.urgentPager.page = page }
      const req = {}
      if (this.urgentSearch.name) { req.customerName = this.urgentSearch.name }
      if (this.urgentSearch.id) { req.orderNum = this.urgentSearch.id }
      if (this.urgentSearch.caid) { req.streamNum = this.urgentSearch.caid }
      if (!Object.keys(req).length) {
        this.$newMessage.warning('请填写参数')
        return false
      }
      this.$store.dispatch('setting/showLoading')
      const data = await AdminManage.getStreamList(req)
      if (data.list.length === 0) {
        this.$newMessage.warning('暂无数据')
      }
      this.searchTableData = data.list
      this.urgentPager.total = data.total
      this.$store.dispatch('setting/hiddenLoading')
      console.log(data)
    }
  }
}
</script>

<style lang="less">
@import "~@/styles/variables.less";
.WorkBoard {
  .search-box {
    margin: 24px 0;
    width: 100%;

    .el-input {
      width: 220px;
    }
  }

  .tabs-box {
    margin-top: 24px;
  }

  .search-table-box,
  .table-box {
    margin-top: 0;

    .search-box {
      margin-top: 0;
      margin-bottom: 24px;
    }

    .index-box {
      display: flex;
      align-items: center;

      &>span {
        display: inline-block;
        width: 20px;
        height: 20px;
      }

      .icon-box {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: space-around;
        height: 45px;
      }
    }

    .order-info {
      display: grid;
      text-align: left;
    }

    .staff-info {
      display: grid;
      text-align: left;
    }
  }
}
</style>
