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
            <div class="info-content">公告标题公告标题公告标题公告标题公告标题</div>
          </div>
          <!-- 公告类型 -->
          <div class="base-info-item">
            <div class="info-title">公告类型：</div>
            <div class="info-content">重要公告</div>
          </div>
        </div>
        <!-- 公告简介 -->
        <div class="base-row d-g1">
          <div class="base-info-item">
            <div class="info-title">公告简介：</div>
            <div class="info-content">公告简介公告简介公告简介公告简介</div>
          </div>
        </div>
        <div class="base-row d-g2">
          <!-- 通知对象 -->
          <div class="base-info-item">
            <div class="info-title">通知对象：</div>
            <div class="info-content">全体云端伙伴</div>
          </div>
          <!-- 通知时间 -->
          <div class="base-info-item">
            <div class="info-title">通知时间：</div>
            <div class="info-content">2020-10-22 12:00:00</div>
          </div>
        </div>
        <div class="base-row d-g1">
          <!-- 附加文件 -->
          <div class="base-info-item">
            <div class="info-title">附加文件：</div>
            <div class="info-content file-list">
              <div class="file-item"><i class="iconfont icon-filetext"></i> 文件名.jpg <el-button type="text">下载</el-button></div>
              <div class="file-item"><i class="iconfont icon-filetext"></i> 文件名.xml <el-button type="text">下载</el-button></div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel-title">通告内容</div>
      <div class="announcement-content module-content">
        <div v-html="mock" class="tui-editor-contents"></div>
      </div>

      <div class="panel-title">
        未查看伙伴
        <div class="panel-slot">
          <el-button type="text">收起明细</el-button>
        </div>
      </div>
      <div class="people-list module-content">122位未查看 收起明细</div>
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
    padding: 17px 20px;
    font-size: 14px;
    font-weight: 400;
    line-height: 28px;
    color: #909399;
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
