<template>
  <div v-loading="isLoading" class="staff-panel">
    <transfer-extend
      :default-checked-keys="defaultCheckedKeys"
      :from-data="fromData"
      :title="title"
      mode="transfer"
      default-transfer
      filter
      height="540px"
      v-bind="$attrs"
      @addbtn="addToData"
      @removebtn="remove"
      v-on="$listeners"
    />
  </div>
</template>

<script>
import TransferExtend from '@/components/TransferExtend'
import * as Staff from '@/api/staff'

export default {
  name: 'StaffPanel',
  components: { TransferExtend },
  props: {
    defaultCheckedKeys: { type: Array, default: () => [] } // 默认选中组员
  },
  data () {
    return {
      fromData: [], // 源数据
      title: ['未选组员', '已选组员'], // 人员选中列表
      isLoading: true
    }
  },
  created () {
    this.getStaffList()
  },
  methods: {
    /**
     * [addToData 添加组员按钮]
     * @param {[Array]} fromData [源数组]
     * @param {[Array]} toData [目标对象]
     * @param {[Object]} obj [节点对象]
     * 树形穿梭框模式transfer时，返回参数为左侧树移动后数据、右侧树移动后数据、移动的{keys,nodes,halfKeys,halfNodes}对象
     */
    addToData (fromData, toData, obj) {
      this.$emit('update:toData', toData)
    },
    /**
     * [remove 移除按钮]
     * @param {[Array]} fromData [源数组]
     * @param {[Array]} toData [目标对象]
     * @param {[Object]} obj [节点对象]
     */
    remove (fromData, toData, obj) {
      this.$emit('update:toData', toData)
    },
    /**
     * @description 获取伙伴信息
     */
    async getStaffList () {
      try {
        this.isLoading = true
        const list = await Staff.getStaffList()
        this.fromData = JSON.parse(JSON.stringify(list))
        this.$emit('update:isLoadingDown', true)
        this.isLoading = false
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>

<style lang="less">
.staff-panel {
  display: flex;
  flex-wrap: wrap;
  width: 800px;

  .el-checkbox-group {
    margin-bottom: 10px;
  }

  .transfer-extend {
    width: 100%;
  }

  & > span {
    display: inline-block;
    width: 80px;
  }
}
</style>
