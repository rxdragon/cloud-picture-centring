<template>
  <div class="retouch-kind-select">
    <el-select
      v-bind="$attrs"
      filterable
      clearable
      placeholder="请选择修图标准"
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
  name: 'RetouchKindSelect',
  props: {
    importData: { type: Boolean }
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
