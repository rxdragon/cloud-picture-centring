<template>
  <div class="about">
    <div class="logo share-logo"></div>
    当前系统版本：{{ version }}
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  name: 'about',
  data () {
    return {
      version: '-'
    }
  },
  created () {
    const version = ipcRenderer.sendSync('version:get')
    console.warn(version, 'version')
    this.version = version || '-'
    
  }
}
</script>

<style lang="less" scoped>
.about {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  padding: 0 20px;
  font-size: 12px;
  color: #000708;
  text-align: center;
  background-color: @blue;

  .logo {
    width: 60px;
    height: 60px;
    background-size: 60px;
  }
}
</style>
