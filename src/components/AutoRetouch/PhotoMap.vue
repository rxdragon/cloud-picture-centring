<template>
  <div class="photo-map">
    <div class="photo-real-map" :class="isOpen ? '' : 'close-list'">
      <div class="flexible-button" @click="flexibleList">
        <i class="anticon" :class="isOpen ? 'anticon-left' : ''">
          <svg
            viewBox="0 0 1024 1024"
            focusable="false"
            class=""
            data-icon="caret-right"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
          ><path d="M715.8 493.5L335 165.1c-14.2-12.2-35-1.2-35 18.5v656.8c0 19.7 20.8 30.7 35 18.5l380.8-328.4c10.9-9.4 10.9-27.6 0-37z"></path>
          </svg>
        </i>
        <span class="site-svg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="86"
            viewBox="0 0 40 86"
          ><defs><filter
            id="svg167130974__filter-1"
            width="124.9%"
            height="106.2%"
            x="-12.4%"
            y="-3.1%"
            filterUnits="objectBoundingBox"
          ><feOffset dy="5" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset><feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="5"></feGaussianBlur><feColorMatrix in="shadowBlurOuter1" result="shadowMatrixOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"></feColorMatrix><feMerge><feMergeNode in="shadowMatrixOuter1"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge>
          </filter></defs><g fill="#FFF" filter="url(#svg167130974__filter-1)" transform="translate(-213 -418)"><path d="M0 1h224v952H0z"></path><path d="M207 0h16v414.328a11.55 11.55 0 007 10.615 11.55 11.55 0 017 10.616v46.882a11.55 11.55 0 01-7 10.616 11.55 11.55 0 00-7 10.615V953h-16V0z"></path></g>
          </svg>
        </span>
      </div>
      <div class="content-box">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PhotoMap',
  props: {
    listWidth: { type: [String, Number], define: 224 }
  },
  data () {
    return {
      isOpen: true
    }
  },
  mounted () {
    this.$el.style.setProperty('--constListWidth', `${this.listWidth}px`)
    const listWidth = this.isOpen ? this.listWidth : 0
    this.$el.style.setProperty('--listWidth', `${listWidth}px`)
  },
  methods: {
    flexibleList () {
      this.isOpen = !this.isOpen
      const listWidth = this.isOpen ? this.listWidth : 0
      this.$el.style.setProperty('--listWidth', `${listWidth}px`)
    }
  }
}
</script>

<style lang="less" scoped>

.photo-map {
  --listWidth: 224px;
  --constListWidth: 224px;

  flex-shrink: 0;
  width: var(--listWidth);
  transition: width 0.3s;

  .photo-real-map {
    position: absolute;
    z-index: 1;
    width: var(--constListWidth);
    height: 100%;
    background-color: #fff;
    transition: all 0.3s;

    .flexible-button {
      position: absolute;
      top: 50%;
      right: -29px;
      z-index: 1;
      cursor: pointer;
      transform: translateY(-50%);

      .anticon {
        position: absolute;
        top: 34px;
        right: 16px;
        font-size: 10px;
        color: #85878c;
        transform-origin: center;
      }

      .anticon-left {
        transform: rotate(180deg);
      }

      .site-svg {
        display: inline-block;
        height: 86px;
        line-height: 1;
        vertical-align: text-top;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
    }

    &.close-list {
      --test: calc(-1 * var(--constListWidth));

      transform: translateX(var(--test));
    }

    &::after {
      display: block;
      width: 224px;
      height: 100%;
      content: '';
    }
  }
}
</style>
