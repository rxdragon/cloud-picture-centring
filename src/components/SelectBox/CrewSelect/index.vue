<template>
  <div class="crew-select">
    <el-select
      :disabled="disableState"
      :popper-append-to-body="false"
      v-bind="$attrs"
      placeholder="请选择组员"
      v-on="$listeners"
    >
      <el-option label="全部" :value="0" />
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
import * as Staff from '@/api/staff.js'
export default {
  name: 'CrewSelect',
  data () {
    return {
      options: [],
      disableState: true
    }
  },
  created () {
    this.getSelfStaffs()
  },
  methods: {
    /**
     * @description 获取组员
     */
    async getSelfStaffs () {
      const list = await Staff.getSelfStaffs()
      this.options = list
      this.disableState = false
    }
  }
}
</script>
