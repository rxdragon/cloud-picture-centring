<template>
  <div class="auto-retouch">
    <div class="content-box">
      <div class="content-title">自动修图</div>
      <div class="auto-retouch-img-box" v-loading="loading">
        <i class="el-icon-arrow-left img-switch" v-if="!isSingle" @click="nextPhoto" />
        <i class="el-icon-arrow-right img-switch" v-if="!isSingle" @click="prePhoto" />
        <img alt="暂无图片" :src="showImage" class="content-img"/>
      </div>
    </div>
    <div class="fun-box">
      <div class="close-box">
        <i class="el-icon-circle-close" @click="closeAutoRetouch" />
      </div>
      <div class="btn-box">
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
import uuidv4 from 'uuid'

const PHOTO_FLAG = {
  ORIGINAL: 'original',
  CROP: 'crop',
  WARP: "warp"
}

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

      loading: false
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
        // this.beforehandLoadPhoto()
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
      activePhoto.activeModel = model
    },
    /**
     * @description 预处理图片
     */
    async beforehandLoadPhoto () {
      // const activePhoto = this.photoPreviewList[this.activeIndex]
      // if (!activePhoto) return
      // // 已经处理过
      // if (activePhoto[PHOTO_FLAG.CROP]) return
      // const handleList = [activePhoto]

      const handleList = this.photoPreviewList
      handleList.forEach(async photoItem => {
        const baseUrl = photoItem.path
        const data = await this.getImageAutoProcess(baseUrl, PHOTO_FLAG.WARP)
        photoItem[PHOTO_FLAG.CROP] = data[PHOTO_FLAG.CROP]
        photoItem[PHOTO_FLAG.WARP] = data[PHOTO_FLAG.WARP]
      })
    },
    getImageAutoProcess (url, model) {
      const req = {
        key: url,
        processFlag: model
      }
      return AutoRetouch.getImageAutoProcess(req)
    },
    /**
     * @description 注册监听事件
     */
    deviceSupportInstall () {
      document.onkeydown = e => {
        const key = window.event.keyCode
        switch (key) {
          // 左右键图片切换
          case 37:
            if (this.isSingle) return
            this.prePhoto()
            break
          case 39:
            if (this.isSingle) return
            this.nextPhoto()
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
     * @description 加载自动修复图片
     */
    async getAutoRetouch () {
      // 判断是否已经缓存过图片地址
      const cachePics = this.cacheRetouchPic.find(cacheItem => cacheItem.activeIndex === this.activeIndex)
      if (cachePics) {
        this.cropImg = cachePics.cropImg
        this.changeAutoRetouchImg(0)
        return
      }

      if (this.photoList.length === 0) return
      this.loading = true
      const cropParams = {
        url: this.photoList[this.activeIndex]
      }
      try {
        this.cropImg = await AutoRetouch.getAutoCropPic(cropParams)
      } catch (error) {
        this.cropImg = ''
      }
      const retouchData = {
        activeIndex: this.activeIndex,
        cropImg: this.cropImg
      }
      this.cacheRetouchPic.push(retouchData)
      this.changeAutoRetouchImg(0)
      this.loading = false
    },
    /**
     * @description 查看图片
     */
    changeAutoRetouchImg (index) {
      // const type = this.funList[index].value
      this.funList.forEach((funItem, funIndex) => {
        funItem.active = funIndex === index
      })
    },
    /**
     * @description 下载图片
     */
    downloadPhoto () {
      // const orgBase = ''
      const data = {
        url: this.showImage,
        path: this.streamNum,
        // TODO 重命名
        rename: '1.jpg'
      }
      const rename = '1.jpg'
      DownIpc.addDownloadFile(data, rename)
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
