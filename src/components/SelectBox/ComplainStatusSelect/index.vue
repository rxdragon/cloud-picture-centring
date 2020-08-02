<template>
  <div class="complain-status-select">
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
export default {
  name: 'ComplainStatusSelect',
  data () {
    return {
      options: [
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
    }
  }
}
</script>

<style lang="less" scoped>
.complain-status-select {
  width: 180px;
}
</style>
