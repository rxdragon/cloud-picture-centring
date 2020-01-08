<template>
  <div class="product-control page-class">
    <transition name="fade" mode="out-in">
      <div v-if="!showInfo" class="list-box">
        <div class="header">
          <h3>产品管理</h3>
        </div>
        <el-tabs v-model="activeName">
          <el-tab-pane label="待审核" name="checkPending" />
          <el-tab-pane label="审核通过" name="checked" />
        </el-tabs>
        <div class="table-box" :class="{'no-border': activeName === 'checkPending'}">
          <div class="search-box">
            <div class="institution-box search-item">
              <span>摄影机构</span>
              <institution-select v-model="institutionType" institution-class="photographe" @change="onSearchChange" />
            </div>
            <div v-if="!isPending" class="product-box search-item">
              <span>产品名称</span>
              <product-select v-model="productValue" @change="onSearchChange" />
            </div>
            <div v-if="!isPending" class="weight-box search-item">
              <span>权重等级</span>
              <weight-select v-model="weightType" @change="onSearchChange" />
            </div>
            <div class="button-box">
              <el-button type="primary" @click="getProductList">查 询</el-button>
            </div>
          </div>
          <el-table :data="tableData" style="width: 100%;">
            <el-table-column prop="name" label="产品名称" />
            <el-table-column prop="photographerOrgName" label="机构名称" />
            <el-table-column v-if="isPending" prop="retouch_require" label="修图要求" />
            <el-table-column v-if="!isPending" label="修图标准">
              <template slot-scope="scope">
                <div class="standard-box">
                  {{ scope.row.retouch_standard | toRetouchClass }}
                  <div class="standard-icon">
                    <div :class="`iconmap-standard-${scope.row.retouch_standard}`" />
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column v-if="!isPending" prop="weight_level" label="权重等级">
              <template slot-scope="scope">
                {{ scope.row.weight_level | filterWeightEnum }}
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="goDetail(scope.row)">详情</el-button>
                <el-button v-if="!isPending" type="danger" size="mini" @click="delProduct(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页 -->
          <div class="page-box">
            <el-pagination
              :hide-on-single-page="true"
              :current-page.sync="pager.page"
              :page-size="pager.pageSize"
              layout="total, prev, pager, next, jumper"
              :total="pager.total"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
      <product-info v-else :show-info.sync="showInfo" :is-pending="isPending" :edit-id="editId" />
    </transition>
  </div>
</template>

<script>
import ProductInfo from './components/ProductInfo'
import InstitutionSelect from '@SelectBox/InstitutionSelect'
import ProductSelect from '@SelectBox/ProductSelect'
import WeightSelect from '@SelectBox/WeightSelect'
import * as OperationManage from '@/api/operationManage.js'
import { WeightEnum } from '@/utils/enumerate.js'

export default {
  name: 'ProductControl',
  components: { ProductInfo, InstitutionSelect, ProductSelect, WeightSelect },
  filters: {
    filterWeightEnum (value) {
      return WeightEnum[value]
    }
  },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      activeName: 'checkPending', // checkPending 待审核 checked 审核通过
      institutionType: '', // 机构值
      showInfo: false, // 是否显示详情
      productValue: [], // 产品值
      weightType: 0, // 权重等级
      tableData: [], // 列表数据
      firstSearch: true, // 是否第一次搜索
      editId: '', // 编辑id
      pager: {
        page: 1,
        pageSize: 10,
        total: 0
      }
    }
  },
  computed: {
    isPending () {
      this.onSearchChange()
      return this.activeName === 'checkPending'
    }
  },
  watch: {
    activeName: {
      handler: function () {
        this.onSearchChange()
        this.getProductList()
      }
    },
    showInfo: {
      handler: function (value) {
        if (!value) {
          this.editId = ''
          this.getProductList()
        }
      }
    },
    '$route.query': {
      handler: function (query) {
        const { isCheckPass, photographerOrgId } = this.$route.query
        if (isCheckPass) { this.activeName = 'checked' }
        if (photographerOrgId) { this.institutionType = +photographerOrgId }
        this.getProductList()
      },
      immediate: true
    }
  },
  methods: {
    /**
     * @description 跳转到详情页面
     */
    goDetail (listItem) {
      this.editId = listItem.id
      this.showInfo = true
    },
    /**
     * @description 页面切换
     */
    handleCurrentChange () {
      this.getProductList()
    },
    /**
     * @description 监听搜索框是否改变
     */
    onSearchChange () {
      this.firstSearch = true
    },
    /**
     * @description 获取产品列表
     */
    async getProductList () {
      try {
        this.pager.page = this.firstSearch ? 1 : this.pager.page
        const reqData = {
          state: this.isPending ? 'wait_review' : 'enable',
          page: this.pager.page,
          pageSize: this.pager.pageSize
        }
        if (this.institutionType) { reqData.photographerOrgId = this.institutionType }
        if (!this.isPending && this.productValue.length) { reqData.productId = this.productValue }
        if (!this.isPending && this.weightType) { reqData.weightLevel = this.weightType }
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await OperationManage.getProductList(reqData)
        this.tableData = data.item
        this.pager.total = data.total
        this.firstSearch = false
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    },
    /**
     * @description 删除产品
     * @param {*} listItem
     */
    async delProduct (listItem) {
      this.$confirm('确认删除该产品吗？', '', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        try {
          const reqData = { productId: listItem.id }
          this.$store.dispatch('setting/showLoading', this.routeName)
          await OperationManage.delProduct(reqData)
          this.$newMessage.success('删除成功')
          this.getProductList()
        } catch (error) {
          this.$store.dispatch('setting/hiddenLoading', this.routeName)
          console.error(error)
        }
      }).catch(() => {})
    }
  }
}
</script>

<style lang="less">
@import "~@/styles/variables.less";

.product-control {
  .search-box {
    margin-bottom: 24px;

    .button-box {
      text-align: right;
    }
  }

  .table-box {
    margin-top: 0;
  }
}
</style>
