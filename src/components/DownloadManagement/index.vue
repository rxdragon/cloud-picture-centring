<template>
  <div class="download-management">
    <el-popover
      placement="bottom"
      width="600"
      trigger="click"
    >
      <div class="down-list">
        <div class="title-row">
          <div class="panel-title">下载内容</div>
          <div class="panel-title">下载状态</div>
          <div class="panel-title">操作</div>
        </div>
        <transition-group name="list-complete" tag="div" mode="out-in">
          <div v-for="downItem in downList" :key="downItem.index" class="list-complete-item content-row">
            <down-list-item
              :list-item="downItem"
              @resumeItem="resumeItem"
              @pauseItem="pauseItem"
              @cancelItem="cancelItem"
              @deleteItem="deleteItem"
            />
          </div>
          <div v-show="!downList.length" key="noData" class="no-data">
            暂无数据
          </div>
        </transition-group>
      </div>
      <el-badge slot="reference" :max="9" :hidden="!progressingNum" :value="progressingNum" class="item">
        <el-button class="icon-button" icon="el-icon-download" />
      </el-badge>
    </el-popover>
  </div>
</template>

<script>
import * as SessionTool from '@/utils/sessionTool.js'
import DownListItem from './components/DownListItem'
// import { getFileIcon } from '@/utils/getFileIcon.js'
export default {
  name: 'DownloadManagement',
  components: { DownListItem },
  data () {
    return {
      downList: []
    }
  },
  computed: {
    progressingNum () {
      const data = this.downList.filter(downItem => downItem.state === 'progressing')
      return data.length
    }
  },
  created () {
    this.downList = SessionTool.getCacheDownloadList()
  },
  mounted () {
    this.$ipcRenderer.on('new-download-item', (e, item) => {
      console.log(item.index, 'new')
      this.addItem(item)
    })
    this.$ipcRenderer.on('download-item-updated', (e, item) => {
      this.updateItem(item)
    })
    this.$ipcRenderer.on('download-item-done', (e, item) => {
      console.log(item.index, 'down')
      this.updateItem(item)
    })
  },
  methods: {
    async addItem (item) {
      item.iconSrc = await getFileIcon(item.savePath)
      this.downList = [item, ...this.downList]
      SessionTool.setCacheDownloadList(this.downList)
    },
    async updateItem (item) {
      item.iconSrc = await getFileIcon(item.savePath)
      const findIndex = this.downList.findIndex(listItem => listItem.index === item.index)
      this.$set(this.downList, findIndex, item)
      SessionTool.setCacheDownloadList(this.downList)
    },
    deleteItem (index) {
      const findIndex = this.downList.findIndex(listItem => listItem.index === index)
      this.downList.splice(findIndex, 1)
      SessionTool.setCacheDownloadList(this.downList)
      this.$ipcRenderer.send('delete-down-item', findIndex)
    },
    resumeItem (index) {
      const findIndex = this.downList.findIndex(listItem => listItem.index === index)
      this.$ipcRenderer.send('resume-item', findIndex)
    },
    pauseItem (index) {
      const findIndex = this.downList.findIndex(listItem => listItem.index === index)
      this.$ipcRenderer.send('pause-item', findIndex)
    },
    cancelItem (index) {
      const findIndex = this.downList.findIndex(listItem => listItem.index === index)
      this.$ipcRenderer.send('cancel-item', findIndex)
    }
  }
}
</script>

<style lang="less">
.down-list {
  position: relative;
  max-height: 500px;
  overflow: auto;

  .title-row {
    display: grid;
    grid-template-columns: 2fr 2fr 1fr;
  }

  .title-row {
    .panel-title {
      padding: 10px 21px;
      font-size:14px;
      font-weight:500;
      color:#BBC1C8;
      line-height:22px;
      background-color: #F5F7FB;
    }
  }

  .no-data {
    margin-bottom: 0;
    height: 48px;
    padding: 0;
    line-height: 48px;
    color: #8E939A;
  }
}

.list-complete-item {
  transition: all 1s;
  width: 100%;
  display: inline-block;
  overflow: hidden;
}

.list-complete-enter,
.list-complete-leave-to {
  opacity: 0;
  transform: translateY(-48px);
}

.list-complete-leave-active {
  position: absolute;
}
</style>
