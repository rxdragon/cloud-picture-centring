<template>
  <div class="staff-info">
    <div class="staff-header">生效伙伴（{{ staffNum }}）</div>
    <div class="staff-content">
      <el-tree
        :data="staffListData"
        default-expand-all
        :indent="20"
        :props="defaultProps"
        v-bind="$attrs"
        v-on="$listeners"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'StaffInfo',
  props: {
    staffList: { type: Array, default: () => [] }
  },
  data () {
    return {
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      staffNum: 0
    }
  },
  computed: {
    staffListData () {
      return this.staffList
    }
  },
  watch: {
    staffList (value) {
      this.staffNum = 0
      value.forEach(staffItem => {
        this.staffNum += staffItem.children.length
      })
    }
  }
}
</script>

<style lang="less" scoped>
.staff-info {
  border: 1px solid #eee;
  width: 300px;

  .staff-header {
    padding: 10px;
    background-color: #F4F7F9;
  }

  .staff-content {
    .el-tree-node__expand-icon,
    .el-tree-node__label {
      font-size: 16px;
    }
  }
}
</style>
