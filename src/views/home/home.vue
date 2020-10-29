<template>
  <div class="home">
    <div class="logo-tip" v-if="isAnniversary">
      <div class="logo-img home-logo" />
      <div class="logo-desc">
        <span class="black">欢迎来到</span>
        <span class="desc">缦图云端修图中心</span>
      </div>
    </div>
    <div class="anniversary-main" v-else>
      <div ref="lottie-box" class="lottie-box"></div>
      <div class="anniversary-logo anniversary-logo-img" />
      <div class="anniversary-message">
        <div class="content">
          <p>你已经入职云端 <span class="days"><count-to :end-value="days" /></span> 天，</p>
          <p>累计修图 <span class="photos"><count-to :end-value="retouchPhoto" /></span> 张，</p>
          <p>感谢你的陪伴，未来的日子，</p>
          <p>我们一起</p>
          <p class="bold-msg"><strong>以梦为马，砥砺前行</strong></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import lottie from 'lottie-web'
import CountTo from '@/components/CountTo'
import animationData from './fireworks.json'


export default {
  name: 'Home',
  components: { CountTo },
  data () {
    return {
      isAnniversary: false,
      days: 0,
      retouchPhoto: 0
    }
  },
  created () {
    setTimeout(() => {
      this.days = 520
      this.retouchPhoto = 10000
    }, 1000)
  },
  mounted () {
    const element = this.$refs['lottie-box']
    lottie.loadAnimation({
      container: element, // the dom element that will contain the animation
      renderer: 'svg',
      loop: false,
      autoplay: true,
      animationData: animationData // the path to the animation json
    })
  }
}
</script>
<style lang="less" scoped>
.home {
  position: relative;
  height: @homeHeight;

  .logo-tip {
    position: absolute;
    top: 50%;
    left: 50%;
    width: min-content;
    transform: translateX(-50%) translateY(-50%);

    .logo-img {
      width: 568px;
      height: 391px;
    }

    .logo-desc {
      margin-top: 26px;
      font-family: @pingFang;
      font-size: 30px;
      font-weight: 600;
      line-height: 38px;
      color: #131923;
      text-align: center;

      .desc {
        color: @blue;
      }
    }
  }

  .anniversary-main {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;

    .lottie-box {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .anniversary-logo-img {
      width: 418px;
      height: 362px;
      margin-right: 40px;
    }

    .anniversary-message {
      display: flex;
      align-items: center;
      width: 414px;
      height: 342px;
      padding-left: 50px;
      background: #fff;
      border-radius: 30px;
      box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.42);

      .content {
        font-size: 22px;
        font-weight: 400;
        line-height: 46px;
        color: #5b4e66;

        .days {
          font-family: @DINAlternate;
          font-size: 26px;
          font-weight: 900;
          color: #b43bb3;
          letter-spacing: 2px;
        }

        .photos {
          font-family: @DINAlternate;
          font-size: 26px;
          font-weight: 900;
          color: #4692f3;
          letter-spacing: 2px;
        }

        .bold-msg {
          font-size: 24;
          font-weight: 900;
        }
      }
    }
  }
}
</style>

