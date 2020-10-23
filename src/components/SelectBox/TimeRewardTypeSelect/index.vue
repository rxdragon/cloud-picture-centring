<template>
  <div>
    <el-select
      v-bind="$attrs"
      placeholder=""
      :popper-append-to-body="false"
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
import { TIME_REWARD_TYPE, timeRewardTypeToCN } from '@/utils/enumerate.js'

export default {
  name: 'TimeRewardTypeSelect',
  props: {
    needAll: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      options: []
    }
  },
  created () {
    for (const type in TIME_REWARD_TYPE) {
      this.options.push({
        label: timeRewardTypeToCN[TIME_REWARD_TYPE[type]],
        value: TIME_REWARD_TYPE[type]
      })
    }
    if (this.needAll) {
      this.options.unshift({ label: '全部', value: '' })
    }
  }
}
</script>
