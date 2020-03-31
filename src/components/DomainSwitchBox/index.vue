<template>
  <div class="domain-switch-box">
    <div class="radio-group" @click="changeYun">
      <div class="radio-button" :class="{'is-active': domainValue === 1}">又拍云</div>
      <div class="radio-button" :class="{'is-active': domainValue === 2}">阿里云</div>
      <div class="back-button" :class="{'al-active': domainValue === 2}" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'DomainSwitchBox',
  data () {
    return {
      domainValue: 1 // 1 又拍云 2 阿里云
    }
  },
  computed: {
    ...mapGetters(['imgDomain'])
  },
  created () {
    this.domainValue = this.imgDomain.includes('cdn2') ? 2 : 1
  },
  methods: {
    /**
     * @description 监听域名变换
     */
    changeYun (e) {
      const value = this.domainValue === 1 ? 2 : 1
      this.domainValue = value
      this.$store.dispatch('setting/changeDomain', value)
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";

.domain-switch-box {
  .radio-group {
    position: relative;
    width: 132px;
    padding: 2px;
    background-color: @blue;
    border-radius: 4px;

    .back-button,
    .radio-button {
      position: relative;
      z-index: 2;
      display: inline-block;
      width: 64px;
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

      &.al-active {
        left: 66px;
      }
    }
  }
}
</style>
