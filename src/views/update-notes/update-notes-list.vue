<template>
  <div class="update-notes" v-loading="loading">
    <div class="header" :class="showBorder">
      <h3>更新日志</h3>
    </div>
    <div class="content-main" v-infinite-scroll="getVersionInfo" infinite-scroll-disabled="scrollLoadDisabled" infinite-scroll-distance="100">
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
import '@toast-ui/editor/dist/toastui-editor.css'

export default {
  name: 'updateNotesList',
  data () {
    return {
      versionData: [],
      showBorder: '',
      pager: {
        page: 0,
        pageSize: 5,
        total: 0
      },
      loading: false,
      loadAllData: false // 加载完所有
    }
  },
  computed: {
    // 格式化时间
    formatTime () {
      return function (val) {
        return val.substring(0,10) || ''
      }
    },
    // 判断是否可加载
    scrollLoadDisabled () {
      return this.loading || this.loadAllData
    }
  },
  methods: {
    /**
     * @description 获取版本分页数据
     */
    getVersionInfo () {
      this.loading = true
      const params = {
        page: ++this.pager.page,
        pageSize: this.pager.pageSize
      }
      versionInfo.getVersionInfo(params).then(res => {
        if (res.data) {
          this.pager.page = res.current_page
          this.pager.total = res.total
          this.versionData.push(...res.data)
          this.loadAllData = (res.current_page - 1) * this.pager.pageSize + res.data.length === res.total
        }
      }).finally(() => {
        this.loading = false
      })
    }
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
  padding-right: 24px;
  margin-right: -24px;
  overflow-y: auto;

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

  .el-divider > .el-divider__text {
    color: #dcdfe6;
    background-color: #f2f6fc;
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
