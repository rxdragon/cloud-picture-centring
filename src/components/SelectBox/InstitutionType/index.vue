<template>
  <div class="institution-select">
    <el-select v-bind="$attrs" :popper-append-to-body="false" placeholder="请选择机构" v-on="$listeners">
      <el-option
        v-for="item in institutionOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
</template>

<script>
export default {
  name: 'InstitutionSelect',
  props: {},
  data () {
    return {
      institutionOptions: [{
        label: '全部',
        value: 0
      }, {
        label: '蓝标',
        value: 'blue'
      }, {
        label: '大师',
        value: 'master'
      }, {
        label: 'kids',
        value: 'kids'
      }, {
        label: '缦图',
        value: 'mainto'
      }, {
        label: '外包机构',
        value: 'out'
      }]
    }
  }
}
</script>

<style lang="less" scoped>
.institution-select {
  & > span {
    margin-right: 10px;
  }
}
</style>
