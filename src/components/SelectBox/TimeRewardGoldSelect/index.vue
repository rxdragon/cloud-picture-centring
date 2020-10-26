<template>
  <div class="state-select">
    <el-select
      v-bind="$attrs"
      placeholder="选择金币卡"
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
  name: 'TimeRewardGoldSelect',
  data () {
    return {
      options: [ // 状态选项
        {
          label: '1.5倍',
          value: 1.5
        }, {
          label: '2倍',
          value: 2
        }
      ]
    }
  }
}
</script>
