<template>
  <div class="auto-retouch">
    <!-- 照片列表区 -->
    <photo-map :listWidth="listWidth">
      <div class="map-content">
        <div v-for="(photoItem, uuid) in photoPreviewList" :key="uuid" class="photo-module">
          <transition name="fade" mode="out-in">
            <photo-box
              v-if="photoItem.isLoaded"
              :src="photoItem.showPath"
              :showSpecialEffects="false"
              :class="photoItem.activate && 'photo-box-active'"
              @click.native="selectPhoto(uuid)"
              class="photo-box"
            />
            <div class="skeleton-photo" v-else>
              <div class="image-content"></div>
              <div class="text-content"></div>
              <div class="text-content"></div>
            </div>
          </transition>
          <div class="photo-index">{{ photoItem.photoIndex }} / {{ photoList.length }}</div>
        </div>
      </div>
    </photo-map>

    <div class="content-box">
      <auto-image :autoImageInfo="activePhoto" />
    </div>
    <!-- 操作 -->
    <operation-box class="operation-module" :handleSwtich="activePhoto.handleSwtich" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { PHOTO_FLAG } from '@/utils/enumerate.js'
import PhotoMap from './PhotoMap'
import OperationBox from './OperationBox'
import AutoImage from './AutoImage'
import PhotoBox from '@/components/PhotoBox'

import DownIpc from '@electronMain/ipc/DownIpc'


import { OperationBit, OPERATION_TYPE, AutoRetouchModel, changeToCompress } from '@/api/autoRetouch'
import * as PhotoTool from '@/utils/photoTool'
import * as AutoLog from '@/views/retoucher-center/autoLog.js'

export default {
  name: "AutoRetouch",
  components: { PhotoMap, OperationBox, PhotoBox, AutoImage },
  props: {
    photoList: { type: Array, default: () => [] },
    streamNum: { type: String, default: '' }
  },
  data () {
    return {
      PHOTO_FLAG,
      listWidth: 224,
      photoPreviewList: {}
    }
  },
  computed: {
    ...mapGetters(['imgDomain', 'autoBuffingA', 'autoBuffingB']),
    // 当前激活照片
    activePhoto () {
      const photoPreviewListArr = Object.values(this.photoPreviewList)
      const findActivePhoto = photoPreviewListArr.find(item => _.get(item, 'activate'))
      return findActivePhoto || {}
    }
  },
  watch: {
    photoList: {
      handler () {
        this.handlePhotoList()
        // this.beforehandLoadPhoto()
      },
      immediate: true
    }
  },
  methods: {
    /**
     * @description 处理图片列表
     */
    async handlePhotoList () {
      this.photoPreviewList = {}
      this.photoList.forEach(async (photoUrl, photoIndex) => {
        const autoRetouchModel = new AutoRetouchModel(photoUrl)
        const uuid = autoRetouchModel.uuid
        autoRetouchModel.photoIndex = photoIndex + 1
        this.$set(this.photoPreviewList, uuid, autoRetouchModel)
        await autoRetouchModel.getAutoList()
        autoRetouchModel.isLoaded = true
        autoRetouchModel.showPath = changeToCompress(autoRetouchModel.autoFixPhotoList[OperationBit[OPERATION_TYPE.CROP]])
        if (photoIndex === 0) { autoRetouchModel.activate = true }
      })
    },
    /**
     * @description 选中照片
     */
    selectPhoto (uuid) {
      const photoPreviewListArr = Object.values(this.photoPreviewList)
      photoPreviewListArr.forEach(item => {
        item.activate = false
      })
      this.photoPreviewList[uuid].activate = true
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
@operationWidth: 240px;

.auto-retouch {
  position: fixed;
  top: @navtop;
  left: 0;
  z-index: 1000 !important;
  display: flex;
  width: 100vw;
  height: calc(100vh - @navtop);
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.8);

  .map-content {
    padding: 20px 20px 0 20px;

    .photo-module {
      margin: 0 0 20px 0;
      border-bottom: 1px solid #ebeef530;

      .photo-index {
        padding: 8px 0 12px 0;
        font-size: 14px;
        color: #fff;
      }

      .photo-box {
        cursor: pointer;
        border: 4px solid transparent;
        transition: all 0.3s;
      }

      .photo-box-active {
        border: 4px solid @blue;
      }

      .skeleton-photo {
        --loading-grey: #ededed;

        width: 100%;
        height: 0;
        padding-bottom: 100%;
        overflow: hidden;
        background-color: #fff;
        border: 10px solid #fff;
        border-radius: 4px;

        .image-content {
          width: 100%;
          height: 0;
          padding-bottom: 55%;
          margin-bottom: 15%;
          background-color: #ededed;
          border-radius: 4px;
        }

        .text-content {
          width: 100%;
          height: 0;
          padding-bottom: 15%;
          margin-bottom: 8%;
          background-color: #ededed;
          border-radius: 4px;
        }

        .text-content,
        .image-content {
          background: linear-gradient(100deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0) 60%) var(--loading-grey);
          background-color: var(--loading-grey);
          background-position-x: 180%;
          background-size: 200% 100%;
          animation: 1s loading ease-in-out infinite;
        }

        @keyframes loading {
          to {
            background-position-x: -20%;
          }
        }
      }
    }
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

  .operation-module {
    box-sizing: border-box;
    flex-shrink: 0;
    width: @operationWidth;
    height: 100%;
    background: #535353;
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
