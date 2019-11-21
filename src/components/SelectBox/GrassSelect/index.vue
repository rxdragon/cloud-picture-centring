<template>
  <div class="grass-select">
    <el-select v-bind="$attrs" :popper-append-to-body="false" placeholder="请选择种拔草" v-on="$listeners">
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
export default {
  name: 'GrassSelect',
  data () {
    return {
      options: [{
        label: '全部',
        value: 0
      }, {
        label: '种草',
        value: 'plant'
      }, {
        label: '拔草',
        value: 'pull'
      }]
    }
  }
}
</script>

<style lang="less" scoped>
.el-select {
  width: 100px;
}
</style>
