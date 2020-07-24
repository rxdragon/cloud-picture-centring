<template>
  <div class="evaluate-select">
    <el-select v-bind="$attrs" placeholder="是否点赞" v-on="$listeners">
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
  name: 'EvaluateSelect',
  data () {
    return {
      options: [{
        label: '全部',
        value: 'all'
      }, {
        label: '点赞',
        value: true
      }, {
        label: '点踩',
        value: false
      }]
    }
  }
}
</script>

<style lang="less" scoped>
.el-select {
  width: 100px;
}
</style>
