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
// import { getAllRetouchRank } from '@/api/accountManage.js'

export default {
  name: 'RetouchRankSelect',
  props: {
    importModel: { type: Boolean }
  },
  data () {
    return {
      options: [{
        label: '修图助理',
        value: 1
      },{
        label: '修图助理(2级)',
        value: 2
      }],
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
      // const list = await getAllRetouchRank()
      // this.options = list
      this.disableState = false
    }
  }
}
</script>
