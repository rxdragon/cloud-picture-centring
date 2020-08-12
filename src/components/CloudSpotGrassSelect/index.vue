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
import { GRADE_TYPE } from '@/utils/enumerate'

export default {
  name: 'CloudSpotGrassSelect',
  data () {
    return {
      options: [{
        label: '种草',
        value: GRADE_TYPE.PLANT
      }, {
        label: '拔草',
        value: GRADE_TYPE.PULL
      }, {
        label: '一般',
        value: GRADE_TYPE.NONE
      }]
    }
  }
}
</script>

<style lang="less" scoped>
.el-select {
  width: 105px;
}
</style>
