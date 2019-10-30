<template>
  <div class="product-sand-config">
    <!-- 列表数据 -->
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="productName" label="产品名称">
        <template slot-scope="scope">
          <el-popover
            placement="bottom-end"
            width="200"
            trigger="hover"
            :content="scope.row.productName"
          >
            <div slot="reference" class="product-name">
              {{ scope.row.productName }}
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="修图标准">
        <template slot-scope="scope">
          {{ scope.row.retouchStandard | toRetouchClass }}
        </template>
      </el-table-column>
      <el-table-column prop="baseTime" label="基础时间" />
      <el-table-column prop="superimposedTime" label="叠加时间" />
      <el-table-column prop="range" label="使用范围">
        <template slot-scope="scope">
          <div v-if="scope.row.range.length === hourGlassLength" class="tag-label">
            <el-tag size="mini">所有伙伴</el-tag>
          </div>
          <div v-else class="tag-label">
            <el-tag v-for="(item, index) in scope.row.range" :key="index" size="mini">
              {{ item | toRangeChange }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="editSandClock(scope.row)">修改</el-button>
          <el-button type="danger" size="mini" @click="deleteHourGlass(scope.row)">删除</el-button>
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
</template>

<script>
import * as OperationManage from '@/api/operationManage.js'

export default {
  name: 'ProductSandConfig',
  props: {
    hourGlassLength: { type: Number, required: true }, // 换班范围长度
    isRefresh: { type: Boolean }
  },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      tableData: [],
      pager: {
        page: 1,
        pageSize: 10,
        total: 10
      }
    }
  },
  watch: {
    isRefresh (value) {
      if (!value) {
        this.getHourGlassList()
      }
    }
  },
  created () {
    this.getHourGlassList()
  },
  methods: {
    /**
     * @description 监听页码变化
     */
    handleCurrentChange () {
      this.getHourGlassList()
    },
    /**
     * @description 获取沙漏列表
     */
    async getHourGlassList () {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const reqData = {
          page: this.pager.page,
          pageSize: this.pager.pageSize
        }
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await OperationManage.getHourGlassList(reqData)
        this.tableData = data.list
        this.pager.total = data.total
        this.$emit('changeHourGlassGlobalState', data.hour_glass_global_state)
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        throw new Error(error)
      }
    },
    /**
     * @description 删除沙漏
     */
    async deleteHourGlass (listItem) {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const reqData = { configId: listItem.id }
        await OperationManage.DeleteHourGlass(reqData)
        this.$newMessage.success('删除成功')
        this.getHourGlassList()
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        throw new Error(error)
      }
    },
    /**
     * @description 编辑沙漏
     */
    editSandClock (listItem) {
      this.$emit('update:editId', listItem.id)
    }
  }
}
</script>

<style lang="less" scoped>
.product-sand-config {
  .product-name {
    width: 180px;
    overflow: hidden;
    word-break: keep-all;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
