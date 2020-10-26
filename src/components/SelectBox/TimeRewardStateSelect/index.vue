<template>
  <div class="state-select">
    <el-select
      v-bind="$attrs"
      placeholder="全部"
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
import { timeRewardStateToCN, TIME_REWARD_STATE } from '@/utils/enumerate.js'


export default {
  name: 'TimeRewardStateSelect',
  data () {
    return {
      options: []
    }
  },
  created () {
    for (const state in TIME_REWARD_STATE) {
      this.options.push({
        label: timeRewardStateToCN[TIME_REWARD_STATE[state]],
        value: TIME_REWARD_STATE[state]
      })
    }
  }
}
</script>
