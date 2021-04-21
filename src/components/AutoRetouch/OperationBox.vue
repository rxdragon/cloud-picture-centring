<template>
  <div class="operation-box">
    <div class="close-box">
      <button type="button" class="button-close" @click="closePreview">
        <i id="closeImg" class="el-icon-close" />
      </button>
    </div>
    <!-- 修图选项 -->
    <div class="retouch-module">
      <div class="all-open">
        <div class="switch-module">
          <div class="label-text">修图选项</div>
          <div class="desc">全部</div>
          <div class="switch-content">
            <el-switch
              v-model="allOpen"
              :disabled="activeInfo.state !== AutoProcessStates.SUCCESS"
              active-color="#4669FB"
              inactive-color="#C0C4CC"
            >
            </el-switch>
          </div>
        </div>
      </div>
      <!-- 操作集合 -->
      <div
        class="operation-item"
        v-for="(operation, operationIndex) in operationList"
        :key="operationIndex"
      >
        <div class="switch-module">
          <div class="label-text">{{ operation.name }}</div>
          <div class="switch-content">
            <el-switch
              v-model="handleSwtich[operationIndex]"
              :disabled="operation.hidden || activeInfo.state !== AutoProcessStates.SUCCESS"
              active-color="#4669FB"
              inactive-color="#C0C4CC"
            >
            </el-switch>
          </div>
        </div>
      </div>
    </div>
    <!-- 背景选项 -->
    <div class="backgroud-photos" v-show="useNewAutoApi">
      <div class="backgroud-title">
        <div class="colourScheme-title">背景选择</div>
      </div>
      <div class="backgroud-item" v-for="colourSchemeClass in backgroundPhotos" :key="colourSchemeClass.colourScheme">
        <div class="colourScheme-class">
          <div class="commonUse-list">
            <div class="backgroud-list">
              <div
                class="backgroud-image"
                v-for="backgroudItem in colourSchemeClass.commonUseList"
                :key="backgroudItem.md5"
                :class="activeBackgroundImage === backgroudItem.localPath ? 'select' : ''"
                @click="selectBackground(backgroudItem.localPath)"
              >
                <el-popover
                  placement="left"
                  width="120"
                  popper-class="background-popper"
                  trigger="hover"
                >
                  <div class="background-desc">
                    <div class="desc-img">
                      <img :src="backgroudItem.compressPath" alt="">
                    </div>
                    <div class="desc-text">{{ backgroudItem.name }}</div>
                  </div>
                  <img slot="reference" :src="backgroudItem.compressPath" alt="">
                </el-popover>
              </div>
              <div
                class="backgroud-image"
                v-for="backgroudItem in colourSchemeClass.notCommonUseList"
                :key="backgroudItem.md5"
                :class="activeBackgroundImage === backgroudItem.localPath ? 'select' : ''"
                @click="selectBackground(backgroudItem.localPath)"
              >
                <el-popover
                  placement="left"
                  width="120"
                  popper-class="background-popper"
                  trigger="hover"
                >
                  <div class="background-desc">
                    <div class="desc-img">
                      <img :src="backgroudItem.compressPath" alt="">
                    </div>
                    <div class="desc-text">{{ backgroudItem.name }}</div>
                  </div>
                  <img slot="reference" :src="backgroudItem.compressPath" alt="">
                </el-popover>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { OPERATION_TYPE, OperationName, AutoProcessStates } from '@/api/autoRetouch'
import BackgroundMap, { colorCN } from '@/assets/config/BackgroundMap'
import { mapGetters } from 'vuex'

export default {
  name: 'OperationBox',
  props: {
    handleSwtich: { type: Object, default: () => ({}) },
    activeInfo: { type: Object, default: () => ({}) }
  },
  data () {
    return {
      backgroundPhotos: [],
      AutoProcessStates
    }
  },
  computed: {
    ...mapGetters(['useNewAutoApi']),
    operationList () {
      return {
        [OPERATION_TYPE.CROP]: {
          name: OperationName[OPERATION_TYPE.CROP],
          hidden: true,
        },
        [OPERATION_TYPE.WARP]: {
          name: OperationName[OPERATION_TYPE.WARP],
          hidden: false,
        },
        [OPERATION_TYPE.RETOUCH]: {
          name: OperationName[OPERATION_TYPE.RETOUCH],
          hidden: !this.useNewAutoApi,
        },
        [OPERATION_TYPE.MATTING]: {
          name: OperationName[OPERATION_TYPE.MATTING],
          hidden: !this.useNewAutoApi,
        }
      }
    },
    allOpen: {
      get () {
        const operationValues = Object.values(this.handleSwtich)
        return operationValues.every(item => item)
      },
      set (value) {
        for (const key in this.handleSwtich) {
          if (!this.operationList[key].hidden) {
            this.handleSwtich[key] = value
          }
        }
      }
    },
    // 当前激活背景图
    activeBackgroundImage () {
      return this.activeInfo.activeBackgroundImage
    }
  },
  created () {
    this.handleBackgroundMap()
  },
  methods: {
    /**
     * @description 关闭预览框
     */
    closePreview () {
      this.$bus.$emit('autoretouch-close')
    },
    handleBackgroundMap () {
      const createData = []
      BackgroundMap.forEach(backItem => {
        const colourScheme = backItem.colourScheme
        const findColourScheme = createData.find(item => item.colourScheme === colourScheme)
        if (findColourScheme) {
          if (backItem.isCommonUse) {
            findColourScheme.commonUseList.push(backItem)
          } else {
            findColourScheme.notCommonUseList.push(backItem)
          }
        } else {
          const createColourScheme = {
            commonUseList: [],
            notCommonUseList: [],
            colourScheme: backItem.colourScheme,
            colourSchemeCN: colorCN[backItem.colourScheme]
          }
          if (backItem.isCommonUse) {
            createColourScheme.commonUseList = [backItem]
          } else {
            createColourScheme.notCommonUseList = [backItem]
          }
          createData.push(createColourScheme)
        }
      })
      this.backgroundPhotos = createData
    },
    /**
     * @description 选择背景
     */
    selectBackground (backgroudPath) {
      this.activeInfo.activeBackgroundImage = backgroudPath
    }
  }
}
</script>

