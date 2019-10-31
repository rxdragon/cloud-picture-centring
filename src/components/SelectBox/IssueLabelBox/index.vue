<template>
  <div class="issue-label-box">
    <el-select
      v-bind="$attrs"
      :popper-append-to-body="false"
      placeholder="请选择中拔草"
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
  name: 'IssueLabelBox',
  data () {
    return {
      options: [{
        label: '液化',
        value: '液化'
      }, {
        label: '磨皮',
        value: '磨皮'
      }, {
        label: '调光',
        value: '调光'
      }, {
        label: '调色',
        value: '调色'
      }, {
        label: '其他',
        value: '其他'
      }, {
        label: '双下巴',
        value: '双下巴'
      }]
    }
  }
}
</script>

<style lang="less" scoped>

</style>
