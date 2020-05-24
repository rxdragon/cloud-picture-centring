<template>
  <div class="down-list-item">
    <div class="panel-content filename">
      <div class="file-icon">
        <img :src="listItem.iconSrc" alt="">
      </div>
      <span class="file-name">{{ listItem.fileName }}</span>
    </div>
    <div v-if="hasFile" class="panel-content">
      <div v-if="state === 'completed'" class="down-completed">
        <i class="el-icon-download">{{ state | toState }}</i>
      </div>
      <div v-if="state === 'interrupted'" class="down-interrupted">
        <i class="el-icon-warning-outline">下载中断</i>
      </div>
      <div v-if="state === 'progressing'" class="down-progressing">
        <el-progress
          :show-text="false"
          :text-inside="true"
          :stroke-width="8"
          :percentage="listItem.process.progress | toPercentageNum"
        />
        <div class="description">{{ listItem.process.speed }}</div>
      </div>
      <div v-if="state === 'waitdown'" class="down-completed">
        <i class="el-icon-warning-outline">等待下载</i>
      </div>
      <div v-if="state === 'cancelled'" class="down-cancelled">
        <i class="el-icon-download">下载取消</i>
      </div>
    </div>
    <div v-else class="panel-content">
      <div class="down-cancelled">
        <i class="el-icon-download">文件已丢失</i>
      </div>
    </div>
    <div class="panel-content handle-button">
      <!-- 暂停 -->
      <el-button
        v-if="state === 'progressing' && !listItem.isUserPause"
        size="mini"
        class="icon-button"
        icon="el-icon-video-pause"
        @click="pauseItem"
      />
      <!-- 回复 -->
      <el-button
        v-if="canResume"
        size="mini"
        class="icon-button"
        icon="el-icon-video-play"
        @click="resumeDownItem"
      />
      <!-- 查看本地文件 -->
      <el-button
        v-if="state === 'completed' && hasFile"
        size="mini"
        class="icon-button"
        icon="el-icon-search"
        @click="downOpenFileFolder"
      />
      <!-- 取消 -->
      <el-button
        v-if="state === 'progressing'"
        size="mini"
        class="icon-button"
        icon="el-icon-delete"
        @click="cancelItem"
      />
      <!-- 删除记录 -->
      <el-button
        v-if="state !== 'progressing'"
        size="mini"
        class="icon-button"
        icon="el-icon-delete"
        @click="deleteDownItem"
      />
    </div>
  </div>
</template>

<script>
import { parseTime } from '@/utils/index.js'
import { openFileFolder } from '@/utils/openFile.js'
import DownIpc from '@electronMain/ipc/DownIpc'

export default {
  name: 'DownListItem',
  filters: {
    // 转换状态
    toState (state) {
      const keyMap = {
        progressing: '下载中',
        completed: '下载完成',
        cancelled: '取消下载',
        interrupted: '下载中断'
      }
      return keyMap[state]
    },
    toTime (time) {
      return parseTime(time * 1000, '{y}-{m}-{d}')
    },
    toPercentageNum (value) {
      if (!value) return 0
      return parseInt(value)
    },
    toMB (value) {
      const data = value / 1024 / 1024
      return data.toFixed(2) + 'MB'
    }
  },
  props: {
    listItem: { type: Object, required: true },
    uuid: { type: String, required: true },
    finished: { type: Boolean },
    showPopver: { type: Boolean }
  },
  data () {
    return {
      hasFile: true
    }
  },
  computed: {
    state () {
      if (!this.finished && this.listItem.status === 'completed' && this.showPopver) {
        DownIpc.transferToVuexList(this.uuid)
      }
      return this.listItem.status
    },
    canResume () {
      return this.listItem.canResume
    }
  },
  methods: {
    // 删除下载文件
    deleteDownItem () {
      if (this.finished) {
        const uuid = this.uuid
        this.$store.dispatch('downloadlist/delDownloadItem', { uuid })
      } else {
        DownIpc.deleteItem(this.uuid)
      }
    },
    // 重新下载
    resumeDownItem () {
      DownIpc.resume(this.uuid)
    },
    // 暂停下载文件
    pauseItem () {
      DownIpc.pause(this.uuid)
    },
    // 取消下载
    cancelItem () {
      DownIpc.cancel(this.uuid)
    },
    // 打开下载文件
    downOpenFileFolder () {
      this.hasFile = openFileFolder(this.listItem.savePath)
    }
  }
}
</script>

<style lang="less" scoped>
@import '../../../styles/variables.less';

.down-list-item {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr;

  &:hover {
    background-color: #f5f7fb;
  }

  .panel-content {
    padding: 10px 21px;
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
    color: #8e939a;

    .down-completed {
      i::before {
        color: @blue;
      }

      time {
        margin-left: 10px;
        color: #bac0c7;
      }
    }
  }

  .filename {
    display: flex;
    align-items: center;
    width: 220px;
    color: #848991;

    .file-icon {
      width: 20px;
      margin-right: 8px;

      img {
        width: 100%;
        height: 100%;
      }
    }

    .file-name {
      width: calc(~'100% - 20px');
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .handle-button {
    width: auto;
    padding: 10px 0;
    text-align: center;
  }
}
</style>
