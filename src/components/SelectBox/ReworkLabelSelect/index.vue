<template>
  <div class="rework-label-select">
    <el-select
      v-bind="$attrs"
      filterable
      multiple
      collapse-tags
      :popper-append-to-body="false"
      placeholder="请选择重修标记（非必选）"
      v-on="$listeners"
    >
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
</template>

<script>

export default {
  name: 'ReworkLabelSelect',
  data () {
    return {
      options: [{
        label: '穿帮',
        value: '穿帮'
      }]
    }
  }
}
</script>

<style lang="less">
  .rework-label-select {
    .el-select {
      width: 100%;
    }
  }
</style>
