<template>
  <div v-loading="productLoading" class="product-panel">
    <transfer-extend
      v-if="!productLoading"
      :default-checked-keys="defaultChecks"
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
    defaultCheckedKeys: { type: Array, default: () => [] }, // 默认选中组员
    disabledChecked: { type: Array, default: null } // 禁止选中
  },
  data () {
    return {
      fromData: [], // 源数据
      title: ['可选产品', '已选产品'], // 人员选中列表
      productLoading: true,
      defaultChecks: []
    }
  },
  watch: {
    defaultCheckedKeys: {
      handler (value) {
        const disabledChecked = this.disabledChecked || []
        const data = new Set([...this.defaultCheckedKeys, ...disabledChecked])
        this.defaultChecks = [...data]
      },
      immediate: true
    },
    disabledChecked: {
      handler (value) {
        const data = new Set([...this.defaultCheckedKeys, ...value])
        this.defaultChecks = [...data]
        this.getAllProductPanel(value)
      },
      immediate: false
    }
  },
  mounted () {
    if (!this.disabledChecked || !this.disabledChecked.length) {
      this.defaultChecks = this.defaultCheckedKeys
      this.getAllProductPanel()
    }
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
    async getAllProductPanel (disabledId) {
      this.productLoading = true
      const list = await Product.getAllProductPanel(disabledId)
      this.fromData = JSON.parse(JSON.stringify(list))
      this.productLoading = false
    }
  }
}
</script>

<style lang="less" scoped>
.product-panel {
  height: 540px;

  ::-webkit-scrollbar {
    height: 8px;
  }
}

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
