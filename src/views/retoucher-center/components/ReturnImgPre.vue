<template>
  <div class="pre-mask">
    <div class="left-box">
      <div class="title-box">
        <label>{{preImgType?'云端成片':'原图'}}</label>
        <el-switch
          class="img-switch"
          v-model="preImgType"
          active-text="云端成片"
          inactive-text="原图"
          inactive-color="#2196f3"
          active-color="#2196f3"
          @change="changeOrigin"
        />
      </div>
      <div class="middle-box">
        <div class="content">
          <img ref="retouch-img" id="orginImg" :src="url" @load="getImgSize">
          <!-- 大图预览框 -->
          <div id="magnifier-layer" />
          <div v-show="showSign" ref="sign-dom" class="sign-dom">
            <div
              v-for="(item,index) in preIndexPhoto.tags.values.store_part_rework_reason"
              class="sign-item"
              :key="index"
              :style="{
                position: 'absolute',
                width: `${item.width}%`,
                height: `${item.height}%`,
                top: `${item.location[0]}%`,
                left: `${item.location[1]}%`
              }"
            >
              <div
                class="circle-box"
                :style="{
                  color: item.brushColor
                }"
              />
              <div
                class="retouch-reason"
              >
                <div class="reason-tag-list"><span v-for="(itemsub, indexsub) in changeTag(item.reason)" :key="indexsub" class="reason-item">{{itemsub}}</span></div>
                <div class="detail-box" v-if="item.note">
                  <p class="triangle-left"></p>
                  <span class="detail-content">{{ item.note }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-container class="right-box">
      <div class="right-header">
        <div class="close-box"><i class="el-icon-close" @click="closeMask()"/></div>
        <!-- 缩略图 -->
        <div id="small-img" v-loading="loading">
          <div class="small-photo">
            <div id="img-box" style="position: relative;">
              <img
                :src="url"
                alt="缩略图"
                @mouseout="handOut"
                @mousemove="handMove"
                @mouseover="handOver"
              >
              <div class="magnifier-zoom" />
            </div>
          </div>
        </div>
        <div class="scale-slider">
          <el-slider v-model="scaleNum" style="width: 70%;"/>
          <span>{{ scaleNum * 4 + 100 }}%</span>
        </div>
        <el-button :type="showSign?'primary':'info'" @click="() => {showSign = !showSign}">{{ showSign ? '隐藏标记' : '显示标记' }}</el-button>
      </div>
      <div class="right-main">
        <p class="tips">照片整体原因</p>
        <div class="reason-tag-list"><span v-for="(item, index) in changeTag(preIndexPhoto.tags.values.store_rework_reason)" :key="index" class="reason-item">{{item}}</span></div>
        <p class="reason-note">{{preIndexPhoto.tags.values.store_rework_note}}</p>
      </div>
      <el-footer class="operate-box">
        <el-button type="primary" size="medium" @click="download()">下载云端成片</el-button>
        <el-button type="info" size="medium" @click="closeMask()">取消</el-button>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ReturnImgPre',
  props: {
    preIndexPhoto: { type: Object, default: () => {
      return null
    } }
  },
  data () {
    return {
      loading: true,
      preImgType: true, // 初始化展示云端成片
      showSign: true,
      propConfigs: {
        width: 100,
        height: 100,
        maskWidth: 100,
        maskHeight: 50,
        maskColor: 'red',
        maskOpacity: 0.5,
        scale: 100
      },
      imgObj: {},
      bigImg: {},
      mouseMask: {},
      imgLayer: {},
      imgRect: {},
      scaleNum: 25
    }
  },
  computed: {
    ...mapGetters(['imgDomain']),
    url () {
      return this.preImgType ? this.imgDomain + this.preIndexPhoto.returnPhotoPath : this.imgDomain + this.preIndexPhoto.path
    },
    /**
     * @description 将字符串标签转换为数组
     */
    changeTag () {
      return function (tagString) {
        return tagString.split('+') || []
      }
    },
  },
  methods: {
    /**
     * @description 打开关闭遮盖层
     */
    closeMask (type, ...opts) {
      this.$emit('closeMask')
    },
    changeOrigin () {
      this.getImgSize()
      this.showSign = this.preImgType
    },
    getImgSize () {
      this.$refs['sign-dom'].style.width = this.$refs['retouch-img'].width + 'px'
      this.$refs['sign-dom'].style.height = this.$refs['retouch-img'].height + 'px'
      this.loading = false
    },
    download () {
      //
    },
    /**
     * @description 鼠标移动
     */
    handMove (e) {
      // 获取在图片的位置
      const objX = e.clientX - this.imgRect.left
      const objY = e.clientY - this.imgRect.top
      // 判断是否超出界限
      let _maskX = objX - this.mouseMask.offsetHeight / 2
      let _maskY = objY - this.mouseMask.offsetWidth / 2
      if (_maskY <= 0) {
        _maskY = 0
      }
      if (_maskY + this.mouseMask.offsetHeight >= this.imgRect.height) {
        _maskY = this.imgRect.height - this.mouseMask.offsetHeight
      }
      if (_maskX <= 0) {
        _maskX = 0
      }
      if (_maskX + this.mouseMask.offsetWidth >= this.imgRect.width) {
        _maskX = this.imgRect.width - this.mouseMask.offsetWidth
      }
      this.mouseMask.style.webkitTransform = `translate3d(${_maskX}px,${_maskY}px,0)`
      const backgroundX =
        ((_maskX / this.imgRect.width) *
          this.propConfigs.width *
          this.propConfigs.scale) /
        100
      const backgroundY =
        ((_maskY / this.imgRect.height) *
          this.propConfigs.height *
          this.propConfigs.scale) /
        100
      this.imgLayer.style.backgroundPositionX = `-${backgroundX}px `
      this.imgLayer.style.backgroundPositionY = `-${backgroundY}px `
    },
    /**
     * @description 鼠标移出
     */
    handOut (e) {
      this.imgLayer.removeAttribute('style')
      this.mouseMask.removeAttribute('style')
    },
    /**
     * @description 鼠标移进
     */
    handOver (e) {
      // 获取大图尺寸
      this.imgObj = this.$el.getElementsByTagName('img')[1]
      this.imgBigObj = this.$el.getElementsByTagName('img')[0]
      this.imgRect = this.imgObj.getBoundingClientRect()
      this.imgBigRect = this.imgBigObj.getBoundingClientRect()
      // 马克图宽度计算系数
      this.propConfigs.maskWidth = (this.imgRect.width / (this.scaleNum * 4 + 100)) * 100
      this.propConfigs.maskHeight = this.propConfigs.maskWidth * (this.imgRect.height / this.imgRect.width)
      // 背景图放大系数
      this.propConfigs.scale = (this.imgRect.width / this.propConfigs.maskWidth) * 100
      // 获取大图信息
      this.bigImg = new Image()
      this.bigImg.src = this.showPhoto
      this.bigImg.height = (this.bigImg.height * this.propConfigs.scale) / 100
      this.bigImg.width = (this.bigImg.width * this.propConfigs.scale) / 100
      // 创建鼠标选择区域
      this.mouseMask = document.querySelector('.magnifier-zoom')
      this.mouseMask.style.background = this.propConfigs.maskColor
      this.mouseMask.style.height = this.propConfigs.maskHeight + 'px'
      this.mouseMask.style.width = this.propConfigs.maskWidth + 'px'
      this.mouseMask.style.opacity = this.propConfigs.maskOpacity
      this.imgObj.parentNode.appendChild(this.mouseMask)
      // 创建预览框
      const imgLayer = document.getElementById('magnifier-layer')
      const orginImg = document.getElementById('orginImg')
      this.propConfigs.width = orginImg.width
      this.propConfigs.height = orginImg.height
      this.imgLayer = imgLayer
      const _layerHeight = this.propConfigs.height
      const _layerWidth = this.propConfigs.width
      imgLayer.style.width = _layerWidth + 'px'
      imgLayer.style.height = _layerHeight + 'px'
      imgLayer.style.backgroundImage = `url('${this.url}')`
      imgLayer.style.backgroundRepeat = 'no-repeat'
      imgLayer.style.backgroundSize = `${this.propConfigs.scale}%`
      document.getElementsByClassName('content')[0].appendChild(imgLayer)
    }
  }
}
</script>

