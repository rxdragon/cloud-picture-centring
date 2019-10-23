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
      <el-main>
        <TagsView />
        <AppMain />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { AppMain, Navbar, TagsView, Sidebar } from './components'
export default {
  name: 'Layout',
  components: {
    AppMain,
    Navbar,
    TagsView,
    Sidebar
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
  background-color: #D3DCE6;
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
  overflow: hidden !important;
}

.container-main {
  background-color: #131923;
}

.tap-view {
  height: 34px;
  background-color: red;
}
</style>
