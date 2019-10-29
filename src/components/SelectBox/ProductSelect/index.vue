<template>
  <div class="product-select">
    <el-cascader
      :options="options"
      :props="props"
      collapse-tags
      v-bind="$attrs"
      :popper-append-to-body="false"
      placeholder="请选择伙伴"
      :show-all-levels="false"
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
  data () {
    return {
      props: { multiple: true, emitPath: false },
      options: [],
      loadingDown: false
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
      try {
        const list = await Product.getAllProduct()
        this.options = list
        this.loadingDown = true
      } catch (error) {
        throw new Error(error)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 310px;
}
</style>
