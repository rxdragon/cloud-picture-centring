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
    </div>
  </div>
</template>

<script>
const { ipcRenderer } = window.require('electron')
import { mapGetters } from 'vuex'
import ParticleButton from '@/components/ParticleButton/index'
import * as Setting from '@/indexDB/getSetting.js'

export default {
  name: 'ExperimentView',
  components: { ParticleButton },
  data () {
    return {
      imageCatchCount: 0,
      particleAnimationId: null
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
</style>
