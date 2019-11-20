<template>
  <div class="hang-up-list">
    <el-table :data="tableData" style="width: 100%;">
      <el-table-column label="流水号" width="250">
        <template slot-scope="scope">
          {{ scope.row.streamNum }}
          <el-tag v-if="scope.row.isRework" type="danger" size="small">审核退回</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="productName" label="拍摄产品" />
      <el-table-column prop="photoNum" label="照片张数" />
      <el-table-column prop="photographerName" label="所属机构" />
      <el-table-column prop="hangTime" label="挂起时长" />
      <el-table-column label="摄影师上传时间">
        <template slot-scope="scope">
          {{ scope.row.photographerUpdate | toTimeSpan }}
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
export default {
  name: 'HangUpList',
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
