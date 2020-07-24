<template>
  <div class="return-select">
    <el-select
      v-bind="$attrs"
      :popper-append-to-body="false"
      placeholder="请选择是否门店退回"
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
  name: 'ReturnStateSelect',
  data () {
    return {
      options: [{
        label: '是',
        value: 'isReturn'
      }, {
        label: '否',
        value: 'notReturn'
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