<style lang="less">
  .pre-mask {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    box-sizing: border-box;
    display: flex;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.8);

    .reason-tag-list {
      display: flex;
      flex-wrap: wrap;

      .reason-item {
        max-width: 120px;
        padding: 10px;
        margin: 0 10px 10px 0;
        overflow: hidden;
        font-size: 13px;
        color: #fff;
        text-overflow: ellipsis;
        white-space: nowrap;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 5px;
      }
    }

    .left-box {
      position: relative;
      display: flex;
      flex-direction: column;
      width: calc(100% - 300px);
      height: 100%;
      overflow: hidden;

      .title-box {
        position: relative;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 10vh;
        padding: 5px 10px;

        .img-switch {
          position: absolute;
          top: 40%;
          right: 10px;
        }

        label {
          color: #fff;
        }
      }

      .middle-box {
        display: flex;
        align-items: center;
        width: 100%;
        height: 90vh;

        .content {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 80%;

          img {
            z-index: 1001;
            max-width: 100%;
            max-height: 100%;
            margin: auto;
          }

          #magnifier-layer {
            position: absolute;
            z-index: 2000;
            margin: auto;
          }

          .sign-dom {
            position: absolute;
            z-index: 1002;

            .sign-item {
              position: relative;
            }

            .detail-box {
              display: flex;
              align-items: center;

              .triangle-left {
                position: relative;
                left: 15px;
                width: 0;
                height: 0;
                border-top: 5px solid transparent;
                border-right: 10px solid #fff;
                border-bottom: 5px solid transparent;
              }

              .detail-content {
                position: relative;
                left: 10px;
                width: max-content;
                height: fit-content;
                padding: 10px 5px;
                font-size: 14px;
                color: #303133;
                background-color: #fff;
                border-radius: 5px;
              }
            }
          }

          .circle-box {
            z-index: 1600;
            width: 100%;
            height: 100%;
            border: 2px solid;
            border-radius: 50%;
          }

          .retouch-reason {
            position: absolute;
            top: 30%;
            left: 100%;
            display: flex;
          }
        }
      }
    }

    .right-box {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      width: 280px;
      height: 100%;
      background-color: #535353;
      border-left: 1px solid #dcdde0f0;

      .right-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        padding: 0 15px 15px 15px;
        border-bottom: 1px solid #8a8a8a;

        .close-box {
          width: 100%;
          height: auto;
          padding: 10px 0;

          i {
            float: right;
            font-size: 20px;
          }
        }

        .small-photo {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;

          .magnifier-zoom {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 4010;
            pointer-events: none;
          }

          img {
            max-width: 100%;
            max-height: 100%;
          }
        }

        .scale-slider {
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-around;
          width: 80%;
          margin: auto;
          color: #fff;
        }

        .el-button {
          padding: 10px 50px;
        }
      }

      .right-main {
        box-sizing: border-box;
        flex: 1;
        width: 100%;
        padding: 20px;
        background-color: #535353;

        .tips {
          padding-left: 10px;
          margin-bottom: 15px;
          font-size: 15px;
          color: #fff;
          text-align: left;
          border-left: 2px solid #4669fb;
        }

        .reason-note {
          width: 100%;
          min-height: 90px;
          padding: 5px 10px;
          font-size: 13px;
          color: #fff;
          background-color: #282828;
          border-radius: 5px;
        }
      }
    }
  }
</style>
