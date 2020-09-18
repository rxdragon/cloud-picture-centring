<template>
  <div class="pre-mask" v-loading="loading">
    <i v-if="!this.showReturnMark" class="el-icon-close origin-close" @click="closeMask()"/>
    <div class="left-box">
      <div class="title-box" v-if="this.showReturnMark">
        <label>{{ preImgType ? '云端成片' : '原图' }}</label>
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
        <i class="el-icon-arrow-left arrow" v-if="showNextBtn" @click="switchImg('last')"></i>
        <div class="return-pre-content">
          <img
            ref="retouch-img"
            id="orginImg"
            alt="orginImg"
            :src="url"
            :style="imgScale"
            v-show="!preDetail"
            @load="getImgSize"
          >
          <!-- 大图预览框 -->
          <div id="return-magnifier-layer" />
          <div
            v-show="showSign"
            ref="sign-dom"
            class="sign-dom"
            :style="imgScale"
          >
            <div
              v-for="(item,index) in storePartReworkReason"
              class="sign-item"
              :key="index"
              :style="{
                position: 'absolute',
                width: `${item.width}%`,
                height: `${item.height}%`,
                top: `${item.location[0]}%`,
                left: `${item.location[1]}%`,
              }"
            >
              <div
                class="circle-box"
                :style="{
                  color: item.brushColor
                }"
              />
              <div class="retouch-reason">
                <div class="part-reason-list">
                  <span
                    v-for="(itemsub, indexsub) in changeTag(item.reason)"
                    :key="indexsub"
                    class="reason-tag-common part-tag"
                  >{{ itemsub }}
                  </span>
                </div>
                <div class="detail-box" v-if="item.note">
                  <p class="triangle-left"></p>
                  <span class="detail-content">{{ item.note }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <i class="el-icon-arrow-right arrow" v-if="showNextBtn" @click="switchImg('next')"></i>
      </div>
    </div>
    <el-container v-if="this.showReturnMark" class="right-box">
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
          <span class="scale-num">{{ scaleNum * 4 + 100 }}%</span>
        </div>
        <el-button :type="changeShowTag ? 'primary' : 'info'" @click="() => {changeShowTag = !changeShowTag}">{{ changeShowTag ? '隐藏标记' : '显示标记' }}</el-button>
      </div>
      <div class="right-main">
        <p class="tips border-tips">照片整体原因</p>
        <div class="reason-contain">
          <div class="whole-reason-list">
            <span
              v-for="(item, index) in changeTag(storeReworkReason)"
              :key="index"
              class="reason-tag-common whole-tag"
            >{{ item }}
            </span>
            <span v-if="!storeReworkReason" class="reason-note">暂无原因</span>
          </div>
          <p class="tips">整体原因备注：</p>
          <p class="reason-note">{{ storeReworkNote || '暂无备注' }}</p>
        </div>
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
import DownIpc from '@electronMain/ipc/DownIpc'

export default {
  name: 'ReturnImgPre',
  props: {
    preIndexPhoto: { type: Object, default: () => {
      return null
    } },
    streamNum: { type: String, default: '' },
    showReturnMark: { type: Boolean, default: false },
    showNextBtn: { type: Boolean, default: false },
  },
  data () {
    return {
      loading: true,
      preImgType: this.showReturnMark, // 初始化展示云端成片
      propConfigs: {
        width: 100,
        height: 100,
        maskWidth: 100,
        maskHeight: 50,
        maskColor: 'red',
        maskOpacity: 0.5,
        scale: 100
      },
      preDetail: false, // 标记是否在进行细节预览
      changeShowTag: true,
      imgObj: {},
      bigImg: {},
      mouseMask: {},
      imgLayer: {},
      imgRect: {},
      scaleNum: 25,
      transform: {
        scale: 1,
        offsetX: 0,
        offsetY: 0,
      },
    }
  },
  computed: {
    ...mapGetters(['imgDomain']),
    url () {
      return this.preImgType ? this.imgDomain + this.preIndexPhoto.returnPhotoPath : this.imgDomain + this.preIndexPhoto.path
    },
    storePartReworkReason () {
      return _.get(this.preIndexPhoto, 'tags.values.store_part_rework_reason') || []
    },
    storeReworkReason () {
      return _.get(this.preIndexPhoto, 'tags.values.store_rework_reason') || ''
    },
    storeReworkNote () {
      return _.get(this.preIndexPhoto, 'tags.values.store_rework_note') || ''
    },
    /**
     * @description 将字符串标签转换为数组
     */
    changeTag () {
      return function (tagString) {
        if (!tagString) {
          return []
        }
        return tagString.split('+') || []
      }
    },
    // 非原图+非鼠标预览时+点击显示标记时
    showSign () {
      return this.preImgType && !this.preDetail && this.changeShowTag
    },
    imgScale () {
      const { scale } = this.transform
      const style = {
        transform: `scale(${scale})`,
        transition: 'transform .5s'
      }
      return style
    }
  },
  mounted () {
    this.keyBoardListener()
    window.addEventListener('mousewheel',this.mouseWheelHandler,false)
  },
  methods: {
    /**
     * @description 打开关闭遮盖层
     */
    closeMask () {
      this.$emit('closeMask')
    },
    changeOrigin () {
      this.getImgSize()
    },
    getImgSize () {
      this.$refs['sign-dom'].style.width = this.$refs['retouch-img'].width + 'px'
      this.$refs['sign-dom'].style.height = this.$refs['retouch-img'].height + 'px'
      this.loading = false
    },
    /**
     * @description 下载当前成片
     */
    download () {
      const photoArr = [{
        url: this.preIndexPhoto.returnPhotoPath,
        path: `/${this.streamNum}`
      }]
      DownIpc.addDownloadFiles(photoArr)
    },
    /**
     * @description 切换图片
     */
    switchImg (type) {
      this.resetScale()
      this.$emit('switchImg', type)
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
      this.mouseMask.style.webkitTransform = `translate3d(${_maskX + this.imgObj.offsetLeft}px,${_maskY + this.imgObj.offsetTop}px,0)`
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
      this.preDetail = false
      this.showOriginImg = true
      this.imgLayer.removeAttribute('style')
      this.mouseMask.removeAttribute('style')
    },
    /**
     * @description 鼠标移进
     */
    handOver (e) {
      this.preDetail = true
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
      const imgLayer = document.getElementById('return-magnifier-layer')
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
      document.getElementsByClassName('return-pre-content')[0].appendChild(imgLayer)
    },
    keyBoardListener () {
      /**
       * @description 监听键盘事件
       */
      document.onkeydown = e => {
        const key = window.event.keyCode
        switch (key) {
          case 8:
            this.closeMask()
            break
          case 65:
          case 37:
            this.switchImg('last')
            break
          case 39:
          case 68:
            this.switchImg('next')
            break
          default:
            break
        }
      }
    },
    // 监听鼠标滚轮事件
    mouseWheelHandler (e) {
      const delta = e.wheelDelta ? e.wheelDelta : -e.detail
      const rate = 0.05
      const { transform } = this
      if (delta > 0) {
        if (transform.scale > rate) {
          transform.scale = parseFloat((transform.scale - rate).toFixed(3))
        }
      } else {
        transform.scale = parseFloat((transform.scale + rate).toFixed(3))
      }
    },
    // 图片尺寸缩放重置
    resetScale () {
      this.transform = {
        scale: 1,
        offsetX: 0,
        offsetY: 0
      }
    }
  }
}
</script>

<style lang="less">
  .pre-mask {
    position: fixed;
    top: 42px;
    left: 0;
    z-index: 1000;
    box-sizing: border-box;
    display: flex;
    width: 100vw;
    height: calc(100vh - 42px);
    background-color: rgba(0, 0, 0, 0.8);

    .origin-close {
      position: fixed;
      top: 70px;
      right: 20px;
      z-index: 2009;
      width: 50px;
      height: 50px;
      font-size: 30px;
      line-height: 50px;
      color: #fff;
      text-align: center;
      cursor: pointer;
      background-color: rgba(0, 0, 0, 0.3);
      border-radius: 100%;
    }

    .reason-tag-common {
      padding: 10px;
      margin: 0 10px 10px 0;
      font-size: 12px;
      color: #eee;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 5px;
    }

    .left-box {
      position: relative;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      height: 100%;
      overflow: hidden;

      .title-box {
        position: relative;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 42px;
        padding: 5px 10px;

        .img-switch {
          position: absolute;
          top: 10px;
          right: 10px;
        }

        label {
          color: #fff;
        }
      }

      .middle-box {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        height: calc(100vh - 84px);

        .arrow {
          z-index: 2009;
          width: 50px;
          height: 50px;
          font-size: 25px;
          line-height: 50px;
          color: #fff;
          text-align: center;
          cursor: pointer;
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 100%;
        }

        .el-icon-arrow-left {
          position: relative;
          left: 20px;
        }

        .el-icon-arrow-right {
          position: relative;
          right: 20px;
        }

        .return-pre-content {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 90%;
          height: 90%;
          margin: auto;

          #orginImg {
            position: absolute;
            z-index: 1001;
            max-width: 100%;
            max-height: 100%;
          }

          #return-magnifier-layer {
            position: absolute;
            z-index: 3000;
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

            .part-reason-list {
              display: flex;
              flex-direction: column;

              .part-tag {
                width: max-content;
                max-width: 140px;
              }
            }
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
      min-width: 280px;
      max-width: 280px;
      height: 100%;
      padding: 0;
      margin: 0;
      background-color: #535353;
      border-left: 1px solid #666;

      .right-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        padding: 0 15px 15px 15px;
        border-bottom: 1px solid #666;

        .close-box {
          width: 100%;
          height: auto;
          padding: 10px 0;

          i {
            float: right;
            font-size: 20px;
            cursor: pointer;
          }
        }

        #small-img {
          width: 260px;
          height: 260px;
          margin: 0 10px;
          background-color: #282828;
        }

        .small-photo {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;

          #img-box {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
          }

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
          width: 90%;
          margin: auto;

          .el-slider__runway {
            height: 4px;
          }

          .el-slider__bar {
            height: 4px;
            background-image: linear-gradient(33deg, #91f5ff 0%, #71b9fd 45%, #4669fb 100%);
          }

          .el-slider__button-wrapper {
            top: -13px;
            width: 30px;
            height: 30px;

            .el-slider__button {
              width: 12px;
              height: 12px;
            }
          }

          .scale-num {
            font-size: 13px;
            color: #eee;
          }
        }

        .el-button {
          padding: 10px 85px;
          font-display: 12px;
        }
      }

      .right-main {
        box-sizing: border-box;
        flex-grow: 1;
        width: 100%;
        padding: 20px;
        color: #eee;
        background-color: #535353;

        .tips {
          margin-bottom: 15px;
          font-size: 14px;
          text-align: left;
        }

        .reason-contain {
          max-height: 400px;
          overflow-y: auto;

          .whole-reason-list {
            display: flex;
            flex-wrap: wrap;
            margin-bottom: 10px;

            .whole-tag {
              width: max-content;
            }
          }
        }

        .border-tips {
          padding-left: 10px;
          border-left: 2px solid #4669fb;
        }

        .reason-note {
          width: 100%;
          min-height: 90px;
          padding: 5px 10px;
          font-size: 13px;
          background-color: #282828;
          border-radius: 5px;
        }
      }

      .operate-box {
        display: flex;
        align-items: center;
        justify-content: space-around;
        width: 100%;
        padding: 0;
        border-top: 1px solid #666;
      }
    }
  }
</style>
