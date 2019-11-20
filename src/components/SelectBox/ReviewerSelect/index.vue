<template>
  <div class="reviewer-select">
    <el-select
      :disabled="disableState"
      v-bind="$attrs"
      filterable
      :popper-append-to-body="false"
      placeholder="请选择审核人"
      v-on="$listeners"
    >
      <el-option v-if="showAll" label="全部" :value="0" />
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
</template>

<script>
import * as Staff from '@/api/staff.js'

export default {
  name: 'ReviewerSelect',
  props: {
    showAll: { type: Boolean }
  },
  data () {
    return {
      options: [],
      disableState: true
    }
  },
  created () {
    this.getReviewer()
  },
  methods: {
    /**
     * @description 获取审核后
     */
    async getReviewer () {
      const list = await Staff.getReviewer()
      this.options = list
      this.disableState = false
    }
  }
}
</script>
