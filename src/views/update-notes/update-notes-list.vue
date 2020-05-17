<template>
  <div class="update-notes" v-loading="loading">
    <div class="header" :class="showBorder">
      <h3>更新日志</h3>
    </div>
    <div class="content-main">
      <div class="module-panel" v-for="(versionItem,index) in versionData" :key="index">
        <h3 class="version-title">版本更新：{{ versionItem.version_num }} <time>{{ formatTime(versionItem.version_time) }}</time></h3>
        <div v-html="versionItem.info" class="tui-editor-contents"></div>
      </div>
      <div ref="no-data-line">
        <el-divider>已经到底部啦</el-divider>
      </div>
    </div>
  </div>
</template>

<script>
import * as versionInfo from '@/api/version.js'
import 'tui-editor/dist/tui-editor-contents.css' // editor content

export default {
  name: 'updateNotesList',
  data () {
    return {
      versionData: [],
      showBorder: '',
      pager: {
        page: 0,
        pageSize: 2,
        total: 0
      },
      loading: true,
      loadAllData: false
    }
  },
  computed: {
    formatTime () {
      return function (val) {
        return val.substring(0,10) || ''
      }
    }
  },
  mounted () {
    this.observeScrollBottom()
  },
  methods: {
    getVersionInfo () {
      this.loading = true
      const params = {
        page: this.pager.page,
        pageSize: this.pager.pageSize
      }
      versionInfo.getVersionInfo(params).then(res => {
        if (res.data) {
          this.pager.page = res.current_page
          this.pager.total = res.total
          this.versionData.push(...res.data)
          this.loading = false
          this.loadAllData = (res.current_page - 1) * this.pager.pageSize + res.data.length === res.total
        }
      })
    },
    observeScrollBottom () {
      if (!this.$refs['no-data-line']) return false
      const callback = (e) => {
        const isIntersecting = e[0].isIntersecting
        if (isIntersecting && !this.loadAllData) {
          this.pager.page++
          this.getVersionInfo()
        }
      }
      const rootDom = document.querySelector('.app-main')
      const option = {
        root: rootDom,
        rootMargin: '0px 0px 50px 0px'
      }
      this.observer = new IntersectionObserver(callback, option)
      this.observer.observe(this.$refs['no-data-line'])
    },
  }
}
</script>

<style lang="less" scoped>
.header-box {
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
}

.version-title {
  font-weight: 400;

  time {
    margin-left: 20px;
    font-size: 14px;
    color: #989898;
  }
}

.content-main {
  height: auto;
  padding-right: 24px;
  margin-right: -24px;

  blockquote {
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

  .module-panel {
    margin-bottom: 24px;

    .page-box {
      margin-top: 30px;

      .el-pagination {
        display: flex;
        justify-content: flex-end;
      }
    }
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
