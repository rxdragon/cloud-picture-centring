<template>
  <div class="auto-retouch">
    <div class="content-box">
      <div class="content-title">自动修图</div>
      <div class="auto-retouch-img-box" v-loading="loading">
        <i class="el-icon-arrow-left img-switch" v-if="showSwitchBtn" @click="switchPhoto('next')"/>
        <img  :src="url" class="content-img" @load="hiddenLoading" />
        <i class="el-icon-arrow-right img-switch" v-if="showSwitchBtn" @click="switchPhoto('pre')"/>
      </div>
    </div>
    <div class="fun-box">
      <div class="close-box">
        <i class="el-icon-circle-close" @click="closeAutoRetouch" />
      </div>
      <div class="btn-box">
        <el-button
          type="primary"
          v-for="(funItem, funIndex) in funList"
          :key="funIndex"
          :disabled="funItem.active || loading"
          @click="changeAutoRetouchImg(funIndex)"
        >
          {{ funItem.name }}
        </el-button>
      </div>
      <div class="back-box">
        <el-button type="info" @click="downloadPhoto" :disabled="loading">下载照片</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import * as AutoRetouch from '@/api/autoRetouch'
import { mapGetters } from 'vuex'
import DownIpc from '@electronMain/ipc/DownIpc'

export default {
  name: "AutoRetouch",
  props: {
    photoList: { type: Array, default: () => [] },
    streamNum: { type: String, default: '' },
    loadRetouch: { type: Boolean, default: false}
  },
  data () {
    return {
      funList: [
        {
          name: '原图',
          value: 'origin',
          active: false
        },
        {
          name: '裁剪图',
          value: 'crop',
          active: false
        }
      ],
      url: '', // 图片uuid
      originImg: '', // 原图地址
      cropImg: '', // 裁剪图地址
      adjustOneImg: '', // 调整图1地址
      adjustTwoImg: '', // 调整图2地址
      photoIndex: 0, // 图片索引
      showAutoRetouch: false, // 显示自动修图页面
      cacheRetouchPic: [], // 自动修图图片缓存
      loading: true
    }
  },
  computed: {
    ...mapGetters(['imgDomain']),
    showSwitchBtn () {
      return this.photoList.length > 1
    }
  },
  watch: {
    photoIndex: {
      handler (val) {
        this.getAutoRetouch()
      }
    },
    photoList: {
      handler () {
        this.getAutoRetouch()
      }
    }
  },
  created () {
    this.getAutoRetouch()
  },
  mounted () {
    /**
     * @description 监听键盘事件
     */
    document.onkeydown = e => {
      if (this.loading) return
      const key = window.event.keyCode
      switch (key) {
        // 左右键图片切换
        case 37:
          if (this.photoList.length > 1) {
            this.switchPhoto('pre')
          }
          break
        case 39:
          if (this.photoList.length > 1) {
            this.switchPhoto('next')
          }
          break
          // 上下键功能切换
        case 38:
          const upIndex = this.funList.findIndex(funItem => funItem.active)
          if (upIndex > -1) {
            const setActiveIndex = upIndex === 0 ? this.funList.length - 1 : upIndex - 1
            this.changeAutoRetouchImg(setActiveIndex)
          }
          break
        case 40:
          const downIndex = this.funList.findIndex(funItem => funItem.active)
          if (downIndex > -1) {
            const setActiveIndex = downIndex === this.funList.length - 1 ? 0 : downIndex + 1
            this.changeAutoRetouchImg(setActiveIndex)
          }
          break
        default:
          break
      }
    }
  },
  methods: {
    /**
     * @description 关闭页面
     */
    closeAutoRetouch () {
      this.$emit('closeAutoRetouch', false)
    },
    /**
     * @description 拼接图片地址
     */
    setPhotoUrl (mode, src) {
      if (mode === 'origin') {
        this.url = this.imgDomain + src
      } else {
        this.url = src ? AutoRetouch.algoUrl + '/static/images/' + this.photoList[this.photoIndex] + '/' + src : AutoRetouch.algoUrl + '/static/common/error.png'
      }
      this.hiddenLoading()
    },
    hiddenLoading () {
      this.loading = false
    },
    showLoading () {
      this.loading = true
    },
    /**
     * @description 图片左右切换
     */
    switchPhoto (type) {
      if (type === 'next') {
        if (this.photoIndex >= this.photoList.length - 1) {
          this.photoIndex = 0
        } else {
          this.photoIndex++
        }
      } else {
        if (this.photoIndex === 0) {
          this.photoIndex = this.photoList.length - 1
        } else {
          this.photoIndex--
        }
      }
    },
    /**
     * @description 加载自动修复图片
     */
    async getAutoRetouch () {
      const cachePics = this.cacheRetouchPic.find(cacheItem => cacheItem.photoIndex === this.photoIndex)
      if (cachePics) {
        this.cropImg = cachePics.cropImg
        this.changeAutoRetouchImg(0, 'origin')
        return
      }
      if (this.photoList.length === 0 || !this.loadRetouch) return
      this.showLoading()
      const cropParams = {
        uuid: this.photoList[this.photoIndex]
      }
      try {
        this.cropImg = await AutoRetouch.getAutoCropPic(cropParams)
      } catch {
        this.cropImg = ''
      }
      const retouchData = {
        photoIndex: this.photoIndex,
        cropImg: this.cropImg
      }
      this.cacheRetouchPic.push(retouchData)
      this.changeAutoRetouchImg(0, 'origin')
      this.hiddenLoading()
    },
    /**
     * @description 查看图片
     */
    changeAutoRetouchImg (index) {
      const type = this.funList[index].value
      this.funList.forEach((funItem, funIndex) => {
        funItem.active = funIndex === index
      })
      switch (type) {
        case 'origin':
          this.setPhotoUrl('origin', this.photoList[this.photoIndex])
          break
        case 'crop':
          this.setPhotoUrl('retouched', this.cropImg)
          break
        case 'adjust-one':
          this.setPhotoUrl('retouched', this.adjustOneImg)
          break
        case 'adjust-two':
          this.setPhotoUrl('retouched', this.adjustTwoImg)
          break
        default:
          break
      }
    },
    /**
     * @description 下载图片
     */
    downloadPhoto () {
      const data = {
        url: this.url,
        path: this.streamNum
      }
      DownIpc.addDownloadFile(data)
    }
  }
}
</script>

