<template>
  <div class="Navbar">
    <div class="navbar-main">
      <div class="nav-left">
        <el-button class="icon-button" icon="el-icon-arrow-left" @click="back" />
        <el-button class="icon-button" icon="el-icon-arrow-right" @click="go" />
        <el-button
          class="icon-button refresh"
          icon="el-icon-refresh-right"
          @mousedown.native="realRefreshStar"
          @mouseup.native="realRefreshEnd"
          @click="throttleRefresh"
        />
      </div>
      <span class="nav-main">缦图云端 修图中心</span>
      <div class="nav-right">
        <download-management />
        <el-avatar :src="userInfo.avatarImg" />
        <div class="user-name">{{ userInfo.nickname || userInfo.name }}</div>
        <div class="label">{{ userInfo.departmentName }}</div>
        <el-button class="icon-button" icon="iconfont iconlogin-out" @click="logout" />
      </div>
    </div>
  </div>
</template>

<script>
import DownloadManagement from '@/components/DownloadManagement'

import * as User from '@/api/user.js'
import { throttle } from '@/utils/throttle.js'
import { mapGetters } from 'vuex'
export default {
  name: 'Navbar',
  components: { DownloadManagement },
  data () {
    return {
      throttleRefresh: throttle(this.refresh, 1000),
      starTime: null,
      deplay: 3000
    }
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  mounted () {
    this.$ipcRenderer.on('enter-full', (e, item) => {
      document.body.style.setProperty('--navbarMainLeft', '30px')
    })
    this.$ipcRenderer.on('leave-full', (e, item) => {
      document.body.style.setProperty('--navbarMainLeft', '120px')
    })
  },
  methods: {
    /**
     * @description 返回
     */
    back () {
      this.$router.go(-1)
    },
    /**
     * @description 前进
     */
    go () {
      this.$router.go(1)
    },
    /**
     * @description 刷新
     */
    refresh () {
      const view = this.$route
      this.$store.dispatch('tagsView/delCachedView', view).then(() => {
        const { fullPath } = view
        this.$nextTick(() => {
          this.$router.replace({
            path: '/redirect' + fullPath
          })
        })
      })
    },
    /**
     * @description 鼠标点击
     */
    realRefreshStar () {
      this.starTime = new Date().getTime()
    },
    /**
     * @description 鼠标拿起
     */
    realRefreshEnd () {
      const endTime = new Date().getTime()
      if (!this.starTime) return
      if (endTime - this.starTime > this.deplay) {
        window.location.reload()
      }
    },
    /**
     * @description 退出登录
     */
    logout () {
      User.logout()
        .then(() => {
          this.$router.push('/login')
        })
    }
  }
}
</script>

<style lang="less">
@import "~@/styles/variables.less";

.Navbar {
  width: 100%;
  height: 100%;

  .navbar-main {
    margin-left: var(--navbarMainLeft);
    height: 100%;
    width: calc(100% - var(--navbarMainLeft));
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s;

    .nav-left {
      .icon-button {
        padding: 0;
        width: 24px;
        height: 24px;
      }

      .refresh {
        margin-left: 28px;
      }
    }

    .nav-right {
      display: flex;
      align-items: center;
      -webkit-user-select: none;

      .download-management {
        margin-right: 20px;
      }

      .el-avatar {
        width: 24px;
        height: 24px;
        border: 1px solid #fff;
        margin-right: 6px;
      }

      .user-name {
        font-size: 14px;
        margin-right: 8px;
      }

      .label {
        margin-right: 10px;
      }

      .icon-button {
        background-color: transparent;
        padding: 0;
        width: 24px;
        height: 24px;
      }
    }

    .nav-main {
      text-align: center;
      line-height: @navbarHeight;
      height: 100%;
      width: 50%;
      cursor: pointer;
      -webkit-app-region: drag;
      -webkit-user-select: none;
    }
  }
}
</style>
