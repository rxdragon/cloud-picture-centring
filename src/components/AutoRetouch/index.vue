<template>
  <div class="auto-retouch">
    <!-- 照片列表区 -->
    <photo-map :listWidth="listWidth">
      <div class="map-content">
        <div
          v-for="(photoItem, photoIndex) in photoPreviewList"
          :key="photoIndex"
          class="photo-module"
        >
          <photo-box
            v-if="photoItem"
            :src="photoItem.showPath"
            :showSpecialEffects="false"
            :class="photoItem.activate && 'photo-box-active'"
            @click.native="selectPhoto(photoIndex)"
            class="photo-box"
          />
          <div class="photo-index">{{ photoIndex + 1 }} / {{ photoPreviewList.length }}</div>
        </div>
      </div>
    </photo-map>

    <div class="content-box">
      <auto-image :autoImageInfo="activePhoto" />
      <!-- <div class="content-title">
        自动修图 {{ activeIndex + 1 }} / {{ photoPreviewList.length }}
        <i @click="guideInfo" class="info-tool el-icon-info"></i>
      </div> -->
      <!-- <div class="auto-retouch-img-box" v-loading="loading">
        <img
          alt="暂无图片"
          :src="showImage"
          class="content-img"
          @load="onImageLoaded"
        />
      </div> -->
    </div>
    <!-- 操作 -->
    <operation-box class="operation-module" :handleSwtich="activePhoto.handleSwtich" />
    <!-- <div class="fun-box">
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
    </div> -->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { PHOTO_FLAG } from '@/utils/enumerate.js'
import PhotoMap from './PhotoMap'
import OperationBox from './OperationBox'
import AutoImage from './AutoImage'
import PhotoBox from '@/components/PhotoBox'
import Vue from 'vue'

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
    // 当前激活照片
    activePhoto () {
      const findActivePhoto = this.photoPreviewList.find(item => _.get(item, 'activate'))
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
      const photoPreviewList = Vue.observable([])
      this.photoPreviewList = photoPreviewList
      this.photoList.forEach(async (photoUrl, photoIndex) => {
        const autoRetouchModel = new AutoRetouchModel(photoUrl)
        await autoRetouchModel.getAutoList()
        autoRetouchModel.showPath = changeToCompress(autoRetouchModel.autoFixPhotoList[OperationBit[OPERATION_TYPE.CROP]])
        if (photoIndex === 0) {
          autoRetouchModel.activate = true
        }
        this.$set(photoPreviewList, photoIndex, autoRetouchModel)
      })
    },
    /**
     * @description 选中照片
     */
    selectPhoto (photoIndex) {
      this.photoPreviewList.forEach(item => {
        item.activate = false
      })
      this.photoPreviewList[photoIndex].activate = true
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
  height: 100vh;
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
