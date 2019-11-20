<template>
  <div class="down-list-item">
    <div class="panel-content filename">
      <div class="file-icon">
        <img :src="listItem.iconSrc" alt="">
      </div>
      <span class="file-name">{{ listItem.filename }}</span>
    </div>
    <div v-if="hasFile" class="panel-content">
      <div v-if="state === 'completed'" class="down-completed">
        <i class="el-icon-download">{{ state | toState }}</i>
        <time>{{ listItem.startTime | toTime }}</time>
      </div>
      <div v-if="state === 'interrupted'" class="down-interrupted">
        <i class="el-icon-warning-outline">下载中断</i>
      </div>
      <div v-if="state === 'progressing'" class="down-progressing">
        <el-progress :show-text="false" :text-inside="true" :stroke-width="8" :percentage="(listItem.receivedBytes / listItem.totalBytes) | toPercentageNum" />
        <div class="description">{{ listItem.receivedBytes | toMB }} / {{ listItem.totalBytes | toMB }}</div>
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
      <el-button v-if="state === 'progressing' && !listItem.isPaused" size="mini" class="icon-button" icon="el-icon-video-pause" @click="pauseItem(listItem.index)" />
      <!-- 回复 -->
      <el-button v-if="canResume" size="mini" class="icon-button" icon="el-icon-video-play" @click="resumeDownItem(listItem.index)" />
      <!-- 查看本地文件 -->
      <el-button v-if="state === 'completed' && hasFile" size="mini" class="icon-button" icon="el-icon-search" @click="downOpenFileFolder" />
      <!-- 取消 -->
      <el-button v-if="state === 'progressing'" size="mini" class="icon-button" icon="el-icon-delete" @click="cancelItem(listItem.index)" />
      <!-- 删除记录 -->
      <el-button v-if="state !== 'progressing'" size="mini" class="icon-button" icon="el-icon-delete" @click="deleteDownItem(listItem.index)" />
    </div>
  </div>
</template>

<script>
import { parseTime } from '@/utils/index.js'
import { openFileFolder } from '@/utils/openFile.js'

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
      return Math.floor(value * 100)
    },
    toMB (value) {
      const data = value / 1024 / 1024
      return data.toFixed(2) + 'MB'
    }
  },
  props: {
    listItem: { type: Object, required: true }
  },
  data () {
    return {
      hasFile: true
    }
  },
  computed: {
    state () {
      return this.listItem.state
    },
    canResume () {
      return this.listItem.canResume
    }
  },
  methods: {
    deleteDownItem (index) {
      this.$emit('deleteItem', index)
    },
    resumeDownItem (index) {
      this.$emit('resumeItem', index)
    },
    pauseItem (index) {
      this.$emit('pauseItem', index)
    },
    cancelItem (index) {
      this.$emit('cancelItem', index)
    },
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
    color: #848991;
    display: flex;
    align-items: center;
    width: 220px;

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
    text-align: center;
    padding: 10px 0;
  }
}
</style>
