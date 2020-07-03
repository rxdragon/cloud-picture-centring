<template>
  <div class="identify-image">
    <div class="header">
      <h3>云端识图</h3>
    </div>
    <div class="identify-main module-panel" v-if="!hasIdentify">
      <identify-update
        ref="identifyUpdate1"
        :state.sync="identifyState"
        :identify-progress="percentageAge"
        @uploadSuccess="getSimilarity"
      />
    </div>
    <div class="identify-box module-panel" v-else>
      <!-- 上传图片 -->
      <div class="upload-box">
        <div class="panel-title">识别图片</div>
        <div class="upload-content">
          <div class="upload-photo">
            <photo-box
              v-if="identifyState !== IDENTIFY_STATE.UPDATEING"
              class="photo-box"
              photo-name
              contain-photo
              preview
              :fileData="uploadFile"
            />
          </div>
          <div class="upload-module">
            <identify-update
              ref="identifyUpdate2"
              :state.sync="identifyState"
              :identify-progress="percentageAge"
              @uploadSuccess="getSimilarity"
            />
          </div>
        </div>
        <el-divider></el-divider>
      </div>
      <!-- 搜索结果 -->
      <template v-if="similarityImageList.length">
        <div class="search-result">
          <div class="panel-title">
            <span>搜索结果</span>
            <div class="panel-slot">
              <div class="dev-debug" v-if="$isDev">
                <el-input v-model.trim="devImagePath" @keydown.native.enter="getPhotoInfo" clearable />
                <el-button @click="getPhotoInfo">搜 索</el-button>
              </div>
              <el-button
                size="small"
                plain
                type="primary"
                @click="checkOrderInfo(selectOrderInfo.orderInfo.externalNum)"
              >
                查看订单
              </el-button>
              <el-button
                type="primary"
                size="small"
                @click="checkStreamInfo(selectOrderInfo.streamInfo.streamNum)"
              >
                查看流水单
              </el-button>
            </div>
          </div>
          <div class="panel-main" v-loading="photoInfoLoading">
            <div class="match-photo">
              <photo-box
                class="photo-box"
                photo-name
                contain-photo
                preview
                :src="selectPhotoPaht"
              />
            </div>
            <div class="match-info">
              <identify-order-info v-if="hasSelectOrderInfo" :order-data="selectOrderInfo" />
            </div>
          </div>
        </div>
        <el-divider></el-divider>
        <simulate-photos :similarity-image-list="similarityImageList" :select-photo-id.sync="selectPhotoId" />
      </template>
      <div class="no-match" v-else>
        <no-data desc="暂无相关照片信息数据" />
      </div>
    </div>
  </div>
</template>

<script>
import PhotoBox from '@/components/PhotoBox'
import IdentifyOrderInfo from './components/IdentifyOrderInfo'
import IdentifyUpdate from './components/IdentifyUpdate'
import SimulatePhotos from './components/SimulatePhotos'
import NoData from '@/components/NoData'
import * as IdentifyImage from '@/api/identifyImage.js'

const IDENTIFY_STATE = {
  'BEFOR_UPDATE': 'beforeUpdate',
  'UPDATEING': 'updateing',
  'IDENTIFYING': 'identifying',
  'IDENTIFY_DONE': 'identifyDone'
}

