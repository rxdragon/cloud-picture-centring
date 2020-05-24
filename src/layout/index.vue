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
            <el-button
              class="refush-button"
              size="mini"
              icon="el-icon-refresh-left"
              circle
              @click="relink"
            />
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
      }).catch()
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
  height: @navbarHeight !important;
  padding: 0 !important;
  background: @gradualGray;
}

.el-aside {
  position: relative;
  width: @sideBarWidth !important;
  padding: 0 !important;
  margin-bottom: 0;
  line-height: inherit;
  background-color: #d3dce6;
}

.el-main {
  width: calc(~'100vw - @{sideBarWidth}');
  height: calc(~'100vh - @{navbarHeight}');
  padding: 0 !important;
  background-color: #f2f6fc;
  border-radius: 20px 0 0 20px;

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
    display: none;
    background: #fff;
  }

  ::-webkit-scrollbar-corner {
    display: none;
  }
}

.el-container .main-box {
  overflow: inherit;

  .web-state {
    position: fixed;
    top: 42px;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(~'100% - @{sideBarWidth}');
    height: 36px;
    line-height: 36px;
    color: #fb602d;
    text-align: center;
    background-color: #fdeae4;

    .refush-button {
      padding: 2px;
      margin-left: 10px;
      color: #fb602d;
      background-color: #fdeae4;
      border-color: #fb602d;

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
