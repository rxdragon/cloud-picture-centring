<template>
  <div class="announcement-center-index">
    <transition name="fade" mode="out-in">
      <!-- 管理列表内容 -->
      <div class="list-content" v-if="showModule === MODULE_NAME.INDEX">
        <!-- 标题 -->
        <div class="header">
          <h3>公告管理</h3>
          <div class="header-plugin">
            <el-button type="primary" @click="showDetailPage">公告详情</el-button>
          </div>
        </div>
        <!-- 搜索框 -->
        <el-row class="search-box" :gutter="20">
          <!-- 通知时间 -->
          <el-col :span="8" :xl="6">
            <div class="date-search search-item">
              <span>通知时间</span>
              <date-picker v-model="timeSpan" />
            </div>
          </el-col>
          <!-- 公告标题 -->
          <el-col :span="8" :xl="6">
            <div class="date-search search-item">
              <span>公告标题</span>
              <el-input
                @keyup.native.enter="searchList(1)"
                v-model="announcementTitle"
                clearable
                placeholder="请输入标题"
              />
            </div>
          </el-col>
          <el-col :span="4" :xl="6">
            <div class="date-search search-item">
              <span>状态</span>
              <announcement-read-state v-model="readState" />
            </div>
          </el-col>
          <!-- 查询按钮 -->
          <el-col :span="4" :xl="2">
            <div class="search-button-box search-item">
              <el-button type="primary" @click="searchList(1)">查询</el-button>
            </div>
          </el-col>
        </el-row>
        
        <!--表格内容 -->
        <div class="table-box">
          <el-table :data="tableData" style="width: 100%;">
            <el-table-column prop="retouchAllTime" label="公告标题" />
            <el-table-column prop="name" label="类型" width="100" />
            <el-table-column prop="noiceTime" label="通知时间" />
            <el-table-column prop="createName" label="状态" />
            <el-table-column label="操作" width="200">
              <template slot-scope="{ id }">
                <el-button type="primary" size="mini">详情{{ id }}</el-button>
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

      <!-- 公告详情 -->
      <detail-announcement v-else @close="showListPage" />
    </transition>
  </div>
</template>

<script>
import '@toast-ui/editor/dist/toastui-editor.css'
import DatePicker from '@/components/DatePicker'
import AnnouncementReadState from '@/components/SelectBox/AnnouncementReadState'
import DetailAnnouncement from './components/DetailAnnouncement'

const MODULE_NAME = {
  INDEX: 'index',
  DETAIL: 'detail'
}

export default {
  name: 'AnnouncementCenterIndex',
  components: { DatePicker, AnnouncementReadState, DetailAnnouncement },
  data () {
    return {
      MODULE_NAME,
      timeSpan: null,
      announcementTitle: '',
      readState: '',
      showModule: MODULE_NAME.INDEX,
      pager: {
        page: 1,
        pageSize: 20,
        total: 100
      },
      tableData: []
    }
  },
  methods: {
    /**
     * @description 搜索列表
     */
    searchList (page) {
      this.pager.page = page ? page : this.pager.page
      this.getAnnouncementList()
    },
    /**
     * @description 获取公告列表
     */
    getAnnouncementList () {
      const reqData = {
        page: this.pager.page,
        pageSize: this.pager.pageSize
      }
      console.error(reqData)
    },
    /**
     * @description page变更
     */
    handleCurrentChange () {
      this.searchList()
    },
    /**
     * @description 展示列表页面
     */
    showListPage () {
      this.showModule = MODULE_NAME.INDEX
    },
    /**
     * @description 显示详细内容
     */
    showDetailPage () {
      this.showModule = MODULE_NAME.DETAIL
    },
  }
}
</script>

<style lang="less" scoped>
.search-box {
  flex-wrap: wrap;

  .search-item {
    margin-right: 0;

    & span {
      display: inline-block;
      flex-shrink: 0;
      text-align: left;
    }

    & /deep/ .el-range-editor.el-input__inner {
      width: 100% !important;
    }

    & /deep/ .date-picker,
    & /deep/ .issue-label-select,
    & /deep/ .evaluate-select,
    & /deep/ .cloud-spot-grass-select,
    & /deep/ .quality-select,
    & /deep/ .el-select,
    & /deep/ .return-select,
    & /deep/ .cloud-spot,
    & /deep/ .el-cascader {
      width: 100%;
    }
  }
}
</style>
