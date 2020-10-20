<template>
  <div class="state-select">
    <el-select
      v-bind="$attrs"
      placeholder="请选择状态"
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
  name: 'TimeRewardStateSelect',
  data () {
    return {
      options: [ // 状态选项
        {
          label: '全部',
          value: 0
        }, {
          label: '生效中',
          value: 1
        }, {
          label: '已结束',
          value: 2
        }
      ]
    }
  }
}
</script>
