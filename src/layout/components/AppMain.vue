<template>
  <section
    v-loading.lock="isLoading"
    element-loading-custom-class="main-loading"
    class="app-main"
    :class="{'overhidden':isLoading}"
    @scroll="scrollMove"
  >
    <transition :name="transitionName" mode="out-in">
      <keep-alive :include="cachedViews" :max="4">
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
    ...mapGetters(['loadRoutes']),
    isLoading () {
      return this.loadRoutes.includes(this.$route.name)
    },
    cachedViews () {
      return this.$store.state.tagsView.cachedViews
    },
    key () {
      return this.$route.path
    },
    transitionName () {
      return ''
    }
  },
  methods: {
    /**
     * @description 监听页面
     */
    scrollMove (e) {
      const scrollTop = e.target.scrollTop
      if (scrollTop > 0) {
        document.body.style.setProperty('--boxShadow', '0px 2px 4px 0px rgba(0,0,0,0.08)')
      } else {
        document.body.style.setProperty('--boxShadow', '')
      }
    }
  }
}
</script>

<style lang="less" scoped>

.app-main {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  min-width: @minWidth;
  height: @appMainHeight;
  padding: @appMainPadding;
  margin-top: @headerHeight;
  overflow-x: hidden;
  overflow-y: overlay;
  scroll-behavior: smooth;
}

.fixed-header + .app-main {
  padding-top: 50px;
}
</style>

<style lang="less">

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
  position: fixed !important;
  top: 78px !important;
  left: @sideBarWidth !important;
  width: calc(~'100vw - @{sideBarWidth}');
}
</style>
