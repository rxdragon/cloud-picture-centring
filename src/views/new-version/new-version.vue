<template>
  <div class="new-version">
    <div class="tip">
      <div class="left">
        <div class="share-logo"></div>
      </div>
      <div class="right">
        <div class="tip-title">更新版本</div>
        <p class="tip-desc">有新的版本可用了，现在重启么？</p>
      </div>
    </div>
    
    <div class="button-module">
      <button @click="upgradeVersion">更新</button>
    </div>
  </div>
</template>

<script>
const { ipcRenderer } = window.require('electron')
import { Background } from '@/electronMain/interface/event'

export default {
  name: 'new-version',
  methods: {
    /**
     * @description 更新软件版本
     */
    upgradeVersion () {
      ipcRenderer.send(Background.Event.NewVersionRestart)
    }
  }
}
</script>

<style lang="less" scoped>
.new-version {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100vw;
  height: 100vh;
  padding: 20px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #dfdfdf;
  background: #303030;

  .tip {
    display: flex;

    .left {
      width: 60px;
      height: 60px;
      margin-right: 20px;

      .share-logo {
        width: 60px;
        height: 60px;
        background-size: 60px;
      }
    }

    .right {
      .tip-title {
        margin-bottom: 6px;
        font-size: 14px;
        font-weight: 800;
      }

      .tip-desc {
        font-size: 12px;
      }
    }
  }

  .button-module {
    text-align: right;

    button {
      width: 80px;
      color: #e6e5e5;
      background-color: #646465;
      border: none;
      border-radius: 3px;

      &:focus {
        outline: none;
      }
    }
  }
}
</style>
