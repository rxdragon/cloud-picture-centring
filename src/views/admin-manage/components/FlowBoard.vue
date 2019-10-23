<template>
  <div v-if="flowInfo" class="flow-board" @click="closeFlow">
    <div class="title">云端流量看板</div>
    <div class="refresh">{{ time }}s后刷新</div>
    <div class="main">
      <div class="header">
        <div class="panel-wrap panel-orange" @click.stop="">
          <div class="header-nav">今日取片待修 / 其他取片日待修</div>
          <div class="panel-content">订单数 {{ flowInfo.waitRetouch.streamNum.today }} / {{ flowInfo.waitRetouch.streamNum.other }}</div>
          <div class="panel-content">
            <span>照片数 {{ flowInfo.waitRetouch.photoNum.today }} / {{ flowInfo.waitRetouch.photoNum.other }}</span>
            <el-popover
              placement="right"
              trigger="hover"
            >
              <div class="flowInfo-panel">
                <div class="panel-content panel-title">
                  <span>产品名称</span>
                  <span class="state-tpye">今日 / 其他</span>
                </div>
                <div v-for="(photoItem, photoIndex) in flowInfo.waitRetouch.photos" :key="photoIndex" class="panel-content">
                  <span>{{ photoItem.name }}</span>
                  <span class="state-tpye">{{ photoItem.today }} / {{ photoItem.other }}</span>
                </div>
              </div>
              <el-button slot="reference" size="mini" class="detail" type="text">详情</el-button>
            </el-popover>
          </div>
          <div class="panel-footer">正在修片{{ flowInfo.retouchingPersonNum + flowInfo.outerRetouchingPersonNum }}人</div>
          <div class="line-to-right" />
          <div class="line-to-left" />
        </div>
      </div>
      <div class="middle">
        <div class="panel-wrap panel-orange" @click.stop="">
          <div class="header-nav">外包修片 / 重修</div>
          <div class="panel-content">订单数 {{ flowInfo.outerRetouching.streamNum.retouching }} / {{ flowInfo.outerRetouching.streamNum.reworking }}</div>
          <div class="panel-content">
            <span>照片数 {{ flowInfo.outerRetouching.photoNum.retouching }} / {{ flowInfo.outerRetouching.photoNum.reworking }}</span>
            <el-popover
              placement="right"
              trigger="hover"
            >
              <div class="flowInfo-panel">
                <div class="panel-content panel-title">
                  <span>产品名称</span>
                  <span class="state-tpye">修片 / 重修</span>
                </div>
                <div v-for="(photoItem, photoIndex) in flowInfo.outerRetouching.photos" :key="photoIndex" class="panel-content">
                  <span>{{ photoItem.name }}</span>
                  <span class="state-tpye">{{ photoItem.retouching }} / {{ photoItem.reworking }}</span>
                </div>
              </div>
              <el-button slot="reference" size="mini" class="detail" type="text">详情</el-button>
            </el-popover>
          </div>
          <div class="panel-footer">正在修片{{ flowInfo.outerRetouchingPersonNum }}人</div>
          <div class="line-to-top" />
          <div class="line-to-bottom" />
        </div>
        <div class="panel-wrap panel-orange" @click.stop="">
          <div class="header-nav">云端修片 / 重修</div>
          <div class="panel-content">订单数 {{ flowInfo.cloudRetouching.streamNum.retouching }} / {{ flowInfo.cloudRetouching.streamNum.reworking }}</div>
          <div class="panel-content">
            <span>照片数 {{ flowInfo.cloudRetouching.photoNum.retouching }} / {{ flowInfo.cloudRetouching.photoNum.reworking }}</span>
            <el-popover
              placement="right"
              trigger="hover"
            >
              <div class="flowInfo-panel">
                <div class="panel-content panel-title">
                  <span>产品名称</span>
                  <span class="state-tpye">修片 / 重修</span>
                </div>
                <div v-for="(photoItem, photoIndex) in flowInfo.cloudRetouching.photos" :key="photoIndex" class="panel-content">
                  <span>{{ photoItem.name }}</span>
                  <span class="state-tpye">{{ photoItem.retouching }} / {{ photoItem.reworking }}</span>
                </div>
              </div>
              <el-button slot="reference" size="mini" class="detail" type="text">详情</el-button>
            </el-popover>
          </div>
          <div class="panel-footer">正在修片{{ flowInfo.retouchingPersonNum }}人</div>
          <div class="line-to-top" />
          <div class="line-to-bottom" />
        </div>
      </div>
      <div class="footer">
        <div class="panel-wrap panel-orange" @click.stop="">
          <div class="header-nav">云端 审核中 / 待审核</div>
          <div class="panel-content">订单数 {{ flowInfo.review.streamNum.reviewing }} / {{ flowInfo.review.streamNum.wait_review }}</div>
          <div class="panel-content">
            <span>照片数 {{ flowInfo.review.photoNum.reviewing }} / {{ flowInfo.review.photoNum.wait_review }}</span>
            <el-popover
              placement="right"
              trigger="hover"
            >
              <div class="flowInfo-panel">
                <div class="panel-content panel-title">
                  <span>产品名称</span>
                  <span class="state-tpye">审核中 / 待审核</span>
                </div>
                <div v-for="(photoItem, photoIndex) in flowInfo.review.photos" :key="photoIndex" class="panel-content">
                  <span>{{ photoItem.name }}</span>
                  <span class="state-tpye">{{ photoItem.reviewing }} / {{ photoItem.wait_review }}</span>
                </div>
              </div>
              <el-button slot="reference" size="mini" class="detail" type="text">详情</el-button>
            </el-popover>
          </div>
          <div class="line-to-right" />
          <div class="line-to-left" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as AdminManage from '@/api/adminManage.js'

