<template>
  <div class="auto-retouch">
    <!-- 照片列表区 -->
    <photo-map :listWidth="listWidth">
      <div class="test" v-for="item in 8" :key="item">{{ item }}</div>
    </photo-map>

    <div class="content-box">
      <div class="content-title">
        自动修图 {{ activeIndex + 1 }} / {{ photoPreviewList.length }}
        <i @click="guideInfo" class="info-tool el-icon-info"></i>
      </div>
      <div class="auto-retouch-img-box" v-loading="loading">
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
        <div class="fun-module" v-for="(funItem, funIndex) in funList" :key="funIndex">
          <el-button
            size="medium"
            @click="changeActiveModel(funItem.value)"
            :type="activePhoto[funItem.value] === 'error' ? 'danger' : 'primary'"
            :loading="!activePhoto[funItem.value]"
            :disabled="activePhoto.activeModel === funItem.value || !activePhoto[funItem.value] || activePhoto[funItem.value] === 'error'"
          >
            {{ activePhoto[funItem.value] === 'error' ? `${funItem.name}失败` : funItem.name }}
          </el-button>
          <!-- 磨皮按钮 -->
          <template v-if="(funItem.value === PHOTO_FLAG.CROP || funItem.value === PHOTO_FLAG.WARP) && showBufferBtn">
            <template
              v-for="(childrenItem, childrenIndex) in funItem.childrenFun"
            >
              <el-button
                :key="childrenIndex"
                size="medium"
                @click="changeActiveModel(childrenItem.value)"
                :type="activePhoto[childrenItem.value] === 'error' ? 'danger' : 'primary'"
                :loading="!activePhoto[childrenItem.value]"
                :disabled="activePhoto.activeModel === childrenItem.value || !activePhoto[childrenItem.value] || activePhoto[childrenItem.value] === 'error'"
              >
                {{ activePhoto[childrenItem.value] === 'error' ? `${childrenItem.name}失败` : childrenItem.name }}
              </el-button>
            </template>
          </template>
        </div>
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
import PhotoMap from './PhotoMap'
import DownIpc from '@electronMain/ipc/DownIpc'
import uuidv4 from 'uuid'
import Driver from 'driver.js' // 引导框
import guideData from './guideData.js' // 引导内容

import * as AutoRetouch from '@/api/autoRetouch'
import * as PhotoTool from '@/utils/photoTool'
import * as AutoLog from '@/views/retoucher-center/autoLog.js'

export default {
  name: "AutoRetouch",
  components: { PhotoMap },
  props: {
    photoList: { type: Array, default: () => [] },
    streamNum: { type: String, default: '' }
  },
  data () {
    return {
      PHOTO_FLAG,
      listWidth: 224,
      photoPreviewList: [],
      funList: [
        {
          name: '原图',
          value: PHOTO_FLAG.ORIGINAL
        },
        {
          name: '裁剪图',
          value: PHOTO_FLAG.CROP,
          childrenFun: [
            {
              name: '裁剪磨皮',
              value: PHOTO_FLAG.CROP_BUFFING
            }
          ]
        },
        {
          name: '液化图',
          value: PHOTO_FLAG.WARP,
          childrenFun: [
            {
              name: '液化磨皮',
              value: PHOTO_FLAG.WARP_BUFFING
            }
          ]
        }
      ], // 按钮列表
      activeIndex: 0, // 当前展示图片索引
      loading: false,
      driver: null
    }
  },
  computed: {
    ...mapGetters(['imgDomain', 'autoBuffingA', 'autoBuffingB']),
    // 显示磨皮按钮
    showBufferBtn () {
      // TODO 调试
      return true
      return this.autoBuffingA || this.autoBuffingB
    },
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
          [PHOTO_FLAG.WARP]: '',
          [PHOTO_FLAG.CROP_BUFFING]: '',
          [PHOTO_FLAG.WARP_BUFFING]: ''
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
      const allFunList = this.funList.reduce((accumulator, currentValue) => {
        if (currentValue.childrenFun && this.showBufferBtn) return [...accumulator, currentValue, ...currentValue.childrenFun]
        return [...accumulator, currentValue]
      }, [])
      const modeIndex = allFunList.findIndex(modelItem => modelItem.value === this.activePhoto.activeModel)
      const len = allFunList.length
      const preIndex = (modeIndex - 1 + len) % len
      const preModeType = allFunList[preIndex].value
      this.changeActiveModel(preModeType)
    },
    /**
     * @description 下一个模式
     */
    nextMode () {
      const allFunList = this.funList.reduce((accumulator, currentValue) => {
        if (currentValue.childrenFun && this.showBufferBtn) return [...accumulator, currentValue, ...currentValue.childrenFun]
        return [...accumulator, currentValue]
      }, [])
      const modeIndex = allFunList.findIndex(modelItem => modelItem.value === this.activePhoto.activeModel)
      const len = allFunList.length
      const nextIndex = (modeIndex + 1) % len
      const nextModeType = allFunList[nextIndex].value
      this.changeActiveModel(nextModeType)
    },
    /**
     * @description 预处理图片液化-裁切图
     */
    async beforehandLoadPhoto () {
      const handleList = this.photoPreviewList
      handleList.forEach(async photoItem => {
        const baseUrl = photoItem.path
        this.getImageAutoProcess(baseUrl, PHOTO_FLAG.WARP)
          .then(data => {
            photoItem[PHOTO_FLAG.CROP] = data[PHOTO_FLAG.CROP]
            photoItem[PHOTO_FLAG.WARP] = data[PHOTO_FLAG.WARP]
          })
        if (this.showBufferBtn) {
          this.getImageAutoBuffing(baseUrl)
            .then(buffData => {
              photoItem[PHOTO_FLAG.CROP_BUFFING] = buffData[PHOTO_FLAG.CROP_BUFFING]
              photoItem[PHOTO_FLAG.WARP_BUFFING] = buffData[PHOTO_FLAG.WARP_BUFFING]
            })
        }
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
     * @description 获取自动磨皮接口
     */
    getImageAutoBuffing (url) {
      const req = {
        url,
        process_flag: 'retouch',
        retouch_flag: this.autoBuffingA ? 'A' : 'B'
      }

      return AutoRetouch.getImageAutoBuffing(req)
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
    },
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

  .test {
    color: @red;
  }

  .content-box {
    width: calc(100vw - 240px);
    height: 100%;
    transition: all 0.3s;

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
    flex-shrink: 0;
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

      .fun-module {
        width: 100%;
        margin-bottom: 20px;
        border-bottom: 1px solid #8a8a8a;

        .el-button {
          width: 140px;
          margin: 0 0 20px 0;
        }
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
