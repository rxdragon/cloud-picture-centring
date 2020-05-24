<template>
  <div class="weight-select">
    <el-select
      v-bind="$attrs"
      filterable
      :popper-append-to-body="false"
      placeholder="请选择权重等级"
      v-on="$listeners"
    >
      <el-option v-if="!importData" label="全部等级" :value="0"/>
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
  name: 'WeightSelect',
  props: {
    importData: { type: Boolean }
  },
  data () {
    return {
      options: [{
        label: '一类产品',
        value: 'weight_first'
      }, {
        label: '二类产品',
        value: 'weight_second'
      }, {
        label: '三类产品',
        value: 'weight_third'
      }, {
        label: '四类产品',
        value: 'weight_fourth'
      }, {
        label: '五类产品',
        value: 'weight_fifth'
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