<style lang="less" scoped>
.operation-box {
  width: 100%;
  height: 100%;
  padding: 10px;

  .close-box {
    display: flex;
    align-items: self-start;
    justify-content: flex-end;
    height: 42px;
    line-height: 42px;
    text-align: right;

    .button-close {
      width: 30px;
      height: 30px;
      padding: 0;
      cursor: pointer;
      background-color: #535353;
      border: none;
      outline: none;

      .el-icon-close {
        font-size: 20px;
        color: #cdcdcd;
      }

      &:hover {
        .el-icon-close {
          color: #fff;
        }
      }
    }

    .down-btn {
      margin-right: auto;
      text-align: left;
    }
  }

  .switch-module {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 10px 9px;
    margin-bottom: 10px;
    font-size: 14px;
    color: #eee;
    background-color: #393939;
    border-radius: 4px;

    .desc {
      margin-right: 6px;
      margin-left: auto;
    }
  }

  .all-open {
    .switch-module {
      background-color: transparent;

      .label-text {
        position: relative;
        display: flex;
        align-items: center;

        &::before {
          position: absolute;
          top: 50%;
          left: -6px;
          display: inline-block;
          width: 2px;
          height: 16px;
          content: '';
          background-color: @red;
          transform: translateY(-50%);
        }
      }
    }
  }

  .operation-item {
    display: flex;
  }

  .backgroud-photos {
    height: calc(100% - 292px);
    overflow-x: hidden;
    overflow-y: auto;

    .backgroud-title {
      padding: 10px 9px;
      font-size: 14px;
      color: #fff;
    }

    .colourScheme-title {
      position: relative;
      display: flex;
      align-items: center;
      margin-bottom: 5px;
      font-size: 14px;
      line-height: 16px;

      &::before {
        position: absolute;
        top: 50%;
        left: -6px;
        display: inline-block;
        width: 2px;
        height: 16px;
        content: '';
        background-color: @red;
        transform: translateY(-50%);
      }
    }

    .colourScheme-class {
      padding: 10px 9px;
      margin-bottom: 10px;
      color: #eee;
      background-color: #393939;
      border-radius: 4px;

      .backgroud-list {
        display: flex;
        flex-wrap: wrap;
        margin-right: -10px;
        margin-bottom: -10px;

        .backgroud-image {
          @imgWidth: 40px;

          width: @imgWidth;
          height: @imgWidth;
          margin-right: 10px;
          margin-bottom: 10px;
          overflow: hidden;
          cursor: pointer;
          border: 4px solid transparent;
          border-radius: 8px;

          &.select {
            border: 4px solid @red;
          }

          img {
            display: block;
            width: 100%;
            height: 100%;
          }
        }
      }

      &.red {
        background-color: ~'@{red}80';
      }

      &.green {
        background-color: ~'@{green}80';
      }

      &.gray {
        background-color: ~'@{gray}80';
      }

      &.yellow {
        background-color: ~'@{yellow}80';
      }

      &.purple {
        background-color: ~'@{purple}80';
      }

      &.blue {
        background-color: ~'@{blue}80';
      }

      &.pink {
        background-color: ~'@{pink}80';
      }
    }
  }
}
</style>

<style lang="less">
.background-popper {
  min-width: 100px;
  background-color: #535353;
  border: 1px solid #2e2d2d;
}

.background-popper[x-placement^=left] .popper__arrow::after {
  border-left-color: #535353;
}

.background-popper[x-placement^=left] .popper__arrow {
  border-left-color: #535353;
}

.background-desc {
  text-align: center;

  .desc-text {
    color: #eee;
  }

  .desc-img {
    img {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
