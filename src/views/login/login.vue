<template>
  <div class="login">
    <iframe ref="login" class="login_iframe" :src="sso_url" />
  </div>
</template>

<script>
export default {
  name: 'Login',
  props: {},
  data () {
    return {
      sso_url: 'https://sso.local.hzmantu.com/login/1012',
      loginUrl: 'manage_auth/login/sso?token='
    }
  },
  async created () {
    // 判断是否已经登录
    if (sessionStorage.getItem('xStreamId')) {
      this.$router.push({ path: '/' })
    }
  },
  mounted () {
    const loginIframe = this.$refs['login']
    loginIframe.onload = () => {
      // document.querySelector("body > .loading-warp").style.display = "none"
      // document.querySelector("body > .wrapper").style.display = "block"
    }
    window.addEventListener('message', this.onMessage)
  },
  methods: {
    /**
     * @description 监听iframe 页面传递的参数
     * @param {*} e
     */
    onMessage (e) {
      if (typeof e.data === 'object' && 'type' in e.data && 'msg' in e.data) {
        if (e.data.type === 'code') {
          this.jumpBack(e.data.msg)
        }
      }
    },
    /**
     * @description 登录
     * @param {*} code
     */
    async jumpBack (code) {
      const token = code.substr(1, 32)
      await this.$store.dispatch('user/login', token)
      this.$newMessage.success('登录成功')
      window.removeEventListener('message', this.onMessage)
      await this.$store.dispatch('user/getUserInfo')
      this.$router.push('/')
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

