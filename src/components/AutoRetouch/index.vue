<template>
  <div class="auto-retouch">
    <div class="content-box">
      <div class="content-title">智能修图</div>
      <div class="auto-retouch-img-box" v-loading="loading">
        <i class="el-icon-arrow-left img-switch" v-if="showSwitchBtn" @click="switchPhoto('next')"/>
        <img  :src="url" class="content-img" @load="loadPhoto" />
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
          @click="getAutoRetouch(funItem.value)"
        >
          {{ funItem.name }}
        </el-button>
      </div>
      <div class="back-box">
        <el-button type="info" @click="downloadPhoto">下载照片</el-button>
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
  },
  data () {
    return {
      funList: [
        {
          name: '原图',
          value: 'origin'
        },
        {
          name: '裁剪图',
          value: 'crop'
        },
        {
          name: '矫正图1',
          value: 'adjust-one'
        },
        {
          name: '矫正图2',
          value: 'adjust-two'
        },
        {
          name: '瘦脸',
          value: 'chubby'
        },
        {
          name: '微笑',
          value: 'smile'
        },
        {
          name: '眼睛',
          value: 'eye'
        }
      ],
      url: '',
      photoIndex: 0, // 图片索引
      showAutoRetouch: false, // 显示自动修图页面
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
        this.setPhotoUrl ('origin', this.photoList[val])
      }
    }
  },
  created () {
    //
    this.setPhotoUrl ('origin', this.photoList[0])
  },
  methods: {
    /**
     * @description 关闭页面
     */
    closeAutoRetouch () {
      this.$emit('closeAutoRetouch', false)
    },
    setPhotoUrl (mode, src) {
      if (mode === 'origin') {
        this.url = this.imgDomain + src
      } else {
        this.url = AutoRetouch.algoUrl + '/static/images/' + this.photoList[this.photoIndex] + '/' + src
      }
    },
    loadPhoto () {
      this.loading = false
    },
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
    async getAutoRetouch (type) {
      switch (type) {
        case 'origin':
          this.setPhotoUrl('origin', this.photoList[0])
          break
        case 'crop':
          this.loading = true
          const params = {
            uuid: this.photoList[this.photoIndex]
          }
          const retouchData = await AutoRetouch.getAutoCropPic(params)
          this.setPhotoUrl('retouched', retouchData)
          break
      }
    },
    downloadPhoto () {
      const data = {
        url: this.url,
        path: this.photoList[this.photoIndex]
      }
      DownIpc.addDownloadFile(data)
    },
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
      flex-grow: 1;
      align-items: center;
      justify-content: center;

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

    .close-box {
      border-bottom: 1px solid #8a8a8a;

      .el-icon-circle-close {
        float: right;
        margin: 10px 15px 10px 0;
        font-size: 28px;
        color: #fff;
        cursor: pointer;
      }
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
