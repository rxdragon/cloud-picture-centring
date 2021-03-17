<template>
  <div class="product-select">
    <el-cascader
      :options="options"
      :props="propsValue"
      collapse-tags
      v-bind="$attrs"
      :popper-append-to-body="false"
      placeholder="请选择产品"
      filterable
      clearable
      :disabled="!loadingDown"
      v-on="$listeners"
    >
      <template slot-scope="{ node, data }">
        <span>{{ data.label }}</span>
        <span v-if="!node.isLeaf && !data.productCount"> ({{ data.children.length }}) </span>
        <span v-if="data.productCount"> ({{ data.productCount }}) </span>
      </template>
    </el-cascader>
  </div>
</template>

<script>
import * as ProductClassificationApi from '@/api/productClassificationApi.js'

export default {
  name: 'ProductSelect',
  props: {
    showPicProduct: { type: Boolean, default: true },
    himoProduct: { type: Boolean, default: true }
  },
  data () {
    return {
      deafultProps: { multiple: true, emitPath: false },
      options: [],
      loadingDown: false
    }
  },
  computed: {
    propsValue () {
      return Object.assign({}, this.deafultProps, this.props)
    }
  },
  created () {
    this.getAllProduct()
  },
  methods: {
    /**
     * @description 获取全部伙伴
     */
    async getAllProduct () {
      const req = {
        rootId: 0,
        withProduct: true,
        showPicProduct: this.showPicProduct,
        himoProduct: this.himoProduct
      }
      const list = await ProductClassificationApi.getClassificationProductTree(req)
      this.options = list
      this.loadingDown = true
    }
  }
}
</script>

<style lang="less">
.product-select {
  width: 100%;

  .el-cascader {
    .el-cascader__tags input {
      font-size: 14px;
    }
  }
}
</style>
