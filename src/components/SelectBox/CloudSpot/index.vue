<template>
  <div class="cloud-spot">
    <el-select
      v-bind="$attrs"
      :popper-append-to-body="false"
      placeholder="是否抽查"
      v-on="$listeners"
    >
      <el-option
        v-for="(optionItem, optionIndex) in options"
        :key="optionIndex"
        :label="optionItem.label"
        :value="optionItem.value"
      />
    </el-select>
  </div>
</template>

<script>
export default {
  name: 'CloudSpot',
  data () {
    return {
      options: [{
        label: '是',
        value: true
      }, {
        label: '否',
        value: false
      }]
    }
  }
}
</script>

<style lang="less" scoped>
.el-select {
  width: 110px;
}
</style>
