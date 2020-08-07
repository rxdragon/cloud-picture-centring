<template>
  <div class="appeal-type-select">
    <el-select v-bind="$attrs" v-on="$listeners">
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
import { APPEAL_TYPE, AppealTypeNameEnum } from '@/utils/enumerate'

export default {
  name: 'AppealTypeSelect',
  data () {
    return {
      options: [
        {
          label: '全部',
          value: ''
        }, {
          label: AppealTypeNameEnum[APPEAL_TYPE.REWORK],
          value: APPEAL_TYPE.REWORK
        }
      ]
    }
  }
}
</script>

<style lang="less" scoped>
.appeal-type-select {
  width: 180px;
}
</style>
