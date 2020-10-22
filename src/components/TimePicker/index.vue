<template>
  <div class="date-picker">
    <el-time-picker
      is-range
      range-separator="至"
      :value-format="valueFormat"
      start-placeholder="开始时间"
      end-placeholder="结束时间"
      placeholder="选择时间范围"
      v-bind="$attrs"
      v-on="$listeners"
    >
    </el-time-picker>
  </div>
</template>

<script>
export default {
  name: 'TimePicker',
  props: {
    valueFormat: { type: String, default: 'HH:mm:ss' }
  },
  data () {
    return {}
  }
}
</script>

<style lang="less">
.date-picker {
  .el-date-editor {
    .el-range-separator {
      padding: 0;
    }
  }

  .el-range-editor.el-input__inner {
    width: 300px;
  }
}
</style>
