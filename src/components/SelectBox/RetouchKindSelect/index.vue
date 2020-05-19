<template>
  <div class="retouch-kind-select">
    <el-select
      v-bind="$attrs"
      filterable
      clearable
      :popper-append-to-body="false"
      :placeholder="placeholder"
      v-on="$listeners"
    >
      <el-option v-if="allOptision" label="全部" :value="0" />
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
  name: 'RetouchKindSelect',
  props: {
    allOptision: { type: Boolean }, // 是否显示全部选项
    placeholder: { type: String, default: '请选择修图标准' } // 默认placeholder
  },
  data () {
    return {
      options: [{
        label: '蓝标',
        value: 'blue'
      }, {
        label: '大师',
        value: 'master'
      }, {
        label: 'kids',
        value: 'kids'
      }, {
        label: '缦图',
        value: 'mainto'
      }]
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 230px;
}
</style>
