<template>
  <div class="login">
    <iframe ref="login" id="login" class="login_iframe" :src="ssoUrl" />
  </div>
</template>

<script>
import { Base64 } from 'js-base64'
import { MessageBox } from 'element-ui'
import * as User from '@/api/user.js'
export default {
  name: 'Login',
  props: {},
  data () {
    return {
      ssoUrl: '',
      animationFinish: false,
      loginFinish: false
    }
  },
  async created () {
    // 判断是否已经登录
    if (sessionStorage.getItem('xStreamId')) {
      this.$router.push({ path: '/' })
    }
    this.getLoginSsoUrl()
  },
  mounted () {
    // 监听事件
    window.addEventListener('message', this.onMessage)
  },
  methods: {
    /**
     * @description 监听iframe 页面传递的参数
     * @param {*} e
     */
    onMessage (e) {
      if (typeof e.data === 'object' && 'type' in e.data && 'msg' in e.data) {
        if (e.data.type === 'dd-token') {
          this.tokenLogin(e.data.msg)
        }
        if (e.data.type === 'animation-finish') {
          this.animationFinish = true
          this.judgeJump()
        }
      }
    },
    /**
     * @description 登录
     * @param {*} code
     */
    async tokenLogin (token) {
      try {
        await this.$store.dispatch('user/login', token)
        this.loginFinish = true
        this.judgeJump()
      } catch (error) {
        this.$router.push({ path: '/401' })
      }
    },
    /**
     * @description 转码
     */
    getLoginSsoUrl () {
      const query = JSON.stringify({
        title: '缦图云端',
        redirect: `${window.location.origin}/login.html#/?token=`
      })
      this.ssoUrl = process.env.VUE_APP_LOGIN_API + Base64.encode(query)
    },
    /**
     * @description 判断是否跳转
     */
    async judgeJump () {
      if (this.animationFinish && this.loginFinish) {
        const info = await this.$store.dispatch('user/getUserInfo')
        if (!info || !info.name) {
          User.logout()
          this.showLoginError()
        } else {
          window.removeEventListener('message', this.onMessage)
          this.$router.push({ path: '/' })
        }
      }
    },
    /**
     * @description 登陆异常提示
     */
    showLoginError () {
      MessageBox.confirm('', '您的账号已被禁用，请联系系统管理员', {
        confirmButtonText: '确定',
        center: true,
        type: 'error',
        showClose: false,
        showCancelButton: false
      }).then(() => {
        location.reload()
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login {
  iframe {
    width: 100vw;
    height: 100vh;
    border: none;
    -webkit-app-region: drag;
  }
}
</style>

