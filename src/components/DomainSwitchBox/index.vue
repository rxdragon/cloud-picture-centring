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
@switchBule: #4669fb;

.domain-switch-box {
  .radio-group {
    width: 132px;
    background-color: @switchBule;
    padding: 2px;
    border-radius: 4px;
    position: relative;

    .back-button,
    .radio-button {
      width: 64px;
      line-height: 28px;
      display: inline-block;
      font-size: 14px;
      text-align: center;
      font-weight: 500;
      color: #7d96fc;
      -webkit-appearance: none;
      -webkit-user-select: none;
      position: relative;
      z-index: 2;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

      &.is-active {
        color: @switchBule;
      }
    }

    .back-button {
      background-color: #fff;
      height: 28px;
      position: absolute;
      top: 2px;
      left: 2px;
      border-radius: 4px;
      z-index: 1;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

      &.al-active {
        left: 66px;
      }
    }
  }
}
</style>
