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
        <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
      </template>
    </el-cascader>
  </div>
</template>

<script>
import * as Product from '@/api/product.js'

export default {
  name: 'ProductSelect',
  props: {
    props: {
      type: Object,
      default: () => {
        return {}
      }
    }
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
      const list = await Product.getAllProduct()
      this.options = list
      this.loadingDown = true
    }
  }
}
</script>

<style lang="less">
.product-select {
  .el-cascader {
    width: 310px;

    .el-cascader__tags input {
      font-size: 14px;
    }
  }
}
</style>
