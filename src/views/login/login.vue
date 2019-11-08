<template>
  <div class="login">
    <iframe ref="login" class="login_iframe" :src="ssoUrl" />
  </div>
</template>

<script>
import { Base64 } from 'js-base64'
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
    if (sessionStorage.getItem('xStreamId')) { this.$router.push({ path: '/' }) }
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
          console.log('获取到token')
          this.tokenLogin(e.data.msg)
        }
        if (e.data.type === 'animation-finish') {
          console.log('动画完成')
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
        const info = await this.$store.dispatch('user/getUserInfo')
        if (!info.name) {
          this.$router.push({ path: '/401' })
        } else {
          this.loginFinish = true
          this.judgeJump()
        }
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
    judgeJump () {
      if (this.animationFinish && this.loginFinish) {
        window.removeEventListener('message', this.onMessage)
        this.$router.push({ path: '/' })
      }
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

