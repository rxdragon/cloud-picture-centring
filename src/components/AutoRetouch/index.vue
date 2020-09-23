<template>
  <div class="auto-retouch">
    <div class="content-box">
      <div class="content-title">
        自动修图 {{ activeIndex + 1 }} / {{ photoPreviewList.length }}
        <i @click="guideInfo" class="info-tool el-icon-info"></i>
      </div>
      <div class="auto-retouch-img-box" v-loading="loading">
        <i
          id="guideleft"
          class="el-icon-arrow-left img-switch"
          v-if="!isSingle"
          @click="prePhoto"
        />
        <i
          id="guideright"
          class="el-icon-arrow-right img-switch"
          v-if="!isSingle"
          @click="nextPhoto"
        />
        <img
          alt="暂无图片"
          :src="showImage"
          class="content-img"
          @load="onImageLoaded"
        />
      </div>
    </div>
    <div class="fun-box">
      <div class="close-box">
        <i id="guideclose" class="el-icon-circle-close" @click="closeAutoRetouch" />
      </div>
      <div id="guidemode" class="btn-box">
        <el-button
          :type="activePhoto[funItem.value] === 'error' ? 'danger' : 'primary'"
          v-for="(funItem, funIndex) in funList"
          :key="funIndex"
          :loading="!activePhoto[funItem.value]"
          :disabled="activePhoto.activeModel === funItem.value || !activePhoto[funItem.value] || activePhoto[funItem.value] === 'error'"
          @click="changeActiveModel(funItem.value)"
        >
          {{ activePhoto[funItem.value] === 'error' ? `${funItem.name}失败` : funItem.name }}
        </el-button>
      </div>
      <div id="guidedown" class="back-box">
        <el-button type="info" @click="downloadPhoto" :disabled="loading">下载照片</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { PHOTO_FLAG } from '@/utils/enumerate.js'
import DownIpc from '@electronMain/ipc/DownIpc'
import uuidv4 from 'uuid'
import Driver from 'driver.js' // 引导框
import guideData from './guideData.js' // 引导内容

import * as AutoRetouch from '@/api/autoRetouch'
import * as PhotoTool from '@/utils/photoTool'
import * as AutoLog from '@/views/retoucher-center/autoLog.js'

