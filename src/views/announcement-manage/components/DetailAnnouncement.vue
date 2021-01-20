<template>
  <div class="detail-announcement">
    <!-- 标题 -->
    <div class="header">
      <h3>公告详情</h3>
      <div class="header-plugin">
        <el-button type="info" @click="back">返回</el-button>
      </div>
    </div>
    <div class="announcement-info">
      <div class="announcement-row">
        <div class="info-title">公告标题</div>
        <div class="info-content">公告标题公告标题公告标题公告标题公告标题</div>
      </div>
      <div class="announcement-row">
        <div class="info-title">公告类型</div>
        <div class="info-content">重要公告</div>
      </div>
      <div class="announcement-row">
        <div class="info-title">公告简介</div>
        <div class="info-content">公告简介公告简介公告简介公告简介</div>
      </div>
      <div class="announcement-row">
        <div class="info-title">公告内容</div>
        <div class="info-content module-panel">
          <div v-html="mock" class="tui-editor-contents"></div>
        </div>
      </div>
      <div class="announcement-row">
        <div class="info-title">附加文件</div>
        <div class="info-content">
          <p>文件名.jpg <el-button type="text">下载</el-button></p>
          <p>文件名.xml <el-button type="text">下载</el-button></p>
        </div>
      </div>
      <div class="announcement-row">
        <div class="info-title">通知对象</div>
        <div class="info-content">全体云端伙伴</div>
      </div>
      <div class="announcement-row">
        <div class="info-title">通知时间</div>
        <div class="info-content">2020-10-22 12:00:00</div>
      </div>
      <div class="announcement-row">
        <div class="info-title">未查看伙伴</div>
        <div class="info-content">122位未查看 收起明细</div>
      </div>
    </div>
  </div>
</template>

<script>
import '@toast-ui/editor/dist/toastui-editor.css'

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
  .announcement-row {
    display: flex;
    margin-bottom: 24px;

    .info-title {
      flex-shrink: 0;
      width: 80px;
      margin-right: 12px;
    }

    .info-content {
      width: 100%;
    }
  }
}
</style>
