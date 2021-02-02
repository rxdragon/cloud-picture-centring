<template>
  <div class="announcement-read-state">
    <el-select clearable v-bind="$attrs" v-on="$listeners">
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
import { READ_STATE, readToCN } from '@/utils/enumerate'

export default {
  name: 'AnnouncementReadState',
  data () {
    return {
      options: []
    }
  },
  created () {
    for (const type in READ_STATE) {
      this.options.push({
        label: readToCN[READ_STATE[type]],
        value: READ_STATE[type]
      })
    }
  }
}
</script>
