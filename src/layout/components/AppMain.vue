<template>
  <section
    v-loading.lock="isLoading"
    element-loading-custom-class="main-loading"
    class="app-main"
    :class="{ 'overhidden':isLoading,
              'micro-main': microApp,
              'home-main': isHome
    }"
    @scroll="scrollMove"
  >
    <transition v-show="!microApp" :name="transitionName" mode="out-in">
      <keep-alive :include="cachedViews" :max="4">
        <router-view :key="key" />
      </keep-alive>
    </transition>
    <div v-show="microApp" id="picture-online"></div>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import { loadApp } from '@/utils/qiankun.js'

export default {
  name: 'AppMain',
  computed: {
    ...mapGetters(['loadRoutes', 'isOnlineWatcher']),
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
    },
    /**
     * @description 是否是首页
     */
    isHome () {
      return this.$route.name === 'Home'
    },
    // 是否是微前端
    microApp () {
      return _.get(this.$route, 'meta.microApp') || false
    }
  },
  mounted () {
    // 加载微前端
    if (this.isOnlineWatcher) {
      // eslint-disable-next-line no-console
      console.log(`%c LOAD_MICRO_WEB`, 'color:#3d91cf; font-weight: bold')
      // loadApp()
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
  transition: all 0.3s;

  &.micro-main {
    height: @microAppMainHeight;
    padding: 0;
    margin-top: 0;
  }

  &.home-main {
    height: @microAppMainHeight;
    margin-top: 0;
  }
}

#picture-online {
  height: 100%;
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
