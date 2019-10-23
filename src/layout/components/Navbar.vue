<template>
  <div class="Navbar">
    <div class="navbar-main">
      <div class="nav-left">
        <el-button class="icon-button" icon="el-icon-arrow-left" @click="back" />
        <el-button class="icon-button" icon="el-icon-arrow-right" @click="go" />
        <el-button class="icon-button refresh" icon="el-icon-refresh-right" @click="refresh" />
      </div>
      <span class="nav-main">缦图云端 修图中心</span>
      <div class="nav-right">
        <!-- <download-management /> -->
        <el-avatar :src="userInfo.avatarImg" />
        <div class="user-name">{{ userInfo.nickname }}</div>
        <div class="label">{{ userInfo.departmentName }}</div>
        <el-button class="icon-button" icon="iconfont iconlogin-out" @click="logout" />
      </div>
    </div>
  </div>
</template>

<script>
import DownloadManagement from '@/components/DownloadManagement'

import * as User from '@/api/user.js'
import { mapGetters } from 'vuex'
export default {
  name: 'Navbar',
  components: { DownloadManagement },
  data () {
    return {}
  },
  computed: {
    ...mapGetters(['userInfo'])
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
        console.log(view)
        this.$nextTick(() => {
          this.$router.replace({
            path: '/redirect' + fullPath
          })
        })
      })
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
@nav-left: 110px;
@nav-right: 232px;
.Navbar {
  width: 100%;
  height: 100%;

  .navbar-main {
    margin-left: 120px;
    height: 100%;
    width: @navbarMainWidth;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .nav-left {
      width: @nav-left;

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
      width: @nav-right;
      display: flex;
      align-items: center;

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
      width: calc(~'100% - @{nav-left} - @{nav-right}');
      text-align: center;
      line-height: @navbarHeight;
      -webkit-app-region: drag;
      height: 100%;
    }
  }
}
</style>
