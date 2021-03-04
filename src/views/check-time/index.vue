<template>
  <div class="check-time">
    <!-- 请检查本地时间 -->
    <div ref="countdown" class="countdown">
      <div class="bloc-time hours" data-init-value="24">
        <div class="figure hours hours-1">
          <span class="top">2</span>
          <span class="top-back">
            <span>2</span>
          </span>
          <span class="bottom">2</span>
          <span class="bottom-back">
            <span>2</span>
          </span>
        </div>

        <div class="figure hours hours-2">
          <span class="top">4</span>
          <span class="top-back">
            <span>4</span>
          </span>
          <span class="bottom">4</span>
          <span class="bottom-back">
            <span>4</span>
          </span>
        </div>
      </div>

      <div class="bloc-time min" data-init-value="0">
        <div class="figure min min-1">
          <span class="top">0</span>
          <span class="top-back">
            <span>0</span>
          </span>
          <span class="bottom">0</span>
          <span class="bottom-back">
            <span>0</span>
          </span>
        </div>

        <div class="figure min min-2">
          <span class="top">0</span>
          <span class="top-back">
            <span>0</span>
          </span>
          <span class="bottom">0</span>
          <span class="bottom-back">
            <span>0</span>
          </span>
        </div>
      </div>

      <div class="bloc-time sec" data-init-value="0">
        <div class="figure sec sec-1">
          <span class="top">0</span>
          <span class="top-back">
            <span>0</span>
          </span>
          <span class="bottom">0</span>
          <span class="bottom-back">
            <span>0</span>
          </span>
        </div>

        <div class="figure sec sec-2">
          <span class="top">0</span>
          <span class="top-back">
            <span>0</span>
          </span>
          <span class="bottom">0</span>
          <span class="bottom-back">
            <span>0</span>
          </span>
        </div>
      </div>
    </div>
    <div class="tip">请检查本地时间是否校准</div>
    <el-button type="primary" @click="goHome">返回主页</el-button>
  </div>
</template>

<script>
import anime from 'animejs'
import * as UserApi from '@/api/user.js'

export default {
  name: 'CheckTime',
  data () {
    return {
      Countdown: null
    }
  },
  mounted () {
    // Create Countdown
    const _this = this
    _this.Countdown = {
  
      // Backbone-like structure
      $el: _this.$refs['countdown'],
  
      // Params
      countdown_interval: null,
  
      // Initialize the countdown  
      init: async function () {
        // DOM
        this.$ = {
          hours: document.querySelectorAll('.bloc-time.hours .figure'),
          minutes: document.querySelectorAll('.bloc-time.min .figure'),
          seconds: document.querySelectorAll('.bloc-time.sec .figure')
        }

        // Init countdown values
        const date = await UserApi.getOnlineTime()
        const onlineDate = new Date(date)

        this.values = {
          hours: onlineDate.getHours(),
          minutes: onlineDate.getMinutes(),
          seconds: onlineDate.getSeconds(),
        }
    
        // Animate countdown to the end 
        this.count()
      },
  
      count: function () {
    
        const that = this
        const $hour_1 = this.$.hours[0]
        const $hour_2 = this.$.hours[1]
        const $min_1 = this.$.minutes[0]
        const $min_2 = this.$.minutes[1]
        const $sec_1 = this.$.seconds[0]
        const $sec_2 = this.$.seconds[1]
    
        this.countdown_interval = setInterval(async function () {
          const date = await UserApi.getOnlineTime()
          const onlineDate = new Date(date)
          that.values.hours = onlineDate.getHours()
          that.values.minutes = onlineDate.getMinutes()
          that.values.seconds = onlineDate.getSeconds()

          that.checkHour(that.values.hours, $hour_1, $hour_2)

          // Minutes
          that.checkHour(that.values.minutes, $min_1, $min_2)

          // Seconds
          that.checkHour(that.values.seconds, $sec_1, $sec_2)
        }, 1000)
      },
  
      animateFigure: function ($el, value) {
    
        const $top = $el.querySelector('.top')
        const $bottom = $el.querySelector('.bottom')
        const $back_top = $el.querySelector('.top-back')
        const $back_bottom = $el.querySelector('.bottom-back')

        // Before we begin, change the back value
        $back_top.querySelector('span').innerHTML = value

        // Also change the back bottom value
        $back_bottom.querySelector('span').innerHTML = value

        // Then animate
        anime({
          targets: $top,
          rotateX: '-180deg',
          perspective: 300,
          duration: 800,
          easing: 'easeInOutQuad',
          complete: () => {
            $top.innerHTML = value
            $bottom.innerHTML = value
            anime.set($top, {
              rotateX: 0
            })
          }
        })

        anime({
          targets: $back_top,
          rotateX: 0,
          perspective: 300,
          duration: 800,
          easing: 'easeInOutQuad',
          complete: () => {
            anime.set($back_top, {
              rotateX: '180deg'
            })
          }
        })
      },
  
      checkHour: function (value, $el_1, $el_2) {
    
        const val_1 = value.toString().charAt(0)
        const val_2 = value.toString().charAt(1)
        const fig_1_value = $el_1.querySelector('.top').innerHTML
        const fig_2_value = $el_2.querySelector('.top').innerHTML

        if (value >= 10) {

          // Animate only if the figure has changed
          if (fig_1_value !== val_1) this.animateFigure($el_1, val_1)
          if (fig_2_value !== val_2) this.animateFigure($el_2, val_2)
        }
        else {

          // If we are under 10, replace first figure with 0
          if (fig_1_value !== '0') this.animateFigure($el_1, 0)
          if (fig_2_value !== val_1) this.animateFigure($el_2, val_1)
        }
      }
    }

    // Let's go !
    _this.Countdown.init()
  },
  destroyed () {
    if (_.get(this, 'Countdown.countdown_interval')) {
      clearInterval(this.Countdown.countdown_interval)
    }
  },
  methods: {
    goHome () {
      this.$router.push({ path: '/' })
    }
  }
}
</script>

