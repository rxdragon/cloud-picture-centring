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
export default {
  name: 'TimeRewardTypeSelect',
  data () {
    return {
      options: [
        {
          label: '全部',
          value: 0
        }, {
          label: '翻倍奖励',
          value: 1
        }, {
          label: '冲量奖励',
          value: 2
        }, {
          label: '经验奖励',
          value: 3
        }
      ]
    }
  }
}
</script>
