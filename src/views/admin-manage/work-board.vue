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
          <el-input
            v-model="urgentSearch.name"
            clearable
            :disabled="Boolean(urgentSearch.caid) || Boolean(urgentSearch.id)"
            placeholder="请输入顾客姓名"
          />
        </div>
        <div class="search-item">
          <span>订单号</span>
          <el-input
            v-model="urgentSearch.id"
            clearable
            :disabled="Boolean(urgentSearch.caid) || Boolean(urgentSearch.name)"
            placeholder="请输入订单号"
          />
        </div>
        <div class="search-item">
          <span>流水号</span>
          <el-input
            v-model="urgentSearch.caid"
            clearable
            :disabled="Boolean(urgentSearch.id) || Boolean(urgentSearch.name)"
            placeholder="请输入流水号"
          />
        </div>
        <el-button type="primary" @click="getStreamList(1)">查询</el-button>
      </div>
      <work-board-table
        v-show="searchTableData.length"
        key="urgentTable"
        show-checker
        urgent-search
        :table-data="searchTableData"
        @urgentSuccess="onUrgent"
      />
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
      <el-tab-pane :label="`修图队列（${retouchQueueCount}）`" name="retouch" />
      <el-tab-pane :label="`修图中（${retouchCount}）`" name="retouching" />
      <el-tab-pane :label="`审核队列（${reviewQueueCount}）`" name="review" />
      <el-tab-pane :label="`审核中（${reviewCount}）`" name="reviewing" />
    </el-tabs>
    <!-- 列表数据 -->
    <div class="table-box" :class="{'no-border': activeName === 'retouch'}">
      <!-- 搜索框 -->
      <div class="search-button search-box">
        <!-- 修图标准 -->
        <div class="retouch-type search-item">
          <span>修图标准</span>
          <Retouch-kind-select v-model="retouchType" all-optision />
        </div>
        <div class="button-box">
          <el-button type="primary" @click="getList(1)">查询</el-button>
        </div>
      </div>
      <work-board-table
        key="boardTable"
        :show-checker="searchType === 'check'"
        :table-data="tableData"
        @urgentSuccess="onUrgent"
      />
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
    <el-drawer
      :show-close="false"
      append-to-body
      :visible.sync="showFlowBoard"
      custom-class="flow-drawer"
      size="50%"
    >
      <flow-board :visible.sync="showFlowBoard" />
    </el-drawer>
  </div>
</template>

<script>
import FlowBoard from './components/FlowBoard'
import WorkBoardTable from './components/WorkBoardTable'
import RetouchKindSelect from '@SelectBox/RetouchKindSelect'
import * as AdminManage from '@/api/adminManage'

export default {
  name: 'WorkBoard',
  components: { FlowBoard, RetouchKindSelect, WorkBoardTable },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      urgentSearch: { // 加急搜索
        name: '',
        id: '',
        caid: ''
      },
      showFlowBoard: false, // 是否显示流量看板
      activeName: 'retouch', // retouch 修图队列 retouching 修图中 review 审核队列 reviewing 审核中
      retouchType: '', // 修图标准
      retouchState: 0, // 状态
      reviewCount: 0, // 审核中数量
      retouchCount: 0, // 修图中数量
      retouchQueueCount: 0, // 修图队列数量
      reviewQueueCount: 0, // 审核队列数量
      tableData: [], // 列表数据
      searchTableData: [], // 加急搜索数据
      urgentPager: {
        page: 1,
        pageSize: 10,
        total: 10
      },
      pager: {
        page: 1,
        pageSize: 10,
        total: 10
      }
    }
  },
  computed: {
    searchType () {
      const retouch = ['retouch', 'retouching']
      return retouch.includes(this.activeName) ? 'retouch' : 'check'
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
     * @description 展示流量看板
     */
    showFlow () {
      this.showFlowBoard = true
    },
    /**
     * @description 监听到加急
     */
    onUrgent (type) {
      if (type === 'urgent') {
        this.getStreamList(1)
      } else {
        this.getList(1)
      }
    },
    /**
     * @description 获取请求参数
     */
    getParams () {
      const req = {
        page: this.pager.page,
        pageSize: this.pager.pageSize,
        streamState: this.activeName
      }
      if (this.retouchType) { req.retoucherStandard = this.retouchType }
      return req
    },
    /**
     * @description 获取列表数据
     */
    getList (page) {
      if (this.activeName === 'retouching' || this.activeName === 'reviewing') {
        this.getRetouchStreamList(page)
      } else {
        this.getQueueStreamList(page)
      }
    },
    async getQueueStreamListCount () {
      const data = await AdminManage.queueStreamListCount()
      this.retouchCount = data.retouchCount
      this.retouchQueueCount = data.retouchQueueCount
      this.reviewCount = data.reviewCount
      this.reviewQueueCount = data.reviewQueueCount
    },
    /**
     * @description 获取修图或审核中流水列表
     */
    async getRetouchStreamList (page) {
      try {
        if (page) { this.pager.page = page }
        this.$store.dispatch('setting/showLoading', this.routeName)
        const req = this.getParams()
        const data = await AdminManage.getRetouchStreamList(req)
        this.tableData = data.list
        this.pager.total = data.total
        await this.getQueueStreamListCount()
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    },
    /**
     * @description 获取待修图或待审核的流水
     */
    async getQueueStreamList (page) {
      try {
        if (page) { this.pager.page = page }
        this.$store.dispatch('setting/showLoading', this.routeName)
        const req = this.getParams()
        const data = await AdminManage.getQueueStreamList(req)
        this.tableData = data.list
        this.pager.total = data.total
        await this.getQueueStreamListCount()
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    },
    /**
     * @description 加急流水查询
     */
    async getStreamList (page) {
      try {
        if (page) { this.urgentPager.page = page }
        const req = {}
        if (this.urgentSearch.name) { req.customerName = this.urgentSearch.name }
        if (this.urgentSearch.id) { req.orderNum = this.urgentSearch.id }
        if (this.urgentSearch.caid) { req.streamNum = this.urgentSearch.caid }
        if (!Object.keys(req).length) {
          this.$newMessage.warning('请填写参数')
          return false
        }
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await AdminManage.getStreamList(req)
        if (data.list.length === 0) {
          this.$newMessage.warning('暂无数据')
        }
        this.searchTableData = data.list
        this.urgentPager.total = data.total
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

  .table-box {
    margin-top: 0;

    .search-box {
      margin-top: 0;
      margin-bottom: 24px;
    }
  }
}

.el-drawer__header {
  margin: 0;
  padding: 0;
}

body > .el-dialog__wrapper {
  overflow: hidden;
}

.flow-drawer,
.v-modal {
  top: @navbarHeight !important;
  height: @drawerHeight !important;
}
</style>