export default {
  name: 'FlowBoard',
  data () {
    return {
      flowInfo: null,
      time: 30,
      timer: -1
    }
  },
  created () {
    this.getFlowInfo()
  },
  mounted () {
    this.timer = setInterval(() => {
      this.time--
      if (this.time === 0) {
        this.time = 30
        this.getFlowInfo()
      }
    }, 1000)
  },
  beforeDestroy () {
    clearInterval(this.timer)
  },
  methods: {
    closeFlow () {
      this.$emit('update:showFlowBoard', false)
    },
    /**
     * @description 获取流量看板数据
     */
    async getFlowInfo () {
      this.flowInfo = await AdminManage.getFlowInfo()
    }
  }
}
</script>

<style lang="less">
@linewidth: 97px;
@lineColor: #F59A23;

.flow-board {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;

  .title {
    color: #fff;
    text-align: center;
    margin: 100px 0 50px;
    width: 100%;
  }

  .refresh {
    color: #fff;
    position: absolute;
    right: 200px;
    top: 100px;
  }

  .panel-wrap {
    width: 210px;
    border-radius: 5px;

    .header-nav {
      font-size: 14px;
      padding: 10px 0;
      box-sizing: border-box;
      color: #303133;
      font-weight: 500;
      text-align: center;
    }

    .panel-content {
      text-align: center;
      padding: 10px;
      background-color: #fff;
      margin-top: 5px;
      font-size: 14px;
      font-weight: 400;
      color: #606266;

      span{
        margin-right: 2px;
      }

      .el-button{
        border: none;
        font-size: 12px;
        margin-left: 10px;
      }
    }

    .panel-footer {
      text-align: center;
      padding: 10px;
      font-size: 14px;
    }
  }

  .main {
    width: 1000px;
    margin: auto;
  }

  .header {
    display: flex;
    justify-content: center;

    .panel-wrap {
      position: relative;

      .line-to-right {
        width: @linewidth;
        height: 2px;
        display: inline-block;
        background-color: @lineColor;
        position: absolute;
        top: 50%;
        left: 100%;
      }

      .line-to-left {
        width: @linewidth;
        height: 2px;
        display: inline-block;
        background-color: @lineColor;
        position: absolute;
        top: 50%;
        right: 100%;
      }
    }
  }

  .middle {
    display: flex;
    justify-content: space-evenly;

    .panel-wrap {
      margin: 30px 0px;
      position: relative;

      .line-to-top {
        background-color: @lineColor;
        display: inline-block;
        position: absolute;
        left: 50%;
        width: 2px;
        height: 140px;
        bottom: 100%;
        transform: translateX(-50%);
      }

      .line-to-bottom {
        background-color: @lineColor;
        display: inline-block;
        position: absolute;
        left: 50%;
        width: 2px;
        height: 100px;
        top: 100%;
        transform: translateX(-50%);
      }
    }
  }

  .footer {
    display: flex;
    justify-content: center;

    .panel-wrap {
      position: relative;
      .line-to-right {
        width: @linewidth;
        height: 2px;
        display: inline-block;
        background-color: @lineColor;
        position: absolute;
        top: 50%;
        left: 100%;
      }

      .line-to-left {
        width: @linewidth;
        height: 2px;
        display: inline-block;
        background-color: @lineColor;
        position: absolute;
        top: 50%;
        right: 100%;
      }
    }
  }

  .panel-orange {
    background-color: #FACD91;
  }
}

.flowInfo-panel {
  .panel-title {
    background-color: #FAFAFA;
    color: #303133;
    font-weight: 500;

    &>span {
      padding: 17px 20px;
    }
  }

  .panel-content {
    font-size: 12px;
    color: #606266;
    border: 1px solid #F2F6FC;

    &>span {
      display: inline-block;
      width: 100px;
      padding: 20px 21px;
    }

    .state-tpye {
      width: 150px;
    }
  }
}
</style>
