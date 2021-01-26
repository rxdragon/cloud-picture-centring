<template>
  <div class="detail-announcement">
    <!-- 标题 -->
    <div class="header">
      <h3>公告详情</h3>
      <div class="header-plugin">
        <el-button type="info" @click="back">返回</el-button>
      </div>
    </div>
    <!-- 公告内容 -->
    <div class="announcement-info module-panel">
      <div class="announcement-header">
        <h3>{{ announcementInfo.title }}</h3>
        <div class="announcement-desc">
          <div class="base-info">
            通知时间：{{ announcementInfo.receiverTime }} 创建人：{{ announcementInfo.creatorName }}
          </div>
          <div class="file-list" v-if="announcementInfo.files.length">
            <div class="info-title">附加下载：</div>
            <div class="info-content">
              <div class="file-item" v-for="fileItem in announcementInfo.files" :key="fileItem.name">
                {{ fileItem.name }}
                <el-button type="text" @click="downFile(fileItem.path)">下载</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 公告内容 -->
      <div class="announcement-content module-content">
        <div v-html="announcementInfo.content" class="tui-editor-contents"></div>
      </div>
    </div>
    <!-- 操作按钮 -->
    <div class="announcement-read" v-if="!read">
      <el-button @click="readAnnouncement" type="primary" :disabled="!checkTimeDown">我已阅读<span v-if="countDownTime">（{{ countDownTime }}s）</span></el-button>
    </div>
  </div>
</template>

<script>
import * as AnnouncementApi from '@/api/announcementApi'
import DownIpc from '@electronMain/ipc/DownIpc'
import { READ_STATE } from '@/utils/enumerate'

// TODO 接口链条
export default {
  name: 'DetailAnnouncement',
  props: {
    announcementId: { type: [String, Number], required: true }
  },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      announcementInfo: {
        files: []
      },
      read: false,
      checkTimeDown: false,
      countDownTime: 10
    }
  },
  watch: {
    announcementId: {
      handler (value) {
        if (!value) return
        this.initPageInfo(value)
      },
      immediate: true
    },
  },
  methods: {
    /**
     * @description 返回上一级
     */
    back () {
      this.$emit('close')
    },
    /**
     * @description 初始化页面
     */
    async initPageInfo (id) {
      await this.getAnnouncementDetail(id)
    },
    /**
     * @description 获取公告详情
     */
    async getAnnouncementDetail (id) {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const req = { id }
        const res = await AnnouncementApi.getAnnouncementUserDetail(req)
        this.announcementInfo = res
        this.read = res.readState === READ_STATE.READ
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
      
      if (!this.read) {
        const fn = this.timeCirculation(() => {
          this.countDownTime--
          if (this.countDownTime === 0) {
            this.checkTimeDown = true
          }
          if (!this.checkTimeDown) fn()
        })
        fn()
      }
    },
    /**
     * @description 已读
     */
    async readAnnouncement () {
      try {
        if (!this.checkTimeDown) return
        this.$store.dispatch('setting/showLoading', this.routeName)
        const req = { id: this.announcementInfo.id }
        await AnnouncementApi.readAnnouncement(req)
        this.read = true
        this.$emit('refresh')
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
      
    },
    /**
     * @description 倒计时
     */
    timeCirculation (fn, time = 1000) {
      let timeOut = null
      return function () {
        clearTimeout(timeOut)
        timeOut = setTimeout(() => {
          fn.apply(this, arguments)
        }, time)
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
    }
  }
}
</script>

<style lang="less" scoped>
.announcement-info {
  padding: 0;

  .announcement-header {
    padding: 28px 24px;
    border-bottom: 1px solid #ebeef5;

    .announcement-desc {
      display: flex;
      justify-content: space-between;
      margin-top: 12px;
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #606266;

      .file-list {
        display: flex;

        .info-content {
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
  }

  .announcement-content {
    width: 750px;
    min-height: 500px;
    padding: 12px 20px;
    margin: auto;
    background: #fafafa;
    border-radius: 4px;
  }
}

.announcement-read {
  margin: 24px;
  text-align: center;
}
</style>