export default {
  name: 'IdentifyImage',
  components: { PhotoBox, IdentifyOrderInfo, SimulatePhotos, NoData, IdentifyUpdate },
  data () {
    return {
      IDENTIFY_STATE,
      percentageAge: 0,
      identifyState: IDENTIFY_STATE.BEFOR_UPDATE, // 识别状态
      searchTimer: null,
      similarityImageList: [], // 相似图片列表
      selectPhotoId: '',
      selectOrderInfo: {},
      hasIdentify: false,
      photoInfoLoading: false, // 获取信息加载
      uploadFile: null, // 上传图片
      devImagePath: '' // 图片测试路径
    }
  },
  computed: {
    // 是否有订单信息
    hasSelectOrderInfo () {
      return Object.keys(this.selectOrderInfo).length
    },
    // 选中图片
    selectPhotoPaht () {
      const productionDomain = 'https://cloud.cdn-qn.hzmantu.com/compress/'
      const findSelectPhoto = this.similarityImageList.find(item => item.id === this.selectPhotoId)
      if (!findSelectPhoto) return ''
      return productionDomain + findSelectPhoto.path
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
  methods: {
    /**
     * @description 匹配相似图片
     */
    async getSimilarity (sendMsg) {
      try {
        const { path, file } = sendMsg
        this.uploadFile = file
        this.simulatePercentageAge()
        const req = {
          imageKey: path,
          top: 10
        }
        this.similarityImageList = await IdentifyImage.getSimilarPhotoList(req)
        this.selectPhotoId = this.similarityImageList[0].id

        this.identifyState = IDENTIFY_STATE.IDENTIFY_DONE
        if (this.searchTimer) {
          clearInterval(this.searchTimer)
          this.searchTimer = null
          this.percentageAge = 50
          this.hasIdentify = true
        }
      } catch (error) {
        this.$newMessage.error('识别失败')
      } finally {
        if (this.$refs.identifyUpdate1) { this.$refs.identifyUpdate1.resetUpload() }
        if (this.$refs.identifyUpdate2) { this.$refs.identifyUpdate2.resetUpload() }
      }
    },
    /**
     * @description 根据照片path获取流水信息
     */
    async getOrderInfo (id) {
      try {
        const findSelectPhoto = this.similarityImageList.find(item => item.id === id)
        if (!findSelectPhoto || this.$isDev) return
        this.photoInfoLoading = true
        const domain = this.$isDev ? 'upload_dev/' : 'upload/'
        const req = { imagePath: domain + findSelectPhoto.path }
        const data = await IdentifyImage.getPhotoStreamInfo(req)
        this.selectOrderInfo = data
      } catch (error) {
        console.error(error)
      } finally {
        this.photoInfoLoading = false
        this.percentageAge = 0
      }
    },
    /**
     * @description 调试获取图片，图像识别返回线上数据，所以要手动查询dev图片数据
     */
    async getPhotoInfo () {
      try {
        if (!this.devImagePath.includes('upload_dev')) return this.$newMessage.warning('请输入预发照片地址')
        this.photoInfoLoading = true
        const req = { imagePath: this.devImagePath }
        const data = await IdentifyImage.getPhotoStreamInfo(req)
        this.selectOrderInfo = data
      } catch (error) {
        console.error(error)
      } finally {
        this.photoInfoLoading = false
        this.percentageAge = 0
      }
    },
    /**
     * @description 模拟获取识别进度
     */
    simulatePercentageAge () {
      this.searchTimer = setInterval(() => {
        const STEP = 5
        if (this.percentageAge >= 40) {
          // 结果已返回，则设置100%
          if (this.identifyState === IDENTIFY_STATE.IDENTIFY_DONE) {
            this.percentageAge = 50
            clearInterval(this.searchTimer)
            this.searchTimer = null
            this.hasIdentify = true
            return
          }
        } else {
          this.percentageAge = this.percentageAge + STEP
        }
      }, 300)
    },
    /**
     * @description 查看流水信息
     */
    checkStreamInfo (streamNum) {
      this.$router.push({
        path: '/guest-photo/guest-photo-center',
        query: { streamNum }
      })
    },
    /**
     * @description 查看订单信息
     */
    checkOrderInfo (orderNum) {
      this.$router.push({
        path: '/guest-photo/guest-photo-center',
        query: { orderNum }
      })
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

      .upload-content {
        display: flex;
        justify-content: space-between;

        .upload-photo {
          width: 253px;
        }

        .upload-module {
          float: right;
          width: 253px;
          height: 253px;
          background-color: #f5f7fa;
          border-radius: 4px;

          .identify-update {
            width: 100%;
            height: 100%;
          }

          .upload-main {
            width: 100%;
            height: 100%;

            .el-upload {
              width: 100%;
              height: 100%;

              .el-upload-dragger {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                background: #f5f7fa;
                border: none;

                .el-icon-picture-outline {
                  font-size: 50px;
                  color: #ebecf0;
                }

                .el-upload__text {
                  margin-top: 20px;
                  font-size: 14px;
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
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;

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
      }
    }

    .search-result {
      .panel-title {
        margin-bottom: 20px;

        .dev-debug {
          display: inline-flex;
          margin-right: 20px;

          .el-input {
            width: 600px;
            margin-right: 20px;
          }
        }
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

    .no-match {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 300px;
    }
  }
}
</style>
