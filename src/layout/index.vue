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
        <transition name="app-transform" mode="out-in">
          <div v-show="webSocketState === 'unConnect'" class="web-state">
            <i class="el-message__icon el-icon-error" />
            网络连接已断开
            <el-button class="refush-button" size="mini" icon="el-icon-refresh-left" circle @click="relink" />
          </div>
        </transition>
        <TagsView />
        <AppMain />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { AppMain, Navbar, TagsView, Sidebar } from './components'
import { mapGetters } from 'vuex'
const { ipcRenderer } = window.require('electron')
export default {
  name: 'Layout',
  components: {
    AppMain,
    Navbar,
    TagsView,
    Sidebar
  },
  computed: {
    ...mapGetters(['webSocketState'])
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
  },
  methods: {
    /**
     * @description 重新链接websocket
     */
    relink () {
      this.$ws.chat.start()
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
    width: 8px;
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

  .web-state {
    height: 36px;
    position: fixed;
    top: 42px;
    width: calc(~'100% - @{sideBarWidth}');
    z-index: 1000;
    background-color: #fdeae4;
    color: #fb602d;
    line-height: 36px;
    display: flex;
    text-align: center;
    justify-content: center;
    align-items: center;

    .refush-button {
      padding: 2px;
      background-color: #fdeae4;
      color: #fb602d;
      border-color: #fb602d;
      margin-left: 10px;

      &:hover {
        box-shadow: 4px 4px 2px 0 #d4d4d4;
      }
    }
  }
}

.container-main {
  background-color: #131923;
}

.tap-view {
  height: 34px;
  background-color: red;
}
</style>
