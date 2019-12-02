<template>
  <div class="download-management">
    <el-popover
      v-model="showManage"
      popper-class="download-popover"
      placement="bottom"
      width="600"
      trigger="click"
      @show="showList"
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
        <el-scrollbar wrap-class="down-scrollbar-wrapper">
          <transition-group name="list-complete" tag="div" mode="out-in">
            <div v-for="(downItem, uuid) in downList" :key="downItem.config.uuid" class="list-complete-item content-row">
              <down-list-item
                :key="uuid"
                :uuid="uuid"
                :list-item="downItem"
                :style="removeStyle"
              />
            </div>
            <div v-for="(downItem, uuid) in downloadList" :key="downItem.config.uuid + '-finish'" class="list-complete-item content-row">
              <down-list-item
                :uuid="uuid"
                :list-item="downItem"
                :style="removeStyle"
              />
            </div>
            <div v-show="noData" key="noData" class="no-data list-complete-item">
              暂无数据
            </div>
          </transition-group>
        </el-scrollbar>
        <div class="save-path">
          <span>{{ saveFolder }}</span>
          <i class="el-icon-setting" @click="changeSavePath" />
        </div>
      </div>
      <el-badge slot="reference" :max="9" :hidden="!showProgressingNum" :value="showProgressingNum" class="item">
        <el-button class="icon-button" icon="el-icon-download" />
      </el-badge>
    </el-popover>
  </div>
</template>

<script>
import DownListItem from './components/DownListItem'
import DownIpc from '@electronMain/ipc/DownIpc'
import * as Setting from '@/indexDB/getSetting.js'
import { mapGetters } from 'vuex'
export default {
  name: 'DownloadManagement',
  components: { DownListItem },
  data () {
    return {
      downList: DownIpc.getDownloadList(),
      showProgressingNum: 0,
      showManage: false,
      removeStyle: '' // 移除时样式
    }
  },
  computed: {
    ...mapGetters(['saveFolder', 'downloadList']),
    noData () {
      const listLength = Object.keys(this.downList).length + Object.keys(this.downloadList).length
      return Boolean(listLength)
    }
  },
  mounted () {
    DownIpc.registerOnListChange(() => {
      this.showProgressingNum = Object.keys(this.downList).length
    })
  },
  methods: {
    /**
     * @description 更改保存路径
     */
    changeSavePath () {
      const savePath = this.$ipcRenderer.sendSync('change-savePath')[0]
      if (savePath) {
        this.$store.dispatch('setting/setSavePath', savePath)
          .then(() => {
            Setting.updateSavePath(savePath)
          })
      }
    },
    /**
     * @description 显示列表
     */
    showList () {
      const downListArr = Object.values(this.downList)
      const downingList = downListArr.filter(item => item.status === 'progressing')
      if (this.showManage) {
        this.showProgressingNum = downingList.length
      }
    },
    /**
     * @description 清空已完成数据
     */
    clearAll () {
      DownIpc.clearAll()
    }
  }
}
</script>

<style lang="less">
@import "~@/styles/variables.less";

.down-scrollbar-wrapper {
  max-height: 500px;
  overflow: hidden;
}

.down-list {
  position: relative;

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
      font-size: 14px;
      font-weight: 500;
      color: #bbc1c8;
      line-height: 22px;
      background-color: #f5f7fb;
    }
  }

  .no-data {
    margin-bottom: 0;
    height: 48px;
    padding: 0;
    line-height: 48px;
    color: #8e939a;
  }

  .save-path {
    border-top: 1px solid @borderColor;
    padding: 7px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    & > span {
      color: @blue;
      font-size: 12px;
    }

    .el-icon-setting {
      cursor: pointer;

      &:hover {
        color: @blue;
      }
    }
  }
}
</style>
