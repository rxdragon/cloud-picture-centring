<template>
  <div class="edit-category">
    <div class="header">
      <h3>{{ editData ? '编辑修图类别' : '新增修图类型' }}</h3>
      <el-button type="info" @click="toBack">返回</el-button>
    </div>
    <div class="category-name search-item">
      <span>修图类别名称</span>
      <el-input v-model="categoryName" v-maxLength16 placeholder="请输入修图类别名称" />
    </div>
    <div class="product-box search-item">
      <span>可接产品</span>
      <product-panel
        :default-checked-keys="defaultCheckedKeys"
        :is-loading-down.sync="isLoadingDown"
        :to-data.sync="toData"
      />
    </div>
    <div class="submit-box">
      <el-button v-if="isEdit" type="primary" @click="update">提交</el-button>
      <el-button v-else type="primary" @click="add">提交</el-button>
    </div>
  </div>
</template>

<script>
import ProductPanel from '@/components/ProductPanel'
import * as AccountManage from '@/api/accountManage'

export default {
  name: 'EditCategory',
  components: { ProductPanel },
  props: {
    editData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      routeName: this.$route.name,
      categoryName: '',
      defaultCheckedKeys: [],
      isLoadingDown: false,
      toData: []
    }
  },
  computed: {
    // 是否是编辑
    isEdit () {
      return Object.keys(this.editData).length
    }
  },
  watch: {
    isLoadingDown (value) {
      if (value && this.isEdit) { this.getRetoucherClassInfo(this.editData.id) }
    }
  },
  created () {
    if (this.isEdit) {
      this.categoryName = this.editData.name
    }
  },
  methods: {
    /**
     * @description 返回上一级
     */
    toBack () {
      this.$emit('update:showEdit', false)
    },
    /**
     * @description 获取产品信息
     */
    async getRetoucherClassInfo (id) {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const req = { retoucherClassId: id }
        const data = await AccountManage.getRetoucherClassInfo(req)
        const productIds = data.products.map(item => item.id)
        this.defaultCheckedKeys = productIds
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        throw new Error(error)
      }
    },
    /**
     * @description 获取角色组列表
     */
    getParams () {
      if (!this.categoryName) return false
      const req = {
        name: this.categoryName,
        productIds: []
      }
      if (this.isEdit) { req.retoucherClassId = this.editData.id }
      this.toData.forEach(listItem => {
        const childrenIds = listItem.children.map(item => item.id)
        req.productIds = [...req.productIds, ...childrenIds]
      })
      return req
    },
    /**
     * @description 获取角色组列表
     */
    add () {
      const req = this.getParams()
      if (!req) return false
      this.$store.dispatch('setting/showLoading', this.routeName)
      AccountManage.addRetoucherClass(req)
        .then(() => {
          this.$newMessage.success('新增成功!')
          this.$emit('finishedEdit')
        })
    },
    /**
     * @description 获取角色组列表
     */
    update () {
      const req = this.getParams()
      if (!req) return false
      this.$store.dispatch('setting/showLoading', this.routeName)
      AccountManage.editRetoucherClass(req)
        .then(() => {
          this.$newMessage.success('修改成功!')
          this.$emit('finishedEdit')
        })
    }
  }
}
</script>

<style lang="less">
.edit-category {
  .back-button {
    text-align: right;
  }

  .category-name {
    margin-bottom: 24px;
    .el-input {
      width: 220px;
    }
  }

  .product-box {
    align-items: flex-start;

    .product-panel {
      flex-basis: 800px;
    }
  }

  .search-item {
    &>span {
      display: inline-block;
      width: 90px;
    }
  }

  .submit-box {
    margin-top: 24px;
    text-align: center;
  }
}
</style>
