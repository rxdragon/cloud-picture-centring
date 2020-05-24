<template>
  <div class="download-management">
    <el-popover
      v-model="showManage"
      popper-class="download-popover"
      placement="bottom"
      width="600"
      trigger="click"
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
                :show-popver="showManage"
                :list-item="downItem"
                :style="removeStyle"
              />
            </div>
            <div v-for="downItem in downloadList" :key="downItem.config.uuid + '-finish'" class="list-complete-item content-row">
              <down-list-item
                :uuid="downItem.config.uuid"
                :list-item="downItem"
                :style="removeStyle"
                finished
              />
            </div>
            <div v-show="!noData" key="noData" class="no-data list-complete-item">
              暂无数据
            </div>
          </transition-group>
        </el-scrollbar>
        <div class="save-path">
          <span>{{ saveFolder }}</span>
          <i class="el-icon-setting" @click="changeSavePath" />
        </div>
      </div>
      <el-badge
        slot="reference"
        :max="9"
        :hidden="!showProgressingNum"
        :value="showProgressingNum"
        class="item"
      >
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
      showManage: false,
      removeStyle: '' // 移除时样式
    }
  },
  computed: {
    ...mapGetters(['saveFolder', 'downloadList']),
    noData () {
      const listLength = Object.keys(this.downList).length + this.downloadList.length
      return Boolean(listLength)
    },
    showProgressingNum () {
      return Object.keys(this.downList).length
    }
  },
  mounted () {
    DownIpc.registerOnListChange(() => {
      this.$forceUpdate()
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
     * @description 清空已完成数据
     */
    clearAll () {
      DownIpc.clearAll()
      this.$store.dispatch('downloadlist/clearAllDownList')
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
    position: relative;
    display: grid;
    grid-template-columns: 2fr 2fr 1fr;

    .delete-all {
      position: absolute;
      top: 10px;
      right: 10px;

      button {
        padding: 0;
        cursor: pointer;
        background-color: transparent;
        border: none;
      }
    }

    .panel-title {
      padding: 10px 21px;
      font-size: 14px;
      font-weight: 500;
      line-height: 22px;
      color: #bbc1c8;
      background-color: #f5f7fb;
    }
  }

  .no-data {
    height: 48px;
    padding: 0;
    margin-bottom: 0;
    line-height: 48px;
    color: #8e939a;
  }

  .save-path {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 7px;
    border-top: 1px solid @borderColor;

    & > span {
      font-size: 12px;
      color: @blue;
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
