<template>
  <div class="appeal-type-select">
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
  name: 'AppealTypeSelect',
  data () {
    return {
      options: [
        {
          label: '全部',
          value: 'all'
        }, {
          label: '门店退单问题',
          value: true
        }
      ]
    }
  }
}
</script>

<style lang="less" scoped>
.appeal-type-select {
  width: 180px;
}
</style>
