<template>
  <div class="base-sand-config">
    <!-- 列表数据 -->
    <el-table :data="tableData" style="width: 100%;">
      <el-table-column label="修图标准">
        <template slot-scope="scope">
          <div class="standard-box">
            {{ scope.row.retouchStandard | toRetouchClass }}
            <div class="standard-icon">
              <div :class="`iconmap-standard-${scope.row.retouchStandard}`" />
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="baseTime" label="基础时间" />
      <el-table-column prop="superimposedTime" label="叠加时间" />
      <el-table-column prop="range" label="适用范围">
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
      <el-table-column prop="" label="操作">
        <template slot-scope="scope">
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
  name: 'BaseSandConfig',
  props: {
    hourGlassLength: { type: Number, required: true }, // 换班范围长度
    isRefresh: { type: Boolean }
  },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      pager: {
        page: 1,
        pageSize: 10,
        total: 10
      },
      tableData: []
    }
  },
  watch: {
    isRefresh (value) {
      if (!value) {
        this.getBaseHourGlassSetting()
      }
    }
  },
  created () {
    this.getBaseHourGlassSetting()
  },
  methods: {
    /**
     * @description 监听页面变化
     */
    handleCurrentChange () {
      this.getBaseHourGlassSetting()
    },
    /**
     * @description 获取基础沙漏
     */
    async getBaseHourGlassSetting () {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await OperationManage.getBaseHourGlassSetting()
        this.tableData = data.list
        this.pager.total = data.total
        this.$emit('changeHourGlassGlobalState', data.hour_glass_global_state)
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    },
    /**
     * @description 删除沙漏配置
     */
    async deleteHourGlass (listItem) {
      this.$confirm('确认删除该基础沙漏配置吗？', '', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        try {
          this.$store.dispatch('setting/showLoading', this.routeName)
          const reqData = { configId: listItem.deleteId }
          await OperationManage.deleteHourGlass(reqData)
          this.$newMessage.success('删除成功')
          this.getBaseHourGlassSetting()
          this.$store.dispatch('setting/hiddenLoading', this.routeName)
        } catch (error) {
          this.$store.dispatch('setting/hiddenLoading', this.routeName)
          console.error(error)
        }
      }).catch()
    }
  }
}
</script>
