<template>
  <div class="take-orders-list">
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="streamNum" label="流水号" width="220">
        <template slot-scope="scope">
          {{ scope.row.streamNum }}
          <el-tag v-if="scope.row.isCheckReturn" size="mini" type="danger">审核退回</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="productName" label="拍摄产品" />
      <el-table-column prop="photoNum" label="照片张数" />
      <el-table-column label="修图标准">
        <template slot-scope="scope">
          {{ scope.row.type | toRetouchClass }}
        </template>
      </el-table-column>
      <el-table-column prop="photographerName" label="所属机构" />
      <el-table-column prop="waitTime" label="顾客等待时间" />
      <el-table-column label="沙漏剩余时长" width="140">
        <template slot-scope="scope">
          <sand-count-down v-if="scope.row.hour_glass" :sand-glass="scope.row.hour_glass" />
          <div v-else>暂无信息</div>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleOrder(scope.row.streamId)">修图</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import SandCountDown from './SandCountDown'
export default {
  name: 'TakeOrdersList',
  components: { SandCountDown },
  props: {
    tableData: { type: Array, default: () => [] }
  },
  methods: {
    handleOrder (aid) {
      this.$emit('update:aid', aid)
      this.$nextTick(() => {
        this.$emit('update:showDetail', true)
      })
    }
  }
}
</script>
