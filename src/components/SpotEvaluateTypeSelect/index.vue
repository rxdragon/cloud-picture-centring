<template>
  <div class="spot-evaluate-type-select">
    <el-select
      v-bind="$attrs"
      :popper-append-to-body="false"
      placeholder="请选择抽查类型"
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
import { SPOT_CHECK_MAP } from '@/utils/enumerate'

export default {
  name: 'SpotEvaluateTypeSelect',
  data () {
    return {
      options: [
        {
          label: '云学院抽查',
          value: SPOT_CHECK_MAP.CHECK_POOL_SPOT
        },
        {
          label: '修修兽抽查',
          value: SPOT_CHECK_MAP.SHOW_PIC_SPOT
        },
        {
          label: '未抽查',
          value: SPOT_CHECK_MAP.NOT_SPOT
        }
      ]
    }
  }
}
</script>

<style lang="less" scoped>
.el-select {
  width: 105px;
}
</style>
