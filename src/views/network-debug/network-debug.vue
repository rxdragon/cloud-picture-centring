<template>
  <div class="network-debug">
    <div class="network-info">
      <p class="node-instruct">nslookup cloud.cdn-qn.hzmantu.com</p>
      <div class="code-loading" v-if="debugInfo.nslookupBySelf === 'loading'"><span class="dotting"></span></div>
      <div class="code-module" v-else>{{ debugInfo.nslookupBySelf }}</div>
    </div>

    <div class="network-info">
      <p class="node-instruct">nslookup cloud.cdn-qn.hzmantu.com 10.0.0.1</p>
      <div class="code-loading" v-if="debugInfo.nslookupByTelecom === 'loading'"><span class="dotting"></span></div>
      <div class="code-module" v-else>{{ debugInfo.nslookupByTelecom }}</div>
    </div>

    <div class="network-info">
      <p class="node-instruct">dig cloud.cdn-qn.hzmantu.com</p>
      <div class="code-loading" v-if="debugInfo.digInfo === 'loading'"><span class="dotting"></span></div>
      <div class="code-module" v-else>{{ debugInfo.digInfo }}</div>
    </div>

    <div class="network-info" v-if="imageUrl">
      <p class="node-instruct">{{ imageUrl }}</p>
      <p class="node-instruct">curl -o /dev/null -s -w %{time_connect}:%{time_starttransfer}:%{time_total}:%{time_namelookup}:%{speed_download} {{ imageUrl }} -v</p>
      <div class="code-loading" v-if="debugInfo.curlImage === 'loading'"><span class="dotting"></span></div>
      <div class="code-module" v-else>{{ debugInfo.curlImage }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NetworkDebug',
  data () {
    return {
      imageUrl: '',
      debugInfo: {
        nslookupBySelf: '',
        nslookupByTelecom: '',
        digInfo: '',
        curlImage: ''
      }
    }
  },
  created () {
    const { imageUrl } = this.$route.query
    this.imageUrl = imageUrl
    this.initDebugInfo()
  },
  methods: {
    /**
     * @description 初始化网络信息
     */
    async initDebugInfo () {
      await this.nslookupInfo()
      await this.nslookupInfoByTelecom()
      await this.digAdminInfo()
      if (this.imageUrl) {
        await this.curlImageInfo(this.imageUrl)
      }
    },
    /**
     * @description 本地 dns 解析
     */
    async nslookupInfo () {
      this.debugInfo.nslookupBySelf = 'loading'
      const res = await this.$ipcRenderer.sendSync('network-nslookup')
      this.debugInfo.nslookupBySelf = res
    },
    /**
     * @description 电信dns ping
     */
    async nslookupInfoByTelecom () {
      this.debugInfo.nslookupByTelecom = 'loading'
      const res = await this.$ipcRenderer.sendSync('network-nslookup-telecom')
      this.debugInfo.nslookupByTelecom = res
    },
    /**
     * @description dig域名信息
     */
    async digAdminInfo () {
      this.debugInfo.digInfo = 'loading'
      const res = await this.$ipcRenderer.sendSync('network-dig')
      this.debugInfo.digInfo = res
    },
    /**
     * @description curl image 信息
     */
    async curlImageInfo (imageUrl) {
      this.debugInfo.curlImage = 'loading'
      const res = await this.$ipcRenderer.sendSync('network-curl-imageInfo', imageUrl)
      this.debugInfo.curlImage = res
    }
  }
}
</script>

<style lang="less" scoped>
.network-debug {
  width: 100vw;
  height: 100vh;
  padding: 10px;
  overflow: overlay;
  font-family: @DINAlternate;
  color: #47cf73;
  background-color: #2a3d44;
}

.node-instruct {
  margin: 10px 0;
  font-size: 15px;
  color: #ec5354;
}

.code-loading {
  .dotting {
    display: inline-block;
    min-width: 2px;
    min-height: 2px;
    box-shadow: 2px 0 currentColor, 6px 0 currentColor, 10px 0 currentColor;
    -webkit-animation: dot 4s infinite step-start both;
    animation: dot 1s infinite step-start both;

    &::before {
      content: '';
    }
  }

  @keyframes dot {
    25% { box-shadow: none; }
    50% { box-shadow: 2px 0 currentColor; }
    75% { box-shadow: 2px 0 currentColor, 6px 0 currentColor; }
  }
}

.code-module {
  font-size: 13px;
  white-space: pre-wrap;
}
</style>
