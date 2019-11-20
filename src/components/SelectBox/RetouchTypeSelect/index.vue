<template>
  <div class="retouch-type-select">
    <el-select
      :disabled="disableState"
      v-bind="$attrs"
      filterable
      :popper-append-to-body="false"
      placeholder="请选择修图类别"
      v-on="$listeners"
    >
      <el-option v-if="!importModel" label="全部" :value="0" />
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
import * as Commonality from '@/api/commonality.js'

export default {
  name: 'RetouchTypeSelect',
  props: {
    importModel: { type: Boolean }
  },
  data () {
    return {
      options: [],
      disableState: true
    }
  },
  created () {
    this.getAllRetouchClass()
  },
  methods: {
    /**
     * @description 获取全部修图类
     */
    async getAllRetouchClass () {
      const list = await Commonality.getAllRetouchClass()
      this.options = list
      this.disableState = false
    }
  }
}
</script>
