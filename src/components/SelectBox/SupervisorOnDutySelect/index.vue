<template>
  <div class="supervisor-onDuty-select">
    <el-select
      v-bind="$attrs"
      placeholder="请选择值班主管"
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
import * as SupervisorOnDuty from '@/api/supervisorOnDuty.js'

export default {
  name: 'SupervisorOnDutySelect',
  data () {
    return {
      options: []
    }
  },
  created () {
    this.getSupervisorOnDuty()
  },
  methods: {
    /**
     * @description 获取值班主管
     */
    async getSupervisorOnDuty () {
      this.options = await SupervisorOnDuty.getAllExecutive()
    }
  }
}
</script>

<style lang="less" scoped>
.el-select {
  width: 100%;
}
</style>
