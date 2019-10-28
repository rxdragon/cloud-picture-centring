<template>
  <section v-loading.lock="loading" element-loading-custom-class="main-loading" class="app-main" :class="{'overhidden':loading}">
    <transition :name="transitionName" mode="out-in">
      <keep-alive :include="cachedViews">
        <router-view :key="key" />
      </keep-alive>
    </transition>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'AppMain',
  computed: {
    cachedViews () {
      return this.$store.state.tagsView.cachedViews
    },
    key () {
      return this.$route.path
    },
    transitionName () {
      return ''
    },
    ...mapGetters(['loading'])
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";
.app-main {
  width: 100%;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  padding: @appMainPadding;
  box-sizing: border-box;
  min-width: @minWidth;
  height: @appMainHeight;
}

.fixed-header+.app-main {
  padding-top: 50px;
}
</style>

<style lang="less">
@import "~@/styles/variables.less";
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}

.overhidden {
  overflow: hidden !important;
}

.main-loading {
  top: 78px !important;
  left: @sideBarWidth !important;
  position: fixed !important;
  width: calc(~'100vw - @{sideBarWidth}');
}
</style>
