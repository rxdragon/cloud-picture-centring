<template>
  <div class="performance-management">
    <div class="header">
      <h3>云端绩效管理</h3>
    </div>
    <el-tabs v-model="activeName">
      <el-tab-pane label="修图师绩效" name="RetoucherPerformance" />
      <el-tab-pane label="修图主管绩效" name="ChargePerformance" />
    </el-tabs>
    <div
      class="table-box"
      :class="{'no-border': activeName === 'RetoucherPerformance'}"
    >
      <transition name="fade-transform" mode="out-in">
        <keep-alive>
          <component :is="activeName" />
        </keep-alive>
      </transition>
    </div>
  </div>
</template>

<script>
import RetoucherPerformance from './PerformanceComponents/RetoucherPerformance'
import ChargePerformance from './PerformanceComponents/ChargePerformance'

export default {
  name: 'PerformanceManagement',
  components: { RetoucherPerformance, ChargePerformance },
  data() {
    return {
      activeName: 'ChargePerformance'
    }
  },
}
</script>

<style lang="less" scoped>
.performance-management {
  .table-box {
    margin-top: 0;
  }
}
</style>
