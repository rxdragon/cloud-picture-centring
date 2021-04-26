import { startNewVersionWindow } from "./window/new-version.js"


export default function Upgrade () {
  this.isStart = false
  this.upgrade = null
  this.checkTime = 20 * 1000
  this.checkInterval = 0
}

Upgrade.prototype.startUpgradeCheck = function () {
  if (global.launcher && !this.isStart) {
    this.isStart = true
    this.startCheck()
  }
}

Upgrade.prototype.startCheck = function () {
  this.checkInterval = setInterval(this.check, this.checkTime)
}

Upgrade.prototype.check = async function () {
  try {
    if (await global.launcher.checkHasNewVersion()) {
      clearInterval(this.checkInterval)
      // 显示启动页面
      await startNewVersionWindow()
    }
  } catch (e) {
    console.error(e)
    // ignore
  }
}
