<template>
  <div class="retouch-type-select">
    <el-select
      :disabled="disableState"
      v-bind="$attrs"
      filterable
      :popper-append-to-body="false"
      placeholder="请选择修图等级"
      v-on="$listeners"
    >
      <el-option v-if="!showAllOption" label="全部" value="" />
      <el-option
        v-for="(item, index) in options"
        :key="index"
        :label="item"
        :value="item"
      />
    </el-select>
  </div>
</template>

<script>
import { getAllRetouchRank } from '@/api/accountManage.js'

export default {
  name: 'RetouchRankSelect',
  props: {
    showAllOption: { type: Boolean } // 是否显示全部选项
  },
  data () {
    return {
      options: [],
      disableState: true
    }
  },
  created () {
    this.getAllRetouchRankList()
  },
  methods: {
    /**
     * @description 获取全部修图等级
     */
    async getAllRetouchRankList () {
      const data = await getAllRetouchRank()
      this.options = data
      this.disableState = false
    }
  }
}
</script>
