<template>
  <div class="retouch-workbench">
    <!-- 流水信息 -->
    <div class="retouch-stream" v-if="retouchingStream.streamNum">
      <div class="retouch-stream-row stream-sand-row">
        <div class="stream-strong">当前正在处理流水：</div>
        <div class="stream-sand" v-if="isSandClockOpen">
          <div class="sand-clock sand-clock-workbench">
            <div class="sand" :class="`sand-${sandClass}`" />
            <div class="time">{{ sandTime | toTimeFormatText }}</div>
          </div>
        </div>
      </div>
      <div class="retouch-stream-row">
        <div class="stream-strong">{{ retouchingStream.streamNum }}</div>
        <div class="stream-desc">照片张数：{{ retouchingStream.photoNum }}张</div>
      </div>
      <div class="retouch-stream-row">
        <div class="stream-desc">产品：{{ retouchingStream.productName }}</div>
      </div>
    </div>
    <!-- 修图要求 -->
    <div class="require-box" v-if="retouchingStream.streamNum">
      <div class="require-info">
        <div class="retouch-require">
          <el-tag :effect="dark ? 'plain' : 'light'" size="small">眼睛增大幅度：{{ retouchingStream.requireLabel.eye | toLabelName }}</el-tag>
          <el-tag :effect="dark ? 'plain' : 'light'" size="small">瘦脸幅度：{{ retouchingStream.requireLabel.face | toLabelName }}</el-tag>
          <el-tag :effect="dark ? 'plain' : 'light'" v-if="retouchingStream.requireLabel.pimples" size="small">祛痣</el-tag>
        </div>
        <div class="retouch-remark">
          修图备注：{{ retouchingStream.retouchRemark }}
        </div>
        <div class="retouch-remark retouch-notice" v-if="retouchingStream.retouchNotice">
          <div class="content">
            修图注意事项：{{ retouchingStream.retouchNotice }}
          </div>
          <div class="tooltop">{{ retouchingStream.retouchNotice }}</div>
        </div>
        <div class="retouch-remark" v-if="retouchingStream.retouchBackImg">
          修图底色：{{ retouchingStream.retouchBackImgName }}
          <div class="impression-box">
            <img :src="retouchingStream.retouchBackImg" alt="">
            <el-button class="down-retouch" type="text" @click="downImpressionPhoto">下载底色图</el-button>
          </div>
        </div>
      </div>

      <!-- 参考图 -->
      <div class="reference-photo" v-if="retouchingStream.referencePhoto">
        <img :src="retouchingStream.referencePhoto" alt="">
        <el-button type="text" @click="downReferencePhoto">下载参考图</el-button>
      </div>
    </div>
    <!-- 其他待处理流水 -->
    <div class="wait-retouch-stream">
      <div class="wait-retouch-title">
        其他待处理流水：{{ dealStreamNum }}
      </div>
    </div>
    <!-- 今日数据 -->
    <div class="today-retouch-info">
      <div class="today-retouch-title">今日个人数据：</div>
      <div class="today-retouch-content">
        <div class="info-item">
          <div class="info-value">{{ retouchPhotoNumTimeSum }}min</div>
          <div class="info-label">平均修图时长</div>
        </div>
        <div class="info-item">
          <div class="info-value return-rate">{{ returnRate }}%</div>
          <div class="info-label">退张率</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as WorkbenchApi from '@/api/workbenchApi'
import DownIpc from '@electronMain/ipc/DownIpc'

