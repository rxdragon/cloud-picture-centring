<template>
  <div class="anniversary">
    <div class="transition-box">
      <transition
        :css="false"
        @before-enter="beforeEnter"
        @enter="enter"
        @leave="leave"
      >
        <div v-if="show" class="anniversary-img">
          <i class="close el-icon-circle-close" @click="closePopUp" />
        </div>
      </transition>
    </div>
    <div class="shadow" />
  </div>
</template>

<script>
import anime from 'animejs'
export default {
  name: 'Anniversary',
  data () {
    return {
      show: false
    }
  },
  mounted () {
    this.show = true
  },
  methods: {
    /**
     * @description 关闭弹框
     */
    closePopUp () {
      this.show = false
    },
    beforeEnter (el) {
      el.style.transform = 'scale(0)'
    },
    enter (el) {
      console.log('enter')
      const timeline = anime.timeline()
      timeline.add({
        targets: '.anniversary .shadow',
        duration: 300,
        opacity: 1
      })
      timeline.add({
        targets: el,
        scale: 1,
        direction: 'alternate',
        easing: 'spring(1, 80, 10, 0)'
      }, '-=200')
    },
    leave (el, done) {
      const timeline = anime.timeline()
      timeline.add({
        targets: el,
        scale: 0,
        direction: 'alternate',
        duration: 300,
        easing: 'spring(1, 80, 10, 0)'
      })
      timeline.add({
        targets: '.anniversary .shadow',
        opacity: 0,
        complete: () => {
          this.$emit('update:showPop', false)
        }
      }, '-=200')
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/variables.less';

.anniversary {
  .transition-box {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 860px;
    margin-left: @sideBarWidth;
    height: 633px;
    z-index: 3001;
    transform: translateX(-75%) translateY(-50%);

    .anniversary-img {
      width: 100%;
      height: 100%;

      .close {
        font-size: 36px;
        font-weight: 700;
        color: #fff;
        cursor: pointer;
        position: absolute;
        right: 0;
        top: 50px;

        &:hover {
          color: #eee;
        }
      }
    }
  }

  .shadow {
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    opacity: 0;
    z-index: 3000;
    background-color: rgba(0, 0, 0, 0.2);
  }
}
</style>
