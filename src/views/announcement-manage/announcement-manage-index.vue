<template>
  <div class="announcement-manage-index">
    <transition name="fade" mode="out-in">
      <!-- 管理列表内容 -->
      <div class="list-content" v-if="showModule === MODULE_NAME.INDEX">
        <!-- 标题 -->
        <div class="header">
          <h3>公告管理</h3>
          <div class="header-plugin">
            <el-button type="primary" @click="showCreatePage">创建公告</el-button>
          </div>
        </div>
        <!-- 订单列表 -->
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
                v-model.trim="announcementTitle"
                clearable
                placeholder="请输入标题"
              />
            </div>
          </el-col>
          <!-- 查询按钮 -->
          <el-col :span="8" :xl="2">
            <div class="search-button-box search-item">
              <el-button type="primary" @click="searchList(1)">查询</el-button>
            </div>
          </el-col>
        </el-row>
        
        <!--表格内容 -->
        <div class="table-box">
          <el-table :data="tableData" style="width: 100%;">
            <el-table-column prop="title" label="公告标题" />
            <el-table-column prop="typeCN" label="类型" width="100" />
            <el-table-column prop="receiverTypeCN" label="通知人员" />
            <el-table-column prop="createdAt" label="创建时间" />
            <el-table-column prop="receiverTime" label="通知时间" />
            <el-table-column prop="creatorName" label="创建人" />
            <el-table-column label="操作" width="200" align="right">
              <template slot-scope="{ row }">
                <el-button
                  class="detail-button"
                  type="primary"
                  size="mini"
                  @click="showDetailPage(row.id)"
                >
                  详情
                </el-button>

                <el-popover
                  placement="top"
                  width="160"
                  v-model="row.deleteVisible"
                  v-if="showAnnouncementDelete"
                >
                  <p>确定删除该公告？</p>
                  <div style="margin-top: 12px; text-align: right;">
                    <el-button type="danger" size="mini" @click="deleteAnnouncement(row.id)">确定</el-button>
                  </div>
                  <el-button type="danger" size="mini" slot="reference">删除</el-button>
                </el-popover>
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

      <!-- 创建公告 -->
      <create-announcement v-else-if="showModule === MODULE_NAME.CREATE" @refresh="showListPage('refresh')" @close="showListPage" />

      <!-- 公告详情 -->
      <detail-announcement :announcementId="detailId" v-else @close="showListPage" />
    </transition>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import CreateAnnouncement from './components/CreateAnnouncement'
import DetailAnnouncement from './components/DetailAnnouncement'

import * as AnnouncementApi from '@/api/announcementApi'
import { joinTimeSpan } from '@/utils/timespan.js'
import { mapGetters } from 'vuex'

const MODULE_NAME = {
  INDEX: 'index',
  CREATE: 'create',
  DETAIL: 'detail'
}

export default {
  name: 'AnnouncementManageIndex',
  components: { DatePicker, CreateAnnouncement, DetailAnnouncement },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      MODULE_NAME,
      timeSpan: null, // 搜索标题
      announcementTitle: '', // 公告管理
      showModule: MODULE_NAME.INDEX,
      pager: {
        page: 1,
        pageSize: 20,
        total: 100
      },
      tableData: [],
      detailId: ''
    }
  },
  computed: {
    ...mapGetters(['showAnnouncementDelete']),
  },
  created () {
    this.searchList(1)
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
    async getAnnouncementList () {
      const reqData = {
        page: this.pager.page,
        pageSize: this.pager.pageSize,
        conds: {}
      }
      if (this.timeSpan) {
        reqData.conds.sendAtGte = joinTimeSpan(this.timeSpan[0]),
        reqData.conds.sendAtLte = joinTimeSpan(this.timeSpan[1], 1)
      }
      if (this.announcementTitle) { reqData.conds.titleLike = this.announcementTitle }
      if (!Object.keys(reqData.conds).length) delete reqData.conds

      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await AnnouncementApi.getAnnouncementManage(reqData)
        this.tableData = data.list
        this.pager.total = data.total
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 删除公告
     */
    async deleteAnnouncement (id) {
      const req = { id }
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        await AnnouncementApi.deleteAnnouncement(req)
        this.getAnnouncementList()
      } catch {}
    },
    /**
     * @description page变更
     */
    handleCurrentChange () {
      this.searchList()
    },
    /**
     * @description 创建页面
     */
    showCreatePage () {
      this.showModule = MODULE_NAME.CREATE
    },
    /**
     * @description 展示列表页面
     */
    showListPage (refresh) {
      this.showModule = MODULE_NAME.INDEX
      if (refresh) this.searchList(1)
    },
    /**
     * @description 显示列表详情
     */
    showDetailPage (id) {
      this.detailId = id
      this.showModule = MODULE_NAME.DETAIL
    }
  }
}
</script>

<style lang="less" scoped>
.detail-button {
  margin-right: 10px;
}

.table-box {
  margin-top: 0;
}
</style>