<style lang="less" scoped>
.auto-retouch {
  position: fixed;
  top: 42px;
  left: 0;
  z-index: 2000;
  display: flex;
  width: 100vw;
  height: calc(100vh - 42px);
  background-color: rgba(0, 0, 0, 0.8);

  .content-box {
    display: flex;
    flex-direction: column;
    width: calc(100vw - 240px);
    height: 100%;

    .content-title {
      height: 40px;
      line-height: 40px;
      color: #fff;
      text-align: center;
    }

    .auto-retouch-img-box {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      height: calc(100% - 40px);

      .img-switch {
        width: 50px;
        height: 50px;
        font-size: 24px;
        line-height: 50px;
        color: #fff;
        text-align: center;
        cursor: pointer;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 100%;
      }

      .el-icon-arrow-left {
        position: absolute;
        top: calc(50% - 25px);
        left: 10px;
      }

      .el-icon-arrow-right {
        position: absolute;
        top: calc(50% - 25px);
        right: 10px;
      }

      img {
        max-width: 100%;
        max-height: 100%;
      }
    }
  }

  .fun-box {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 240px;
    height: 100%;
    border-left: 1px solid #8a8a8a;

    .el-icon-circle-close {
      float: right;
      margin: 10px 15px 10px 0;
      font-size: 28px;
      color: #fff;
      cursor: pointer;
    }

    .btn-box {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      align-items: center;
      justify-content: center;
      text-align: center;

      .el-button {
        width: 140px;
        margin: 0 0 20px 0;
      }
    }

    .back-box {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 80px;
      border-top: 1px solid #8a8a8a;

      .el-button--info {
        width: 140px;
      }
    }
  }
}
</style>
