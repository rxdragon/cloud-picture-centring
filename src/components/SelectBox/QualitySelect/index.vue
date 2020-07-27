<template>
  <div class="quality-select">
    <el-select
      v-bind="$attrs"
      clearable
      placeholder="退单类型"
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
import { QUALITY_TYPE, qualityTypeToCN } from '@/utils/enumerate.js'

const seachState = [
  QUALITY_TYPE.QUALITY,
  QUALITY_TYPE.NOT_QUALITY,
  QUALITY_TYPE.BOTH
]
export default {
  name: 'QualitySelect',
  data () {
    const stateOption = seachState.map(item => {
      return {
        label: qualityTypeToCN[item],
        value: item
      }
    })
    return {
      options: stateOption
    }
  }
}
</script>

<style lang="less" scoped>
.account-source-select {
  width: 164px;
}
</style>
