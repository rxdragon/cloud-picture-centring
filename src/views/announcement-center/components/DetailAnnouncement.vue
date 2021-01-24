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
        <h3>【重要公告】标题内容</h3>
        <div class="announcement-desc">
          <div class="base-info">
            通知时间：2020-03-03 创建人：泰得
          </div>
          <div class="file-list">
            <div class="info-title">附加下载：</div>
            <div class="info-content">
              <div class="file-item">文件名.jpg <el-button type="text">下载</el-button></div>
              <div class="file-item">文件名.xml <el-button type="text">下载</el-button></div>
            </div>
          </div>
        </div>
      </div>
      <!-- 公告内容 -->
      <div class="announcement-content module-content">
        <div v-html="mock" class="tui-editor-contents"></div>
      </div>
    </div>
    <!-- 操作按钮 -->
    <div class="announcement-read">
      <el-button type="primary">我已阅读（10s）</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DetailAnnouncement',
  data () {
    return {
      mock: '<blockquote>\n<p>版本概况</p>\n</blockquote>\n<ul>\n<li>xxxx</li>\n<li><span class=\"mark-opt\" data-tomark-pass=\"\">优化</span>&nbsp;部分功能</li>\n<li><span class=\"mark-fix\" data-tomark-pass=\"\">修复</span>&nbsp;部分bug</li>\n</ul>\n<blockquote>\n<p>综合改动</p>\n</blockquote>\n<ul>\n<li>窗口\n<ol>\n<li>xxx</li>\n</ol>\n</li>\n<li>下载管理器\n<ol>\n<li>xxx</li>\n</ol>\n</li>\n<li>修图详情页面\n<ol>\n<li>xxx</li>\n</ol>\n</li>\n</ul>\n<blockquote>\n<p>修图师</p>\n</blockquote>\n<ul>\n<li>状态栏\n<ol>\n<li>xxxx</li>\n</ol>\n</li>\n<li>通知\n<ol>\n<li>xxxx</li>\n</ol>\n</li>\n<li>待修订单页面\n<ol>\n<li>xxxx</li>\n</ol>\n</li>\n<li>修图历史记录\n<ol>\n<li>xxxx</li>\n</ol>\n</li>\n<li>个人概况\n<ol>\n<li>xxxx</li>\n</ol>\n</li>\n</ul>\n<blockquote>\n<p>云端运营</p>\n</blockquote>\n<ul>\n<li>值班主管配置\n<ol>\n<li>xxxxx</li>\n</ol>\n</li>\n<li>绿色通道\n<ol>\n<li>xxxxx</li>\n</ol>\n</li>\n<li>组员修图报告\n<ol>\n<li>xxxxx</li>\n</ol>\n</li>\n</ul>\n<blockquote>\n<p>云端工作管理</p>\n</blockquote>\n<ul>\n<li>云端工作看板\n<ol>\n<li>xxxxx</li>\n</ol>\n</li>\n<li>伙伴绩效\n<ol>\n<li>xxxxx</li>\n</ol>\n</li>\n<li>看片评价\n<ol>\n<li>xxxxx</li>\n</ol>\n</li>\n</ul>\n<blockquote>\n<p>云学院</p>\n</blockquote>\n<ul>\n<li>云学院评价中心\n<ol>\n<li>xxxxx</li>\n</ol>\n</li>\n<li>评价历史记录\n<ol>\n<li>xxxxx</li>\n</ol>\n</li>\n<li>云学院评分配置\n<ol>\n<li>xxxxx</li>\n</ol>\n</li>\n</ul>\n'
    }
  },
  methods: {
    back () {
      this.$emit('close')
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
