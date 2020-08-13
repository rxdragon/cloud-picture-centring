<template>
  <div class="appeal-status-select">
    <el-select
      clearable
      multiple
      v-bind="$attrs"
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
import { APPEAL_STREAM_STATUS, AppealStreamStatusEnum } from '@/utils/enumerate'

const defaultOptions = [
  {
    label: AppealStreamStatusEnum[APPEAL_STREAM_STATUS.WAIT_FIRST],
    value: APPEAL_STREAM_STATUS.WAIT_FIRST
  }, {
    label: AppealStreamStatusEnum[APPEAL_STREAM_STATUS.FIRST_EXAMINE],
    value: APPEAL_STREAM_STATUS.FIRST_EXAMINE
  },
  {
    label: AppealStreamStatusEnum[APPEAL_STREAM_STATUS.WAIT_SECOND],
    value: APPEAL_STREAM_STATUS.WAIT_SECOND
  },
  {
    label: AppealStreamStatusEnum[APPEAL_STREAM_STATUS.SECOND_EXAMINE],
    value: APPEAL_STREAM_STATUS.SECOND_EXAMINE
  },
  {
    label: AppealStreamStatusEnum[APPEAL_STREAM_STATUS.FINISH],
    value: APPEAL_STREAM_STATUS.FINISH
  },
  {
    label: AppealStreamStatusEnum[APPEAL_STREAM_STATUS.EXPIRE],
    value: APPEAL_STREAM_STATUS.EXPIRE
  }
]
export default {
  name: 'AppealStatusSelect',
  props: {
    options: { type: Array, default: () => (defaultOptions) }
  }
}
</script>

<style lang="less" scoped>
.appeal-status-select {
  width: 180px;
}
</style>
