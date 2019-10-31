<template>
  <div class="download-management">
    <el-popover
      placement="bottom"
      width="600"
      trigger="click"
      @show="showList"
      @hide="hiddenList"
    >
      <div class="down-list">
        <div class="title-row">
          <div class="panel-title">下载内容</div>
          <div class="panel-title">下载状态</div>
          <div class="panel-title">操作</div>
          <div class="delete-all">
            <el-button icon="el-icon-delete-solid" @click="clearAll" />
          </div>
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
import { getFileIcon } from '@/utils/getFileIcon.js'
export default {
  name: 'DownloadManagement',
  components: { DownListItem },
  data () {
    return {
      downList: [],
      showMangage: false,
      showProgressingNum: 0
    }
  },
  computed: {
    progressingNum () {
      const dataLength = this.downList.length
      if (this.showMangage) {
        this.showProgressingNum = dataLength - this.downingList
      }
      return this.showProgressingNum
    },
    downingList () {
      const data = this.downList.filter(downItem => downItem.state !== 'progressing')
      return data.length
    }
  },
  created () {
    this.downList = SessionTool.getCacheDownloadList()
  },
  mounted () {
    this.$ipcRenderer.on('new-download-item', (e, item) => {
      this.addItem(item)
    })
    this.$ipcRenderer.on('download-item-updated', (e, item) => {
      this.updateItem(item)
    })
    this.$ipcRenderer.on('download-item-done', (e, item) => {
      this.updateItem(item)
    })
    this.$ipcRenderer.on('lose-down-item', (e, index) => {
      this.downList.splice(index, 1)
    })
  },
  methods: {
    /**
     * @description 显示列表
     */
    showList() {
      this.showMangage = true
    },
    /**
     * @description 隐藏列表
     */
    hiddenList() {
      this.showMangage = false
    },
    /**
     * @description 添加项目
     */
    async addItem (item) {
      item.iconSrc = await getFileIcon(item.savePath)
      this.downList = [item, ...this.downList]
      SessionTool.setCacheDownloadList(this.downList)
      this.showProgressingNum++
    },
    /**
     * @description 更新下载项
     */
    async updateItem (item) {
      item.iconSrc = await getFileIcon(item.savePath)
      const findIndex = this.downList.findIndex(listItem => listItem.index === item.index)
      if (findIndex < 0) return this.updateItem(item)
      this.$set(this.downList, findIndex, item)
      SessionTool.setCacheDownloadList(this.downList)
    },
    /**
     * @description 删除下载项
     */
    deleteItem (index) {
      const findIndex = this.downList.findIndex(listItem => listItem.index === index)
      this.downList.splice(findIndex, 1)
      SessionTool.setCacheDownloadList(this.downList)
      this.$ipcRenderer.send('delete-down-item', findIndex)
    },
    /**
     * @description 重新下载
     */
    resumeItem (index) {
      const findIndex = this.downList.findIndex(listItem => listItem.index === index)
      this.$ipcRenderer.send('resume-item', findIndex)
    },
    /**
     * @description 暂停下砸项目
     */
    pauseItem (index) {
      const findIndex = this.downList.findIndex(listItem => listItem.index === index)
      this.$ipcRenderer.send('pause-item', findIndex)
    },
    /**
     * @description 取消下载项目
     */
    cancelItem (index) {
      const findIndex = this.downList.findIndex(listItem => listItem.index === index)
      this.$ipcRenderer.send('cancel-item', findIndex)
    },
    /**
     * @description 清空下载项目
     */
    clearAll () {
      this.downList = this.downList.filter((listItem, listIndex) => {
        if (listItem.state === 'completed') { this.$ipcRenderer.send('delete-down-item', listIndex) }
        return listItem.state === 'progressing'
      })
      SessionTool.setCacheDownloadList(this.downList)
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
    position: relative;

    .delete-all {
      position: absolute;
      right: 10px;
      top: 10px;

      button {
        border: none;
        cursor: pointer;
        background-color: transparent;
        padding: 0;
      }
    }

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
  height: 48px;
}

.list-complete-enter,
.list-complete-leave-to {
  opacity: 0;
  height: 0;
}

.list-complete-leave-active {
  position: absolute;
}
</style>
