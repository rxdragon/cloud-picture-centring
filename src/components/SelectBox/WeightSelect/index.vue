<template>
  <div class="weight-select">
    <el-select
      v-bind="$attrs"
      filterable
      :popper-append-to-body="false"
      placeholder="请选择权重等级"
      v-on="$listeners"
    >
      <el-option v-if="!importData" label="全部等级" :value="0"/>
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.name"
        :value="item.id"
      />
    </el-select>
  </div>
</template>

<script>
import * as queueWeightManageApi from '@/api/queueWeightManageApi'
export default {
  name: 'WeightSelect',
  props: {
    importData: { type: Boolean }
  },
  data () {
    return {
      options: []
    }
  },
  async mounted () {
    this.options = await queueWeightManageApi.getQueueWeightTypeList()
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 230px;
}
</style>
