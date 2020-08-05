<template>
  <div class="appeal-status-select">
    <el-select v-bind="$attrs" v-on="$listeners">
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
const defaultOptions = [
  {
    label: '全部',
    value: 'all'
  }, {
    label: '待初审',
    value: true
  }, {
    label: '初审中',
    value: false
  },
  {
    label: '待复审',
    value: false
  },
  {
    label: '复审中',
    value: false
  },
  {
    label: '处理完成',
    value: false
  },
  {
    label: '过期未处理',
    value: false
  }
]
export default {
  name: 'AppealStatusSelect',
  props: {
    options: { type: Array, default: () => (defaultOptions) }
  }
}
</script>

<style lang="less" scoped>
.appeal-status-select {
  width: 180px;
}
</style>
