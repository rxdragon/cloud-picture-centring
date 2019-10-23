<template>
  <div class="product-linkage">
    <el-select
      v-model="productValue.productClass"
      class="product-type"
      filterable
      placeholder="标准"
      @change="productClassChange"
    >
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
    <el-select
      v-model="productValue.product"
      collapse-tags
      multiple
      class="product-id"
      filterable
      placeholder="请选择产品"
      @change="productChange"
    >
      <el-option
        v-for="item in productOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
</template>

<script>
import * as Product from '@/api/product.js'

export default {
  name: 'ProductLinkage',
  model: {
    prop: 'productValue',
    event: 'change'
  },
  props: {
    productValue: { type: Object, required: true }
  },
  data () {
    return {
      options: []
    }
  },
  computed: {
    /**
     * @description 产品选项
     */
    productOptions () {
      const createData = this.options.find(optionItem => optionItem.value === this.productValue.productClass)
      const returnData = createData ? createData.children : []
      return returnData
    }
  },
  created () {
    this.getAllProduct()
  },
  methods: {
    async getAllProduct () {
      const list = await Product.getAllProduct()
      this.options = list
    },
    /**
     * @description 监听标准变化
     */
    productClassChange () {
      this.productValue.product = []
      const data = {
        productClass: this.productValue.productClass,
        product: this.productValue.product
      }
      this.$emit('change', data)
    },
    /**
     * @description 监听产品变化
     */
    productChange () {
      const data = {
        productClass: this.productValue.productClass,
        product: this.productValue.product
      }
      this.$emit('change', data)
    }
  }
}
</script>

<style lang="less">
.product-linkage {
  display: flex;
  width: 319px;

  .product-type {
    width: 100px;

    .el-input {
      width: 100% !important;
    }
  }

  .product-id {
    width: calc(~'100% - 100px');

    .el-input {
      width: 100% !important;
    }

    .el-tag {
      max-width: 100px;
      display: flex;
      align-items: center;

      .el-select__tags-text {
        text-overflow: ellipsis;
        overflow: hidden;
        max-width: 50px;
        display: block;
        white-space: nowrap;
      }
    }
  }
}
</style>
