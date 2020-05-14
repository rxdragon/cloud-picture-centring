<template>
  <div class="update-notes">
    <div class="header" :class="showBorder">
      <h3>更新日志</h3>
    </div>
    <div class="content-main" @scroll="scrollMove" v-loading="loading">
      <div class="module-panel">
        <h3 class="version-title">版本更新：{{ versionData.version_num }} <time>{{ versionData.version_time }}</time></h3>
        <div v-html="versionData.info" class="content"></div>
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
  </div>
</template>

<script>
import * as versionInfo from '@/api/version.js'

export default {
  name: 'UpdateNotesList',
  data () {
    return {
      versionData: {},
      showBorder: '',
      pager: {
        page: 1,
        pageSize: 1,
        total: 0
      },
      loading: true
    }
  },
  created () {
    this.getVersionInfo()
  },
  methods: {
    scrollMove (e) {
      const scrollTop = e.target.scrollTop
      this.showBorder = scrollTop > 0 ? 'header-box' : ''
    },
    getVersionInfo () {
      this.loading = true
      const params = {
        page: this.pager.page,
        pageSize: this.pager.pageSize
      }
      versionInfo.getVersionInfo(params).then(res => {
        if (res) {
          this.pager.page = res.current_page
          this.pager.total = res.total
          res.data[0].version_time = res.data[0].version_time.substring(0,10)
          this.versionData = res.data[0]
          this.loading = false
        }
      })
    },
    handleCurrentChange (currentPage) {
      this.pager.page = currentPage
      this.getVersionInfo()
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
  height: auto;
  padding-right: 24px;
  margin-right: -24px;

  .content {
    margin-top: 10px;
    font-size: 13px;

    /deep/ blockquote {
      padding: 5px 15px;
      margin: 0;
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

    strong {
      padding: 1px 5px;
      font-size: 11px;
      color: #ff502c;
      vertical-align: baseline;
      background-color: #fff5f5;
      border-radius: 3px;
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
</style>
