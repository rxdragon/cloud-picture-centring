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
      }
    }
  },
  computed: {
    // 伙伴信息
    staffListData () {
      return this.staffList
    },
    // 生效伙伴数量
    staffNum () {
      let num = 0
      this.staffListData.forEach(staffItem => {
        num += staffItem.children.length
      })
      return num
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
