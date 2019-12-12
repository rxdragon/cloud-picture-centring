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
      <span class="nav-main">
        缦图云端 修图中心
        <span v-if="$isDev" class="test-title">测试</span>
      </span>
      <div class="nav-right">
        <download-management />
        <el-popover
          placement="bottom-start"
          width="200"
          popper-class="change-popover"
          trigger="click"
        >
          <div class="change-state">
            <ul>
              <li class="online-li" @click="setOnline">
                <div class="change-point" />
                <span class="change-text" :class="{'active': isOnline}">在线</span>
                <transition name="el-zoom-in-top">
                  <i v-show="isOnline" class="li-check el-icon-check" />
                </transition>
              </li>
              <li class="offline-li" @click="setOffline">
                <div class="change-point" />
                <span class="change-text" :class="{'active': !isOnline}">离线</span>
                <transition name="el-zoom-in-top">
                  <i v-show="!isOnline" class="li-check el-icon-check" />
                </transition>
              </li>
            </ul>
          </div>
          <el-avatar slot="reference" class="online-point" :class="isOnline ? 'online' : 'offline'" :src="userInfo.avatarImg" />
        </el-popover>
        <div class="online-state" :class="{ 'online': isOnline }">{{ isOnline ? '[在线]' : '[离线]' }}</div>
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
    ...mapGetters(['userInfo', 'lineState']),
    isOnline () {
      return this.lineState === 'online'
    }
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
     * @description 上线
     */
    setOnline () {
      this.$store.dispatch('user/setUserlineState', 'online')
    },
    setOffline () {
      this.$store.dispatch('user/setUserlineState', 'offline')
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

      .change-popover {
        outline: none;
      }

      .download-management {
        margin-right: 20px;
      }

      .el-avatar {
        width: 24px;
        height: 24px;
        border: 1px solid #fff;
        margin-right: 6px;
        cursor: pointer;
      }

      .online-point {
        position: relative;
        overflow: inherit;

        img {
          width: 100%;
          border-radius: 50%;
        }

        &::after {
          content: '';
          display: block;
          width: 8px;
          height: 8px;
          background-color: #909399;
          position: absolute;
          bottom: -2px;
          right: -2px;
          border-radius: 50%;
        }

        &::before {
          content: '';
          display: block;
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background-color: #fff;
          opacity: 0;
          border-radius: 50%;
          transition: all 0.3s;
        }
      }

      .online {
        color: @green !important;

        &::after {
          background-color: @green;
        }
      }

      .offline {
        position: relative;

        &::before {
          opacity: 0.6;
        }
      }

      .online-state {
        font-size: 14px;
        margin-right: 8px;
        font-weight: 500;
        color: #909399;
        transition: color 0.3s;
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

      .test-title {
        color: red;
        font-size: 40px;
        vertical-align: middle;
      }
    }
  }
}

.change-state {
  ul {
    margin: 0;
    list-style: none;
    padding: 0 12px;

    li {
      line-height: 34px;
      height: 34px;
      cursor: pointer;

      .change-point {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: @green;
        display: inline-block;
        margin-right: 12px;
      }

      .li-check {
        font-size: 16px;
        color: @blue;
        font-weight: 600;
        margin-top: 9px;
        float: right;
      }

      .change-text {
        font-weight: 500;
        font-size: 14px;
        color: #606266;

        &.active {
          color: @blue;
        }
      }

      &:hover {
        .change-text {
          color: @blue;
        }
      }
    }

    .online-li {
      .change-point {
        background-color: @green;
      }
    }

    .offline-li {
      .change-point {
        background-color: #909399;
      }
    }
  }
}
</style>
