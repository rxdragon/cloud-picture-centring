<template>
  <div class="cloud-spot-grass-select">
    <el-select
      v-bind="$attrs"
      :popper-append-to-body="false"
      placeholder="请选择种拔草"
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
  name: 'CloudSpotGrassSelect',
  data () {
    return {
      options: [
        {
          label: '云学院抽查',
          value: SPOT_CHECK_MAP.CLOUD
        },
        {
          label: '修修兽抽查',
          value: SPOT_CHECK_MAP.SHOW
        },
        {
          label: '未抽查',
          value: SPOT_CHECK_MAP.NONE
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
