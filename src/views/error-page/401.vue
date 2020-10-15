<template>
  <div class="error-page">
    <div class="errPage-container">
      <el-button icon="arrow-left" type="primary" @click="logout">
        退出登录
      </el-button>
      <el-row>
        <el-col :span="12">
          <h1 class="text-jumbo text-ginormous">
            Oops!
          </h1>
          <h2>你没有权限</h2>
          <h6>请联系主管添加权限</h6>
        </el-col>
        <el-col :span="12">
          <img
            :src="errGif"
            width="313"
            height="428"
            alt="Girl has dropped her ice cream."
          >
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import * as User from '@/api/user.js'
import errGif from '@/assets/401_images/401.gif'

export default {
  name: 'Page401',
  data () {
    return {
      errGif: errGif + '?' + +new Date()
    }
  },
  methods: {
    /**
     * @description 退出登录
     */
    logout () {
      User.logout()
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>
  .error-page {
    width: 100vw;
    height: 100vh;
    background-color: #fff;
  }

  .errPage-container {
    width: 800px;
    max-width: 100%;
    padding: 100px 0;
    margin: 0 auto;
    background-color: #fff;
    -webkit-app-region: drag;

    .pan-back-btn {
      color: #fff;
      background: #008489;
      border: none !important;
    }

    .pan-gif {
      display: block;
      margin: 0 auto;
    }

    .pan-img {
      display: block;
      width: 100%;
      margin: 0 auto;
    }

    .text-jumbo {
      font-size: 60px;
      font-weight: 700;
      color: #484848;
    }

    .list-unstyled {
      font-size: 14px;

      li {
        padding-bottom: 5px;
      }

      a {
        color: #008489;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
</style>
