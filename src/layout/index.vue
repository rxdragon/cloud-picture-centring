<template>
  <el-container>
    <!-- 顶部 -->
    <el-header>
      <Navbar />
    </el-header>
    <!-- 内容 -->
    <el-container class="container-main">
      <!-- 菜单 -->
      <el-aside :class="{hideSidebar: false}" class="app-wrapper">
        <sidebar class="sidebar-container" />
      </el-aside>
      <!-- 内容 -->
      <el-main class="main-box">
        <TagsView />
        <AppMain />
      </el-main>
    </el-container>
    <!-- 弹出 -->
    <anniversary v-if="showAnniversary" />
  </el-container>
</template>

<script>
import { mapGetters } from 'vuex'
import { AppMain, Navbar, TagsView, Sidebar } from './components'
import Anniversary from '@/components/CongratulationComponents/Anniversary'
const { ipcRenderer } = window.require('electron')
export default {
  name: 'Layout',
  components: {
    AppMain,
    Navbar,
    TagsView,
    Sidebar,
    Anniversary
  },
  computed: {
    ...mapGetters(['showAnniversary'])
  },
  mounted () {
    ipcRenderer.on('version:find-new', (event, info) => {
      this.$confirm('', '发现现版本，是否重启更新', {
        confirmButtonText: '确定',
        center: true,
        type: 'warning'
      }).then(() => {
        ipcRenderer.send('version:do-upgrade')
      }).catch(() => {})
    })
    this.getAnniversary()
  },
  methods: {
    /**
     * @description 获取周年庆信息
     */
    async getAnniversary () {
      await this.$store.dispatch('notification/getAnniversary')
    }
  }
}
</script>

<style lang="less">
@import '../styles/variables.less';

.el-header {
  background: @gradualGray;
  padding: 0 !important;
  height: @navbarHeight !important;
}

.el-aside {
  background-color: #d3dce6;
  padding: 0 !important;
  position: relative;
  margin-bottom: 0;
  line-height: inherit;
  width: @sideBarWidth !important;
}

.el-main {
  height: calc(~'100vh - @{navbarHeight}');
  padding: 0 !important;
  border-radius: 20px 0 0 20px;
  background-color: #f2f6fc;
  width: calc(~'100vw - @{sideBarWidth}');

  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: #cdcdcd;
    border-radius: 10px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-button {
    background: #fff;
    display: none;
  }

  ::-webkit-scrollbar-corner {
    display: none;
  }
}

.el-container .main-box {
  overflow: inherit;
}

.container-main {
  background-color: #131923;
}

.tap-view {
  height: 34px;
  background-color: red;
}
</style>
