<template>
  <div class="announcement-people-select">
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
import { ANNOUNCEMENT_PEOPLE, announcementPeopleToCN } from '@/utils/enumerate'

export default {
  name: 'AnnouncementPeopleSelect',
  data () {
    return {
      options: []
    }
  },
  created () {
    for (const type in ANNOUNCEMENT_PEOPLE) {
      this.options.push({
        label: announcementPeopleToCN[ANNOUNCEMENT_PEOPLE[type]],
        value: ANNOUNCEMENT_PEOPLE[type]
      })
    }
  }
}
</script>
