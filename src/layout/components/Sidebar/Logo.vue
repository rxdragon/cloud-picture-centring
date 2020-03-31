<template>
  <div class="sidebar-logo-container">
    <transition name="sidebarLogoFade">
      <router-link key="expand" class="sidebar-logo-link" to="/">
        <div class="sidebar-logo iconmap-cloud-logo-small" />
      </router-link>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'SidebarLogo',
  data () {
    return {
      title: 'MAINTO'
    }
  }
}
</script>

<style lang="less" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 157px;
  overflow: hidden;
  text-align: center;

  .sidebar-logo-link {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100%;
    height: 100%;

    .sidebar-logo {
      width: 174px;
      height: 44px;
      vertical-align: middle;
    }

    .sidebar-title {
      display: inline-block;
      margin: 0;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      font-size: 14px;
      font-weight: 600;
      line-height: 50px;
      color: #fff;
      vertical-align: middle;
    }
  }

  &.collapse {
    .sidebar-logo {
      margin-right: 0;
    }
  }
}
</style>
