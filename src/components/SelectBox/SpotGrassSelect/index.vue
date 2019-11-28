<template>
  <div class="spot-grass-select">
    <el-select v-bind="$attrs" :popper-append-to-body="false" placeholder="请选择种拔草" v-on="$listeners">
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
import { SearchType } from '@/utils/enumerate'
export default {
  name: 'SpotGrassSelect',
  data () {
    return {
      options: [{
        label: '全部',
        value: 0
      }, {
        label: '种草',
        value: SearchType.SpotPlant
      }, {
        label: '拔草',
        value: SearchType.SpotPull
      }, {
        label: '不种不拔',
        value: SearchType.SpotNone
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
