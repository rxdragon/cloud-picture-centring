<template>
  <div class="return-state-select">
    <el-select
      v-bind="$attrs"
      :popper-append-to-body="false"
      placeholder="门店退回"
      clearable
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
.return-state-select {
  width: 100%;
}
</style>