export default {
  name: "AutoRetouch",
  props: {
    photoList: { type: Array, default: () => [] },
    streamNum: { type: String, default: '' }
  },
  data () {
    return {
      photoPreviewList: [],
      funList: [
        {
          name: '原图',
          value: PHOTO_FLAG.ORIGINAL
        },
        {
          name: '裁剪图',
          value: PHOTO_FLAG.CROP
        },
        {
          name: '液化图',
          value: PHOTO_FLAG.WARP
        }
      ],
      activeIndex: 0, // 当前展示图片索引
      loading: false,
      driver: null
    }
  },
  computed: {
    ...mapGetters(['imgDomain']),
    isSingle () {
      return this.photoList.length === 1
    },
    // 当前激活图片
    activePhoto () {
      return this.photoPreviewList[this.activeIndex] || {}
    },
    // 展示图片
    showImage () {
      if (!this.activePhoto) return ''
      return this.activePhoto[this.activePhoto.activeModel]
    }
  },
  watch: {
    activeIndex: {
      handler () {
        this.loading = true
      }
    },
    photoList: {
      handler () {
        this.handlePhotoList()
        this.beforehandLoadPhoto()
      },
      immediate: true
    }
  },
  created () {
    this.guideInstall()
  },
  mounted () {
    this.deviceSupportInstall()
  },
  beforeDestroy () {
    this.deviceSupportUninstall()
  },
  methods: {
    /**
     * @description 处理图片列表
     */
    handlePhotoList () {
      this.photoPreviewList = []
      this.photoList.forEach(photoUrl => {
        const createPhoto = {
          uuid: uuidv4(),
          activeModel: PHOTO_FLAG.ORIGINAL,
          path: photoUrl,
          [PHOTO_FLAG.ORIGINAL]: this.imgDomain + photoUrl,
          [PHOTO_FLAG.CROP]: '',
          [PHOTO_FLAG.WARP]: ''
        }
        this.photoPreviewList.push(createPhoto)
      })
    },
    /**
     * @description 上一张
     */
    prePhoto () {
      const len = this.photoPreviewList.length
      this.activeIndex = (this.activeIndex - 1 + len) % len
    },
    /**
     * @description 下一张
     */
    nextPhoto () {
      const len = this.photoPreviewList.length
      this.activeIndex = (this.activeIndex + 1) % len
    },
    /**
     * @description 激活模式
     */
    changeActiveModel (model) {
      const activePhoto = this.photoPreviewList[this.activeIndex]
      if (!activePhoto) return
      if (!activePhoto[model] || activePhoto[model] === 'error') return
      this.loading = true
      activePhoto.activeModel = model
    },
    /**
     * @description 上一个模式
     */
    preMode () {
      const modeIndex = this.funList.findIndex(modelItem => modelItem.value === this.activePhoto.activeModel)
      const len = this.funList.length
      const preIndex = (modeIndex - 1 + len) % len
      const preModeType = this.funList[preIndex].value
      this.changeActiveModel(preModeType)
    },
    /**
     * @description 下一个模式
     */
    nextMode () {
      const modeIndex = this.funList.findIndex(modelItem => modelItem.value === this.activePhoto.activeModel)
      const len = this.funList.length
      const nextIndex = (modeIndex + 1) % len
      const nextModeType = this.funList[nextIndex].value
      this.changeActiveModel(nextModeType)
    },
    /**
     * @description 预处理图片
     */
    async beforehandLoadPhoto () {
      const handleList = this.photoPreviewList
      handleList.forEach(async photoItem => {
        const baseUrl = photoItem.path
        const data = await this.getImageAutoProcess(baseUrl, PHOTO_FLAG.WARP)
        photoItem[PHOTO_FLAG.CROP] = data[PHOTO_FLAG.CROP]
        photoItem[PHOTO_FLAG.WARP] = data[PHOTO_FLAG.WARP]
      })
    },
    /**
     * @description 获取自动修图
     */
    getImageAutoProcess (url, model) {
      const req = {
        url,
        process_flag: model
      }
      return AutoRetouch.getImageAutoProcess(req)
    },
    /**
     * @description 注册监听事件
     */
    deviceSupportInstall () {
      document.onkeydown = e => {
        if (!this.$parent._data.showAutoRetouch) return
        const key = window.event.keyCode
        switch (key) {
          // 左右键图片切换
          case 37:
          case 65:
            if (this.isSingle) return
            this.prePhoto()
            break
          case 39:
          case 68:
            if (this.isSingle) return
            this.nextPhoto()
            break
          case 38:
          case 87:
            this.preMode()
            break
          case 83:
          case 40:
            this.nextMode()
            break
          case 27:
            this.closeAutoRetouch()
            break
          case 88:
            this.downloadPhoto()
            break
          default:
            break
        }
      }
    },
    /**
     * @description 取消订单注册
     */
    deviceSupportUninstall () {
      document.onkeydown = null
    },
    /**
     * @description 图片加载成功
     */
    onImageLoaded () {
      this.loading = false
    },
    /**
     * @description 关闭页面
     */
    closeAutoRetouch () {
      this.$emit('closeAutoRetouch', false)
    },
    /**
     * @description 注册引导插件
     */
    guideInstall () {
      this.driver = new Driver({
        nextBtnText: '下一个',
        prevBtnText: '上一个',
        doneBtnText: '完成',
        closeBtnText: '关闭',
        animate: true
      })
    },
    /**
     * @description 注册事件
     */
    guideInfo () {
      this.driver.defineSteps(guideData)
      setTimeout(() => {
        this.driver.start()
      }, 100)
    },
    /**
     * @description 下载图片
     */
    downloadPhoto () {
      const orgBaseRealPath = PhotoTool.realName(this.activePhoto.path)

      const ext = PhotoTool.getFilePostfix(orgBaseRealPath).toLowerCase()
      const name = PhotoTool.fileNameFormat(orgBaseRealPath)
      const { activeModel } = this.activePhoto
      let rename = `${name}${ext}`
      if (activeModel !== PHOTO_FLAG.ORIGINAL) {
        rename = `${name}~${activeModel}${ext}`
      }
      AutoLog.downLog(this.activePhoto.path, activeModel)
      const data = {
        url: this.showImage,
        path: this.streamNum,
        rename
      }
      DownIpc.addDownloadFile(data, rename)
    }
  }
}
</script>

<style lang="less" scoped>
@navtop: 42px;

.auto-retouch {
  position: fixed;
  top: @navtop;
  left: 0;
  z-index: 1000 !important;
  display: flex;
  width: 100vw;
  height: 100vh;
  height: calc(100vh - @navtop);
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.8);

  .content-box {
    width: calc(100vw - 240px);
    height: 100%;

    .content-title {
      height: 40px;
      line-height: 40px;
      color: #fff;
      text-align: center;

      .info-tool {
        margin-left: 12px;
        cursor: pointer;

        &:hover {
          color: @blue;
        }
      }
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
