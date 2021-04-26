<template>
  <div class="detail-announcement">
    <!-- 标题 -->
    <div class="header">
      <h3>公告详情</h3>
      <div class="header-plugin">
        <el-button type="info" @click="back">返回</el-button>
      </div>
    </div>
    <!-- 详情 -->
    <div class="announcement-info module-panel">
      <div class="panel-title">基本信息</div>
      <div class="base-info module-content">
        <!-- 基本信息 -->
        <div class="base-row d-g2">
          <!-- 公告标题 -->
          <div class="base-info-item">
            <div class="info-title">公告标题：</div>
            <div class="info-content">{{ announcementInfo.title }}</div>
          </div>
          <!-- 公告类型 -->
          <div class="base-info-item">
            <div class="info-title">公告类型：</div>
            <div class="info-content">{{ announcementInfo.typeCN }}</div>
          </div>
        </div>
        <!-- 公告简介 -->
        <div class="base-row d-g1">
          <div class="base-info-item">
            <div class="info-title">公告简介：</div>
            <div class="info-content">{{ announcementInfo.brief }}</div>
          </div>
        </div>
        <div class="base-row d-g2">
          <!-- 通知对象 -->
          <div class="base-info-item">
            <div class="info-title">通知对象：</div>
            <div class="info-content">{{ announcementInfo.receiverTypeCN }}</div>
          </div>
          <!-- 通知时间 -->
          <div class="base-info-item">
            <div class="info-title">通知时间：</div>
            <div class="info-content">{{ announcementInfo.receiverTime }}</div>
          </div>
        </div>
        <div
          class="base-row d-g1"
          v-if="announcementInfo.files && announcementInfo.files.length"
        >
          <!-- 附加文件 -->
          <div class="base-info-item">
            <div class="info-title">附加文件：</div>
            <div class="info-content file-list">
              <div class="file-item" v-for="item in announcementInfo.files" :key="item.name">
                <i class="iconfont icon-filetext"></i>
                {{ item.name }}
                <el-button type="text" @click="downFile(item.path)">下载</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel-title">通告内容</div>
      <div class="announcement-content module-content">
        <div v-html="announcementInfo.content" class="tui-editor-contents"></div>
      </div>

      <div class="panel-title" v-if="unreadRecordList.length">
        未查看伙伴
        <div class="panel-slot">
          <div class="unread-item">{{ unreadRecordList.length }}人未读</div>
          <el-button type="text" @click="showStaffList">{{ showAll ? '收起明细' : '展开明细' }}</el-button>
        </div>
      </div>
      <div class="people-list module-content" :class="showAll && 'show-all'">
        <span class="staff-item" v-for="staff in unreadRecordList" :key="staff.staffId">
          {{ staff.name }}（{{ staff.staffId }}）
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import '@toast-ui/editor/dist/toastui-editor.css'
import * as AnnouncementApi from '@/api/announcementApi'
import DownIpc from '@electronMain/ipc/DownIpc'

export default {
  name: 'DetailAnnouncement',
  props: {
    announcementId: { type: [String, Number], required: true }
  },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      announcementInfo: {},
      unreadRecordList: [],
      showAll: false
    }
  },
  watch: {
    announcementId: {
      handler (value) {
        if (!value) return
        this.initPageInfo(value)
      },
      immediate: true
    }
  },
  methods: {
    /**
     * @description 关闭页面
     */
    back () {
      this.$emit('close')
    },
    /**
     * @description 初始化页面
     */
    async initPageInfo (id) {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        await this.getAnnouncementDetail(id)
        await this.getAllRecordList(id)
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 获取公告详情
     */
    async getAnnouncementDetail (id) {
      const req = { id }
      const res = await AnnouncementApi.getAnnouncementDetail(req)
      this.announcementInfo = res
    },
    /**
     * @description 获取发送记录
     */
    async getAllRecordList (id) {
      const recordList = []
      const req = {
        id,
        page: 1,
        pageSize: 100
      }
      await this.getRecordList(req, recordList)
      const unreadRecordList = recordList.filter(item => !item.read)
      this.unreadRecordList = unreadRecordList.map(item => {
        const name = _.get(item, 'staff_info.nickname') || _.get(item, 'staff_info.name') || '-'
        const staffId = _.get(item, 'staff_info.id') || '-'
        return {
          staffId,
          name
        }
      })
    },
    /**
     * @description 循环读取信息
     */
    async getRecordList (req, recordList) {
      const res = await AnnouncementApi.recordList(req)
      recordList.push(...res.list)
      if (req.page < res.pages) {
        req.page++
        await this.getRecordList(req, recordList)
      } else {
        return recordList
      }
    },
    /**
     * @description 下载文件
     */
    downFile (url) {
      const data = {
        url,
        path: ''
      }
      DownIpc.addDownloadFile(data)
    },
    /**
     * @description 张开收起列表
     */
    showStaffList () {
      this.showAll = !this.showAll
    }
  }
}
</script>

<style lang="less" scoped>
.d-g1 {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
}

.d-g2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}

.detail-announcement {
  .module-content {
    padding: 0 20px;
    margin-bottom: 24px;
    background: #fafafa;
    border-radius: 4px;
  }

  .panel-title {
    margin-bottom: 20px;
  }

  .base-row {
    padding: 20px 0;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
    color: #303133;
    border-bottom: 1px solid #ebeef5;

    &:nth-last-child(1) {
      border-bottom: none;
    }

    .base-info-item {
      display: flex;
      align-items: flex-start;

      .file-list {
        display: flex;
        font-size: 12px;
        font-weight: 400;
        line-height: 22px;
        color: #606266;

        .file-item {
          margin-right: 48px;

          .iconfont {
            font-size: 12px;
          }
        }

        .el-button--text {
          padding: 0;
          font-size: 12px;
        }
      }
    }
  }

  .announcement-content {
    padding: 12px 20px;
    color: #303133;

    /deep/ blockquote {
      padding: 5px 15px;
      font-size: 16px;
      font-weight: 900;
      background-color: #efeeee;
      border-color: #42b983;
      border-left-style: solid;
      border-left-width: 4px;

      p {
        color: #545454;
      }
    }
  }

  .people-list {
    max-height: 52px;
    padding: 17px 20px;
    overflow: hidden;
    font-size: 14px;
    font-weight: 400;
    line-height: 28px;
    color: #909399;
    transition: all 0.3s;

    .staff-item {
      display: inline-block;
      width: 200px;
    }

    &.show-all {
      max-height: 4000px;
    }
  }

  .unread-item {
    display: inline-block;
    margin-right: 24px;
    font-size: 12px;
    color: @blue;
  }
}

.mark-new {
  color: #3bbc7f;
}

.mark-opt {
  color: #ff8f00;
}

.mark-fix {
  color: #ff3974;
}
</style>
