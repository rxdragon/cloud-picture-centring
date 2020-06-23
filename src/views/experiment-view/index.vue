<template>
  <div class="experiment-view">
    <div class="header">
      <h3>扩展功能</h3>
    </div>
    <div class="content">
      <el-form ref="experiment" label-width="200px" label-position="left">
        <el-form-item label="是否显示宠物">
          <el-switch :value="showCat" @change="setCatShow" />
        </el-form-item>
        <el-form-item label="是否对已上传的照片打标记">
          <el-switch :value="showOverTag" @change="setShowOverTag" />
        </el-form-item>
        <el-form-item label="是否开启预加载功能">
          <el-switch :value="cacheImageSwitchValue" @change="setCacheImageSwitch" />
        </el-form-item>
        <el-form-item label="客片池使用无限下拉">
          <el-switch :value="cacheGuestInfiniteScroll" @change="setCacheGuestInfiniteScroll" />
        </el-form-item>
      </el-form>
      <div class="clean-cache-box">
        <particle-button class="clean-cache-button experiment-button" @click="cleanImageCache">清除预加载图片缓存</particle-button>
        <span class="image-catch-count">
          {{ imageCatchCount }}
        </span>
      </div>
      <div class="open-cache-box">
        <particle-button class="experiment-button" @click="openImageCacheFile">打开预加载图片文件夹</particle-button>
      </div>
      <div class="memory-info">
        <el-button type="primary" @click="getMemory">获取内存</el-button>
        <div class="os-memory">
          <div class="memory-title">系统内存</div>
          <div class="memory-value">
            总内存：{{ memoryInfo.totalMemory }}
            空闲内存：{{ memoryInfo.freeMemory }}
            使用内存占比：{{ memoryInfo.memoryRatio }}
          </div>
        </div>
      </div>
      <div class="photo-shop-list table-box">
        <el-table :data="memoryTable" show-summary style="width: 100%;">
          <el-table-column prop="PPID" label="PPID">
            <template slot-scope="{ row }">
              {{ row.PPID }}
              <el-tooltip effect="dark" :content="row.command" placement="top">
                {{ row }}<i class="el-icon-question"></i>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="CPU" sortable label="CPU%" />
          <el-table-column prop="MEM" sortable label="内存%" />
          <el-table-column prop="VSZ" sortable label="虚拟内存MB" />
          <el-table-column prop="RSS" sortable label="实际内存MB" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
const { ipcRenderer } = window.require('electron')
import { mapGetters } from 'vuex'
import { getAvg } from '@/utils/index.js'
import ParticleButton from '@/components/ParticleButton/index'
import * as Setting from '@/indexDB/getSetting.js'
import * as MemoryApi from '@/api/memoryApi'

export default {
  name: 'ExperimentView',
  components: { ParticleButton },
  data () {
    return {
      imageCatchCount: 0,
      particleAnimationId: null,
      memoryInfo: {
        freeMemory: 0,
        totalMemory: 0,
        memoryRatio: 0
      },
      memoryTable: []
    }
  },
  computed: {
    ...mapGetters([
      'showCat',
      'showOverTag',
      'cacheImageSwitch',
      'guestInfiniteScroll'
    ]),
    cacheImageSwitchValue () {
      return Boolean(Number(this.cacheImageSwitch))
    },
    cacheGuestInfiniteScroll () {
      return Boolean(Number(this.guestInfiniteScroll))
    }
  },
  created () {
    this.getImageCachePhotoCount()
    this.particleAnimationId = window.requestAnimationFrame(this.update)
    // 获取ps内存
    // this.$ipcRenderer.on('get-photoshop-memory:res', (e, item) => {
    //   const res = item.stdout
    //   this.handlerPhotoshopMemorylist(res)
    // })
    this.$ipcRenderer.on('get-all-memory:res', (e, item) => {
      const res = item.stdout
      this.handlerPhotoshopMemorylist(res)
    })
  },
  beforeDestroy () {
    window.cancelAnimationFrame(this.particleAnimationId)
  },
  methods: {
    setCatShow (value) {
      this.$store.dispatch('setting/setShowCat', value)
    },
    setShowOverTag (value) {
      this.$store.dispatch('setting/setShowOverTag', value)
    },
    setCacheImageSwitch (value) {
      this.$store.dispatch('setting/setImageCacheSwitch', value)
        .then(() => {
          const data = value ? 1 : 0
          Setting.updateSetting('imageCacheSwitch', data)
        })
    },
    setCacheGuestInfiniteScroll (value) {
      this.$store.dispatch('setting/setGuestInfiniteScroll', value)
        .then(() => {
          const data = value ? 1 : 0
          Setting.updateSetting('guestInfiniteScroll', data)
        })
    },
    /**
     * @description 打开图片缓存地址
     */
    async openImageCacheFile () {
      const res = ipcRenderer.sendSync('utils:OpenFile')
      if (res !== 'success') {
        this.$newMessage.error('找不到文件夹')
      }
    },
    /**
     * @description 清除图片缓存
     */
    async cleanImageCache () {
      const res = ipcRenderer.sendSync('utils:clean-image-cache')
      if (res !== 'success') {
        this.$newMessage.error(res)
      }
      this.getImageCachePhotoCount()
    },
    /**
     * @description 获取缓存文件数量
     */
    async getImageCachePhotoCount () {
      const res = ipcRenderer.sendSync('utils:get-image-cache')
      if (res === 'fail') {
        this.$newMessage.error('获取文件数量失败')
      } else {
        this.imageCatchCount = res
      }
    },
    /**
     * @description 清零画布
     */
    update () {
      this.particleCanvas = document.querySelector('#buttonCanvas')
      this.particleCtx = this.particleCanvas.getContext("2d")
      if (typeof this.particleCtx !== "undefined") {
        this.particleCtx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      }
      this.particleAnimationId = window.requestAnimationFrame(this.update)
    },
    /**
     * @description 获取内存
     */
    async getMemory () {
      try {
        // this.$ipcRenderer.send('get-photoshop-memory')
        this.$ipcRenderer.send('get-all-memory')
        this.memoryInfo = await MemoryApi.getAllMemory()
      } catch (error) {
        console.error(error)
      }
    },
    /**
     * @description 处理内容信息
     */
    handlerPhotoshopMemorylist (res) {
      let rowList = res.split('\n')
      if (rowList[0].includes('PPID')) { rowList.splice(0, 1) }
      rowList = rowList.filter(item => item)
      const memoryTable = rowList.map(item => {
        const colArr = item.split(' ')
        return {
          PPID: colArr[0],
          CPU: colArr[1],
          MEM: colArr[2],
          VSZ: getAvg(colArr[3], 1024),
          RSS: getAvg(colArr[4], 1024),
          command: colArr[5]
        }
      })
      this.memoryTable = memoryTable
    }
  }
}
</script>

<style lang="less" scoped>
.clean-cache-box {
  margin-bottom: 22px;
}

.experiment-button {
  width: 200px;
}

.image-catch-count {
  display: inline-block;
  width: 40px;
  font-size: 16px;
  font-weight: 600;
  color: #606266;
  text-align: center;
}

.clean-cache-button {
  background: linear-gradient(to right, #ee0979, #ff6a00);
}

.memory-info {
  display: flex;
  align-items: center;
  margin-top: 20px;

  .os-memory {
    margin-left: 20px;
    font-size: 14px;

    .memory-title {
      font-weight: 500;
    }

    .memory-value {
      font-size: 12px;
    }
  }
}

.photo-shop-list {
  margin: 20px 0 20px;
}
</style>
