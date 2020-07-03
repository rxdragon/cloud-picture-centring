<template>
  <el-select
    :disabled="disableState"
    filterable
    multiple
    v-bind="$attrs"
    clearable
    :popper-append-to-body="false"
    placeholder="全部人员"
    v-on="$listeners"
  >
    <el-option
      v-for="item in options"
      :key="item.id"
      :label="item.nickname"
      :value="item.id"
    >
    </el-option>
  </el-select>
</template>

<script>
import * as GradeConfiguration from '@/api/gradeConfiguration.js'

export default {
  name: 'scorerSelect',
  data () {
    return {
      options: [],
      disableState: true
    }
  },
  created () {
    this.getInstitutionList()
  },
  methods: {
    /**
     * @description 获评分人列表
     */
    async getInstitutionList () {
      const list = await GradeConfiguration.getTakeStaffList()
      this.options = list
      this.disableState = false
    }
  }
}
</script>
