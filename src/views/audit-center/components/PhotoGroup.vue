<template>
  <div class="photo-grop">
    <div v-for="(photoItem, photoIndex) in photos.priviewPhotoData" :key="photoIndex" class="photo-box">
      <photo-box
        :src="photoItem.path"
        show-joint-label
        show-recede-reason
        :photo-name="photoItem.version === 'first_photo'"
        :tags="photos.tags"
        @click.native="showPriviewPhoto(photoIndex)"
      />
      <div class="button-box">
        <el-button type="text" @click="downing(photoItem.path)">下载原片</el-button>
        <el-upload
          v-if="photoItem.version === 'first_photo'"
          class="upload-crop-button"
          accept="image/*"
          :action="updateDomain + upyunConfigComputed.bucket"
          :show-file-list="false"
          :before-upload="beforeUpload"
          :on-success="handleSuccess"
          :file-list="uploadPhoto"
          :data="upyunConfigComputed"
        >
          <el-button class="warning-color" type="text">覆盖上传</el-button>
        </el-upload>
      </div>
    </div>
    <div class="grade-box">
      <div class="button-list">
        <el-button :disabled="!photos.canGlass" :icon="isPlant ? 'el-icon-check' : ''" type="success" size="small" :class="{'plant-class': isPlant}" :plain="!isPlant" @click="plantPhoto">种草</el-button>
        <el-button :disabled="!photos.canGlass" :icon="isPull ? 'el-icon-check' : ''" type="danger" size="small" :plain="!isPull" @click="pullPhoto">拔草</el-button>
      </div>
      <div v-if="isPlant || isPull" class="reason-box">
        <el-input v-model="photos.grassReason" :placeholder="isPlant | toGlassPlaceholder" />
      </div>
      <div class="button-list">
        <el-button :icon="isReturn ? 'el-icon-check' : ''" type="warning" size="small" :plain="!isReturn" @click="returnPhoto">重修</el-button>
      </div>
      <div class="reason-box">
        <el-input v-if="isReturn" v-model="photos.reworkMarkReason" placeholder="请输入重修理由" />
      </div>
    </div>
    <preview-photo
      v-if="showPreview"
      :imgarray="priviewPhotoData"
      :orderindex="imgIndex"
      :show-preview.sync="showPreview"
    />
  </div>
</template>

<script>
import PhotoBox from '@/components/PhotoBox'
import PreviewPhoto from '@/components/PreviewPhoto/index.vue'

import { mapGetters } from 'vuex'
import * as Commonality from '@/api/commonality'
import * as PhotoTool from '@/utils/photoTool'

export default {
  name: 'PhotoGroup',
  components: { PhotoBox, PreviewPhoto },
  filters: {
    toGlassPlaceholder (value) {
      return value ? '请输入种草理由' : '请输入拔草理由'
    }
  },
  props: {
    photos: { type: Object, required: true },
    upyunConfig: { type: Object, required: true },
    streamNum: { type: String, default: '' } // 流水号
  },
  data () {
    return {
      showPreview: false, // 显示预览
      imgIndex: 0, // 照片id
      priviewPhotoData: [], // 预览数组
      uploadPhoto: [] // 上传照片
    }
  },
  computed: {
    ...mapGetters(['imgDomain', 'updateDomain']),
    isReturn: {
      get () {
        return this.photos.reworkMark
      },
      set (val) {
        this.photos.reworkMark = val
      }
    },
    isPlant () {
      return this.photos.glass === 'plant'
    },
    isPull () {
      return this.photos.glass === 'pull'
    },
    upyunConfigComputed () {
      return this.upyunConfig
    }
  },
  methods: {
    /**
     * @description 下载照片
     */
    downing (src) {
      const data = {
        url: this.imgDomain + src + '?_upd=true',
        caid: this.streamNum
      }
      this.$ipcRenderer.send('downOnePhoto', data)
    },
    /**
     * @description 展示预览
     */
    showPriviewPhoto (photoIndex) {
      this.photos.priviewPhotoData.forEach(item => {
        item.src = this.imgDomain + item.path
      })
      this.priviewPhotoData = this.photos.priviewPhotoData
      this.imgIndex = photoIndex
      this.showPreview = true
    },
    /**
     * @description 上传前回掉
     */
    beforeUpload (file) {
      const isJPG = file.type === 'image/jpeg'
      const isPNG = file.type === 'image/png'
      if (!isJPG && !isPNG) {
        this.$newMessage.warning('上传图片只能是 JPG 或 PNG 格式!')
        return isJPG || isPNG
      }
      this.$store.dispatch('setting/showLoading')
      return true
    },
    /**
     * @description 上传成功回掉
     */
    handleSuccess (response, file, fileList) {
      const path = PhotoTool.handlePicPath(response.url)
      this.createPhotoVersion(path)
    },
    /**
     * @description 覆盖上传
     */
    createPhotoVersion (path) {
      const req = {
        version: 'first_photo',
        photoId: this.photos.id,
        path
      }
      Commonality.createPhotoVersion(req)
        .then(() => {
          this.$newMessage.success('覆盖成功')
          this.photos.priviewPhotoData[1].path = path
          this.$store.dispatch('setting/hiddenLoading')
        })
    },
    /**
     * @description 重修照片
     */
    returnPhoto () {
      this.isReturn = !this.isReturn
    },
    /**
     * @description 种草照片
     */
    plantPhoto () {
      this.photos.glass = this.photos.glass === 'plant' ? '' : 'plant'
    },
    /**
     * @description 拔草照片
     */
    pullPhoto () {
      this.photos.glass = this.photos.glass === 'pull' ? '' : 'pull'
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";
@photoBox: 253px;

.photo-grop {
  display: flex;
  padding: 20px 0;
  flex-wrap: wrap;

  .photo-box {
    width: @photoBox;
    margin-right: 30px;
    cursor: pointer;

    .button-box {
      padding: 12px;
      text-align: center;
      display: flex;
      justify-content: space-between;

      .el-button {
        font-size: 12px;
        padding: 0;
        font-weight: 400;
      }

      .warning-color {
        font-weight: 400;

        &:focus,
        &:hover {
          color: @orange;
        }
      }
    }
  }

  .grade-box {
    width: calc(~'100% - @{photoBox} * 2 - 60px');
    padding-top: 30px;

    .button-list {
      margin-top: 40px;

      .el-button {
        padding: 9px 20px;
      }

      .el-button--success.is-plain:focus,
      .el-button--success.is-plain:hover {
        background-color: @panGreen;
      }

      .plant-class {
        background-color: @panGreen;
      }
    }

    .reason-box {
      margin-top: 16px;
      height: 40px;

      .el-input {
        width: 100%;
      }
    }
  }
}
</style>
