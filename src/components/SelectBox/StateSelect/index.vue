<template>
  <div class="state-select">
    <el-select v-bind="$attrs" placeholder="请选择状态" v-on="$listeners">
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
  name: 'StateSelect',
  data () {
    return {
      options: [ // 状态选项
        {
          label: '全部',
          value: 0
        }, {
          label: '未使用',
          value: 'unused'
        }, {
          label: '使用中',
          value: 'using'
        }, {
          label: '已结束',
          value: 'auto_end'
        }, {
          label: '提前结束',
          value: 'manual_end'
        }, {
          label: '已过期',
          value: 'expired'
        }
      ]
    }
  }
}
</script>