export default {
  name: 'RetouchWorkbench',
  props: {
    dark: { type: Boolean },
    isStickTop: { type: Boolean }
  },
  data () {
    return {
      hourGlass: null,
      goalTime: {
        green: 0,
        red: 0
      }, // 目标沙漏时间
      sandClass: 'green',
      sandTime: 1000,
      overTime: 0, // 超时时间
      retouchingStream: {
        requireLabel: {}
      },
      dealStreamNum: 0,
      returnRate: 0,
      retouchPhotoNumTimeSum: 0,
      getSandClock: null,
      oldStreamNum: ''
    }
  },
  computed: {
    // 是否开启沙漏
    isSandClockOpen () {
      if (!this.hourGlass) return this.hourGlass
      return Object.keys(this.hourGlass).length
    },
  },
  created () {
    this.getRetouchNowInfo()
    this.initElectron()
  },
  destroyed () {
    if (this.getSandClock) {
      clearTimeout(this.getSandClock)
      this.getSandClock = null
    }
    this.$ipcRenderer.removeAllListeners('workbench-change')
  },
  methods: {
    async initElectron () {
      // 监听关闭窗口
      this.$ipcRenderer.on('workbench-change', (e, item) => {
        const { id } = item || {}
        this.getRetouchNowInfo(id)
      })
    },
    /**
     * @description 获取修图信息
     */
    async getRetouchNowInfo (streamId) {
      const req = { streamId }
      const { retouchingStream, dealStreamNum, returnRate, retouchPhotoNumTimeSum, hourGlass } = await WorkbenchApi.getRetouchInfo(req)
      this.hourGlass = hourGlass
      this.retouchingStream = retouchingStream
      if (this.isSandClockOpen && this.oldStreamNum !== retouchingStream.streamNum) {
        this.overTime = +this.hourGlass.over_time
        const nowDate = Math.ceil(new Date().getTime() / 1000)
        this.goalTime.green = this.hourGlass.green_time + nowDate
        this.goalTime.red = this.hourGlass.green_time + this.hourGlass.orange_time + nowDate
        this.pollGetSandClock()
      }
      this.oldStreamNum = retouchingStream.streamNum || ''
      this.dealStreamNum = dealStreamNum
      this.returnRate = returnRate
      this.retouchPhotoNumTimeSum = retouchPhotoNumTimeSum
      // 重制窗口大小
      if (!this.isStickTop) return
      await this.$nextTick()
      const workbenchWindow = document.getElementById('workbench-window')
      if (!workbenchWindow) return
      const width = workbenchWindow.clientWidth
      const height = workbenchWindow.clientHeight
      const data = {
        width,
        height
      }
      this.$ipcRenderer.sendSync('resize-workbench', data)
    },
    pollGetSandClock () {
      this.countDown()
      this.getSandClock = setTimeout(this.pollGetSandClock, 1000)
    },
    /**
     * @description 时间倒计时
     */
    countDown () {
      let time = 0
      const nowDate = Math.ceil(new Date().getTime() / 1000)
      if (this.goalTime.green - nowDate > 0) {
        time = this.goalTime.green - nowDate
        this.sandClass = 'green'
      } else if (this.goalTime.red - nowDate > 0) {
        time = this.goalTime.red - nowDate
        this.sandClass = 'orange'
      } else {
        time = nowDate - this.goalTime.red + this.overTime
        this.sandClass = 'red'
      }
      this.sandTime = time
    },
    /**
     * @description 下载参考图
     */
    downReferencePhoto () {
      if (!this.retouchingStream.referencePhoto) return
      const data = {
        url: this.retouchingStream.referencePhoto,
        path: `${this.retouchingStream.streamNum}`
      }

      // 判断从那里下载文件
      if (this.isStickTop) {
        this.$ipcRenderer.sendSync('other-window-down', data)
      } else {
        DownIpc.addDownloadFile(data)
      }
    },
    /**
     * @description 下载参考图
     */
    downImpressionPhoto () {
      if (!this.retouchingStream.retouchBackImg) return
      const data = {
        url: this.retouchingStream.retouchBackImg,
        path: `${this.retouchingStream.streamNum}`
      }

      // 判断从那里下载文件
      if (this.isStickTop) {
        this.$ipcRenderer.sendSync('other-window-down', data)
      } else {
        DownIpc.addDownloadFile(data)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.retouch-stream {
  margin-left: 20px;
  border-bottom: 1px solid var(--borderColor);

  .stream-sand-row {
    height: 44px;
  }

  .retouch-stream-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 17px;

    .sand-clock {
      position: relative;
      box-sizing: content-box;
      display: flex;
      align-items: center;
      width: 146px;
      height: 44px;
      background: url(~@/assets/sand_clock/sand_bg.png);

      .time {
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 115px;
        height: 100%;
        font-size: 16px;
        font-weight: 500;
        color: white;
      }
    }

    .sand-clock-workbench {
      transform: scale(0.5);
      transform-origin: right;
    }

    .stream-strong {
      font-weight: 600;
    }

    .stream-desc {
      font-weight: 400;
      color: var(--descColor);
    }

    &:nth-last-child(1) {
      padding-top: 4px;
      padding-bottom: 12px;
    }
  }
}

.require-box {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 16px 12px 0;
  margin-left: 20px;
  border-bottom: 1px solid var(--borderColor);

  .require-info {
    width: 235px;

    .el-tag {
      margin-right: 12px;
      margin-bottom: 4px;
    }

    .el-tag--plain {
      color: #b5c3fd;
      background-color: transparent;
      border-color: #4669fb;
    }
  }

  .reference-photo {
    display: flex;
    flex-direction: column;
    align-items: center;

    img {
      display: block;
      width: 60px;
      height: 60px;
      background: #dddfe6;
      border: 1px solid #dddfe6;
    }
  }

  .retouch-remark {
    display: -webkit-box;
    font-weight: 400;
    line-height: 20px;
    color: var(--descColor);
    text-overflow: ellipsis;
    word-break: break-all;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;

    .impression-box {
      margin-left: 70px;

      img {
        width: 60px;
        height: 60px;
        vertical-align: top;
      }

      .down-retouch {
        padding: 0;
        font-size: 12px;
        vertical-align: bottom;
      }
    }
  }

  .retouch-notice {
    position: relative;

    .content {
      overflow: hidden;
    }

    .tooltop {
      position: absolute;
      display: none;
      padding: 10px;
      color: #fff;
      background-color: #303133;
      border-radius: 4px;
      transform: translateY(-125%);
    }

    &:hover {
      .tooltop {
        display: block;
      }
    }
  }
}

.wait-retouch-stream {
  padding: 12px 0 12px 20px;
  border-bottom: 1px solid var(--borderColor);

  .wait-retouch-title {
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    color: var(--baseColor);
  }
}

.today-retouch-info {
  padding: 12px 20px;
  border-bottom: 1px solid var(--borderColor);

  .today-retouch-title {
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    color: var(--baseColor);
  }

  .today-retouch-content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);

    .info-item {
      text-align: center;

      .info-value {
        font-size: 14px;
        font-weight: 600;
        line-height: 20px;
        color: #38bc7f;
      }

      .info-label {
        font-size: 12px;
        font-weight: 400;
        line-height: 17px;
        color: #909399;
      }

      .return-rate {
        color: @red;
      }
    }
  }
}
</style>