<style lang="less" scoped>
.check-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #c0c4cc;
  background-color: #303133;
}

.countdown {
  display: flex;
  width: 720px;
  margin-bottom: 100px;
  transform: scale(1.5);

  .bloc-time {
    float: left;
    margin-right: 45px;
    text-align: center;

    &:last-child {
      margin-right: 0;
    }
  }

  .figure {
    position: relative;
    float: left;
    width: 100px;
    height: 110px;
    margin-right: 10px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 3px 4px 0 rgba(0, 0, 0, 0.2), 2px 4px 0 0 rgba(255, 255, 255, 0.08);

    &:last-child {
      margin-right: 0;
    }

    >span {
      position: absolute;
      right: 0;
      left: 0;
      margin: auto;
      font-size: 5.94em;
      font-weight: 700;
      color: #de4848;
    }

    .top,
    .bottom-back {
      &::after {
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: -1;
        width: 100%;
        height: 100%;
        content: "";
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      }
    }

    .top {
      z-index: 3;
      background-color: #f7f7f7;
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
      transform: perspective(200px);
      -webkit-transform-origin: 50% 100%;
      transform-origin: 50% 100%;
    }

    .bottom {
      z-index: 1;

      &::before {
        position: absolute;
        top: 0;
        left: 0;
        display: block;
        width: 100%;
        height: 50%;
        content: "";
        background-color: rgba(0, 0, 0, 0.02);
      }
    }

    .bottom-back {
      top: 0;
      z-index: 2;
      height: 50%;
      overflow: hidden;
      background-color: #f7f7f7;
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;

      span {
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        margin: auto;
      }
    }

    .top,
    .top-back {
      height: 50%;
      overflow: hidden;
      backface-visibility: hidden;
    }

    .top-back {
      bottom: 0;
      z-index: 4;
      background-color: #fff;
      border-bottom-right-radius: 10px;
      border-bottom-left-radius: 10px;
      transform: perspective(200px) rotateX(180deg);
      -webkit-transform-origin: 50% 0;
      transform-origin: 50% 0;

      span {
        position: absolute;
        top: -100%;
        right: 0;
        left: 0;
        margin: auto;
      }
    }
  }
}

.tip {
  margin-bottom: 20px;
}

</style>
