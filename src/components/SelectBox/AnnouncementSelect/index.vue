<template>
  <div class="announcement-select">
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
import { ANNOUNCEMENT_TYPE, announcementToCN } from '@/utils/enumerate'

export default {
  name: 'AnnouncementSelect',
  data () {
    return {
      options: []
    }
  },
  created () {
    for (const type in ANNOUNCEMENT_TYPE) {
      this.options.push({
        label: announcementToCN[ANNOUNCEMENT_TYPE[type]],
        value: ANNOUNCEMENT_TYPE[type]
      })
    }
  }
}
</script>

<style lang="less" scoped>
.announcement-select {
  width: 100%;

  .el-select {
    width: 100%;
  }
}
</style>
