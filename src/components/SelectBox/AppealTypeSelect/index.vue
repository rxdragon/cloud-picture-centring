<template>
  <div class="appeal-type-select">
    <el-select
      @change="selectChange"
      v-bind="$attrs"
      v-on="$listeners"
      :multiple="isMulti"
      :placeholder="needAll ? '全部' : ''"
      clearable
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
import { APPEAL_TYPE, AppealTypeNameEnum } from '@/utils/enumerate'

export default {
  name: 'AppealTypeSelect',
  props: {
    isMulti: { type: Boolean, default: false},
    needAll: { type: Boolean, default: false}
  },
  data () {
    return {
      options: []
    }
  },
  created () {
    for (const type in APPEAL_TYPE) {
      this.options.push({
        label: AppealTypeNameEnum[APPEAL_TYPE[type]],
        value: APPEAL_TYPE[type]
      })
    }
  },
  methods: {
    /**
     * @description 状态更改
     */
    selectChange () {
      this.$emit('selectChange')
    }
  }
}
</script>

<style lang="less" scoped>
.appeal-type-select {
  width: 180px;
}
</style>
