<template>
  <div class="switch-box">
    <div class="radio-group" v-show="modeArr.length !== 1">
      <div
        v-for="(modeItem, modeIndex) in modeArr"
        :key="modeIndex"
        @click="changeMode(modeItem.value)"
        class="radio-button"
        :class="{'is-active': value === modeItem.value}"
      >
        {{ modeItem.label }}
      </div>
      <div class="back-button" :style="{'left': `${activeLeft}px`}" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'SwitchBox',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: { type: [String, Number], required: true },
    modeArr: { type: Array, required: true }
  },
  computed: {
    activeLeft () {
      const findModeIndex = this.modeArr.findIndex(item => item.value === this.value)
      return findModeIndex * 90 + 2
    }
  },
  methods: {
    /**
     * @description 监听域名变换
     */
    changeMode (modeValue) {
      this.$emit('change', modeValue)
    }
  }
}
</script>

<style lang="less" scoped>

.switch-box {
  .radio-group {
    position: relative;
    padding: 2px;
    background-color: @blue;
    border-radius: 4px;

    .back-button,
    .radio-button {
      position: relative;
      z-index: 2;
      display: inline-block;
      width: 90px;
      font-size: 14px;
      font-weight: 500;
      line-height: 28px;
      color: #7d96fc;
      text-align: center;
      cursor: pointer;
      -webkit-user-select: none;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      -webkit-appearance: none;

      &.is-active {
        color: @blue;
      }
    }

    .back-button {
      position: absolute;
      top: 2px;
      left: 2px;
      z-index: 1;
      height: 28px;
      background-color: #fff;
      border-radius: 4px;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    }
  }
}
</style>
