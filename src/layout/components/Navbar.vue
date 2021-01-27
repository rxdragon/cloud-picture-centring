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
      </span>
      <div class="nav-right">
        <information-switch v-if="showInformation" />
        <workbench-switch v-if="hasWorkbench" />
        <download-management />
        <!-- 修图师在线功能 -->
        <el-popover
          v-if="isRetoucher"
          placement="bottom-start"
          width="200"
          popper-class="change-popover"
          trigger="click"
        >
          <div class="change-state">
            <ul>
              <li class="online-li" @click="setOnline">
                <div class="change-point" />
                <span
                  class="change-text"
                  :class="{'active': isOnline, 'disabled-li': loading}"
                >在线
                </span>
                <transition name="el-zoom-in-top">
                  <i v-show="isOnline" class="li-check el-icon-check" />
                </transition>
              </li>
              <li class="offline-li" @click="setOffline">
                <div class="change-point" />
                <span
                  class="change-text"
                  :class="{'active': !isOnline, 'disabled-li': loading}"
                >离线
                </span>
                <transition name="el-zoom-in-top">
                  <i v-show="!isOnline" class="li-check el-icon-check" />
                </transition>
              </li>
            </ul>
          </div>
          <el-avatar
            slot="reference"
            class="online-point"
            :class="isOnline ? 'online' : 'offline'"
            :src="userInfo.avatarImg"
          />
        </el-popover>
        <div v-if="isRetoucher" class="online-state" :class="{ 'online': isOnline }">{{ isOnline ? '[在线]' : '[离线]' }}</div>
        <!-- 非修图师 -->
        <el-avatar v-if="!isRetoucher" slot="reference" :src="userInfo.avatarImg" />
        <div class="user-name">{{ userInfo.nickname || userInfo.name }}</div>
        <div class="label">{{ userInfo.departmentName }}</div>
        <el-button class="icon-button" icon="iconfont iconlogin-out" @click="logout" />
      </div>
    </div>
  </div>
</template>

<script>
import DownloadManagement from '@/components/DownloadManagement'
import WorkbenchSwitch from './WorkbenchSwitch'
import InformationSwitch from './InformationSwitch'

import * as User from '@/api/user.js'
import * as Retoucher from '@/api/retoucher.js'
import { throttle } from '@/utils/throttle.js'
import { mapGetters } from 'vuex'

export default {
  name: 'Navbar',
  components: { DownloadManagement, WorkbenchSwitch, InformationSwitch },
  data () {
    return {
      throttleRefresh: throttle(this.refresh, 1000),
      starTime: null,
      deplay: 3000,
      loading: false
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'lineState', 'isRetoucher', 'hasWorkbench', 'showInformation']),
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
      if (this.loading || this.isOnline) return
      this.loading = true
      Retoucher.changeOnline()
        .then(() => {
          this.$store.dispatch('user/setUserlineState', 'online')
        })
        .catch(err => {
          this.$newMessage.error('上线失败')
          console.error(err)
        })
        .finally(() => {
          this.loading = false
        })
    },
    /**
     * @description 下线
     */
    setOffline () {
      if (this.loading || !this.isOnline) return
      this.loading = true
      Retoucher.changeOffline()
        .then(() => {
          this.$store.dispatch('user/setUserlineState', 'offline')
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.loading = false
        })
    },
    async logoutReset () {
      await User.logout()
      const userInfo = {
        id: '',
        name: '',
        nickname: '',
        departmentName: '',
        avatarImg: '',
      }
      this.$store.commit('user/SET_USERINFO', userInfo)
      this.$ws.stopLink()
      this.$router.push('/login')
    },
    /**
     * @description 退出登录
     */
    async logout () {
      try {
        if (!this.isRetoucher) {
          await this.logoutReset()
          return
        } else {
          Retoucher.changeOffline()
            .then(async () => {
              await this.logoutReset()
            })
            .catch(() => {
              this.$confirm('', '您当前有需要处理的订单暂不可退出系统', {
                confirmButtonText: '确定',
                center: true,
                type: 'warning',
                customClass: 'check-online',
                showCancelButton: false,
                closeOnPressEscape: false,
                showClose: false,
                closeOnClickModal: false
              })
            })
        }
      } catch (error) {
        console.error(error)
        this.$newMessage.error(error)
      }
    }
  }
}
</script>

<style lang="less">

.Navbar {
  width: 100%;
  height: 100%;
  -webkit-app-region: drag;

  .navbar-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: calc(100% - var(--navbarMainLeft));
    height: 100%;
    margin-left: var(--navbarMainLeft);
    transition: all 0.3s;

    .nav-left {
      -webkit-app-region: no-drag;

      .icon-button {
        width: 24px;
        height: 24px;
        padding: 0;
      }

      .refresh {
        margin-left: 28px;
      }
    }

    .nav-right {
      display: flex;
      align-items: center;
      -webkit-user-select: none;
      -webkit-app-region: no-drag;

      .download-management {
        margin-right: 20px;
      }

      .el-avatar {
        width: 24px;
        height: 24px;
        margin-right: 6px;
        cursor: pointer;
        border: 1px solid #fff;
        outline: none;
      }

      .online-point {
        position: relative;
        overflow: inherit;

        img {
          width: 100%;
          border-radius: 50%;
        }

        &::after {
          position: absolute;
          right: -2px;
          bottom: -2px;
          display: block;
          width: 8px;
          height: 8px;
          content: '';
          background-color: #909399;
          border-radius: 50%;
        }

        &::before {
          position: absolute;
          top: 0;
          left: 0;
          display: block;
          width: 100%;
          height: 100%;
          content: '';
          background-color: #fff;
          border-radius: 50%;
          opacity: 0;
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
        margin-right: 8px;
        font-size: 14px;
        font-weight: 500;
        color: #909399;
        transition: color 0.3s;
      }

      .user-name {
        margin-right: 8px;
        font-size: 14px;
      }

      .label {
        margin-right: 10px;
      }

      .icon-button {
        width: 24px;
        height: 24px;
        padding: 0;
        background-color: transparent;
      }
    }

    .nav-main {
      width: 50%;
      height: 100%;
      line-height: @navbarHeight;
      text-align: center;
      cursor: pointer;
      -webkit-user-select: none;

      .test-title {
        font-size: 40px;
        color: red;
        vertical-align: middle;
      }
    }
  }
}

.change-state {
  ul {
    padding: 0 12px;
    margin: 0;
    list-style: none;

    li {
      height: 34px;
      line-height: 34px;
      cursor: pointer;

      .change-point {
        display: inline-block;
        width: 8px;
        height: 8px;
        margin-right: 12px;
        background-color: @green;
        border-radius: 50%;
      }

      .li-check {
        float: right;
        margin-top: 9px;
        font-size: 16px;
        font-weight: 600;
        color: @blue;
      }

      .change-text {
        font-size: 14px;
        font-weight: 500;
        color: #606266;

        &.active {
          color: @blue;
        }

        &.disabled-li {
          color: #c1c0c0 !important;
          cursor: progress;
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
