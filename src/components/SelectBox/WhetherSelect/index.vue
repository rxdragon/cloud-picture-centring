<template>
  <div class="whether-select">
    <el-select
      v-bind="$attrs"
      :popper-append-to-body="false"
      v-on="$listeners"
    >
      <el-option v-if="showAllOption" label="全部" value="all" />
      <el-option
        v-for="(item, index) in options"
        :key="index"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
</template>

<script>
export default {
  name: 'WhetherSelect',
  props: {
    showAllOption: { type: Boolean }, // 是否显示全部选项
    options: { type: Array, default: () => ({}) } // 数据项
  }
}
</script>
