<template>
  <div class="CheckGrassSelect">
    <el-select v-bind="$attrs" :popper-append-to-body="false" placeholder="请选择中拔草" v-on="$listeners">
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
  name: 'CheckGrassSelect',
  data () {
    return {
      options: [{
        label: '全部',
        value: 0
      }, {
        label: '意见相同',
        value: SearchType.RectifySame
      }, {
        label: '意见不同',
        value: SearchType.RectifyDifferent
      }, {
        label: '意见不同（种草）',
        value: SearchType.RectifyPlant
      }, {
        label: '意见不同（拔草）',
        value: SearchType.RectifyPull
      }, {
        label: '意见不同（不种不拔）',
        value: SearchType.RectifyNone
      }]
    }
  }
}
</script>

<style lang="less" scoped>

</style>
