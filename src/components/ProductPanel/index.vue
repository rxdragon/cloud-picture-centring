<template>
  <div v-loading="productLoading" class="product-panel">
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
import * as Product from '@/api/product'

export default {
  name: 'ProductPanel',
  components: { TransferExtend },
  props: {
    defaultCheckedKeys: { type: Array, default: () => [] } // 默认选中组员
  },
  data () {
    return {
      fromData: [], // 源数据
      title: ['可选产品', '已选产品'], // 人员选中列表
      productLoading: true
    }
  },
  created () {
    this.getAllProductPanel()
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
     * @description 获取全部产品
     */
    async getAllProductPanel () {
      const list = await Product.getAllProductPanel()
      this.fromData = JSON.parse(JSON.stringify(list))
      this.$emit('update:isLoadingDown', true)
      this.productLoading = false
    }
  }
}
</script>

<style lang="less" scoped>
.staff-panel {
  display: flex;
  width: 800px;
  flex-wrap: wrap;

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
