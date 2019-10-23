<template>
  <div class="date-picker">
    <el-date-picker
      :type="type"
      :value-format="valueFormat"
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      :picker-options="pickerOptions"
      v-bind="$attrs"
      v-on="$listeners"
    />
  </div>
</template>

<script>
export default {
  name: 'DatePicker',
  props: {
    type: { type: String, default: 'daterange' },
    valueFormat: { type: String, default: 'yyyy-MM-dd' },
    shortcuts: { type: Boolean },
    future: { type: Boolean }
  },
  data () {
    return {
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      }
    }
  },
  created () {
    // 快捷方式
    if (this.shortcuts) {
      this.pickerOptions.shortcuts = [{
        text: '最近一周',
        onClick (picker) {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
          picker.$emit('pick', [start, end])
        }
      }, {
        text: '最近一个月',
        onClick (picker) {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
          picker.$emit('pick', [start, end])
        }
      }, {
        text: '最近三个月',
        onClick (picker) {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
          picker.$emit('pick', [start, end])
        }
      }]
    }
    // 是否可以选后面的日子
    if (this.future) {
      this.pickerOptions = {
        disabledDate (time) {
          return time.getTime() < Date.now()
        }
      }
    }
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
