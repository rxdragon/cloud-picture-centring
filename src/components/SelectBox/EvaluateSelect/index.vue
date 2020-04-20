<template>
  <div class="evaluate-select">
    <el-select v-bind="$attrs" :popper-append-to-body="false" placeholder="请选择是否点赞" v-on="$listeners">
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
  width: 100px;
}
</style>
