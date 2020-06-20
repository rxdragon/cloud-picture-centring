<template>
  <div class="identify-image">
    <div class="header">
      <h3>云端识图</h3>
    </div>
    <div
      class="identify-main module-panel"
      v-if="identifyState !== IDENTIFY_STATE.IDENTIFY_DONE"
    >
      <el-upload
        v-if="identifyState === IDENTIFY_STATE.BEFOR_UPDATE"
        class="upload-main"
        drag
        :action="updateDomain"
        :show-file-list="false"
        :before-upload="beforeUpload"
        :on-progress="handleProgress"
        :on-success="handleSuccess"
        :on-error="handleError"
        :data="upyunConfig"
      >
        <i class="el-icon-picture-outline"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <div class="progress-box" v-else>
        <el-progress :percentage="percentageAge" :show-text="false" />
        <div class="progress-text">
          {{ identifyState === 'identifying' ? '识别中' : '上传中' }} {{ percentageAge }} %
        </div>
      </div>
    </div>
    <div class="identify-box module-panel" v-else>
      <div class="upload-box">
        <div class="panel-title">识别图片</div>
        <div class="upload-photo">
          <photo-box
            class="photo-box"
            photo-name
            preview-breviary
            :src="uploadPhoto"
          />
        </div>
      </div>
      <el-divider></el-divider>
      <div class="search-result">
        <div class="panel-title">
          <span>搜索结果</span>
          <div class="panel-slot">
            <el-button size="small" plain type="primary">查看订单</el-button>
            <el-button type="primary" size="small">查看流水单</el-button>
          </div>
        </div>
        <div class="panel-main">
          <div class="match-photo">
            <photo-box
              class="photo-box"
              photo-name
              preview-breviary
              :src="uploadPhoto"
            />
          </div>
          <div class="match-info">
            <identify-order-info />
          </div>
        </div>
      </div>
      <el-divider></el-divider>
      <simulate-photos />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as Commonality from '@/api/commonality'
import PhotoBox from '@/components/PhotoBox'
import IdentifyOrderInfo from './components/IdentifyOrderInfo'
import SimulatePhotos from './components/SimulatePhotos'

const IDENTIFY_STATE = {
  'BEFOR_UPDATE': 'beforeUpdate',
  'UPDATEING': 'updateing',
  'IDENTIFYING': 'identifying',
  'IDENTIFY_DONE': 'identifyDone'
}

export default {
  name: 'IdentifyImage',
  components: { PhotoBox, IdentifyOrderInfo, SimulatePhotos },
  data () {
    return {
      IDENTIFY_STATE,
      upyunConfig: {}, // 七牛云配置
      percentageAge: 0,
      identifyState: 'identifyDone', // 识别状态
      searchTimer: null,
      similarityImageList: [],
      selectPhotoId: '',
      selectOrderInfo: {},
      uploadPhoto: '2020/05/05/lkWd_6m82023L3kcvVyDxIGoPN0V.jpg'
    }
  },
  computed: {
    ...mapGetters(['updateDomain']),
    hasSelectOrderInfo () {
      return Object.keys(this.selectOrderInfo).length
    }
  },
  watch: {
    selectPhotoId: {
      handler (value) {
        if (value) {
          this.getOrderInfo(value)
        }
      }
    }
  },
  created () {
    this.getUpyunSign()
  },
  methods: {
    beforeUpload () {
      this.identifyState = IDENTIFY_STATE.UPDATEING
    },
    handleProgress (event, file, fileList) {
      this.percentageAge = Number(Math.floor(event.percent / 2))
    },
    async handleSuccess (response, file, fileList) {
      this.simulatePercentageAge()
      this.identifyState = IDENTIFY_STATE.IDENTIFYING
      await this.getSimilarity(response)
    },
    handleError () {
      // TODO
    },
    async getSimilarity (path) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // 是被完成
          this.similarityImageList = ['1']
          this.selectPhotoId = '1'
          this.identifyState = IDENTIFY_STATE.IDENTIFY_DONE
          resolve()
        }, 5000)
      })
    },
    getOrderInfo (id) {
      this.selectOrderInfo = {
        id: '1'
      }
    },
    simulatePercentageAge () {
      this.searchTimer = setInterval(() => {
        const STEP = 5
        if (this.percentageAge >= 90) {
          // 结果已返回，则设置100%
          if (this.identifyState === IDENTIFY_STATE.IDENTIFY_DONE) {
            this.percentageAge = 100
            return clearInterval(this.searchTimer)
          }
        } else {
          this.percentageAge = this.percentageAge + STEP
        }
      }, 300)
    },
    /**
     * @description 获取又拍云
     */
    async getUpyunSign () {
      this.upyunConfig = await Commonality.getSignature()
    }
  }
}
</script>

<style lang="less">
.identify-image {
  .identify-main {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(~'@{appMainHeight} - 24px');

    .neumorphism-box {
      background: #fff;
      border-radius: 20px;
      box-shadow:
        inset 10px 10px 20px #d9d9d9,
        inset -10px -10px 20px #fff;
    }

    .upload-main {
      width: 500px;
      height: 500px;

      .el-upload {
        width: 100%;
        height: 100%;
        background: #fff;

        .el-upload-dragger {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          border: none;
          .neumorphism-box();

          .el-icon-picture-outline {
            font-size: 100px;
            color: #ebecf0;
          }

          .el-upload__text {
            margin-top: 20px;
            font-size: 16px;
            color: #676e9b;

            em {
              font-weight: 500;
              color: #558fb7;
            }
          }
        }
      }
    }

    .progress-box {
      .neumorphism-box();

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 500px;
      height: 500px;

      .el-progress {
        width: 80%;
      }

      .progress-text {
        margin-top: 12px;
        font-size: 14px;
        color: #999;
      }
    }
  }

  .identify-box {
    min-height: calc(~'@{appMainHeight} - 24px');

    .upload-box {
      .panel-title {
        margin-bottom: 20px;
      }

      .upload-photo {
        width: 253px;
      }
    }

    .search-result {
      .panel-title {
        margin-bottom: 20px;
      }

      .panel-main {
        display: flex;

        .match-photo {
          width: 400px;
        }

        .match-info {
          width: calc(100% - 400px);
          padding: 20px;
        }
      }
    }
  }
}
</style>
