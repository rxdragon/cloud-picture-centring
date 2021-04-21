<template>
  <div class="back-colors-select">
    <el-select
      :disabled="disableState"
      filterable
      v-bind="$attrs"
      clearable
      :popper-append-to-body="false"
      placeholder="请选择修图底色"
      v-on="$listeners"
    >
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
import * as CommonalityApi from '@/api/commonality.js'

export default {
  name: 'BackColorsSelect',
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
     * @description 获取机构列表
     */
    async getInstitutionList () {
      const list = await CommonalityApi.getBackColors()
      this.options = list
      this.disableState = false
    }
  }
}
</script>

<style lang="less" scoped>
.back-colors-select {
  width: 100%;

  .el-select {
    width: 100%;
  }
}
</style>
