<template>
  <div class="hang-up-list">
    <el-table :data="tableData" style="width: 100%;">
      <el-table-column label="流水号" width="250">
        <template slot-scope="scope">
          <div class="stream-state" :class="{'wrap': scope.row.isCheckReturn && scope.row.isStoreReturn}">
            <div class="stream-num">{{ scope.row.streamNum }}</div>
            <el-tag v-if="scope.row.isCheckReturn" size="mini" type="danger">审核退回</el-tag>
            <el-tag v-if="scope.row.isStoreReturn" size="mini" type="danger">门店退回</el-tag>
          </div>
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
      this.$store.commit('notification/SET_RETOUCH_STREAM_ID', aid)
    }
  }
}
</script>

<style lang="less" scoped>
.hang-up-list {
  .stream-state {
    .el-tag:nth-last-of-type(1) {
      margin-left: 12px;
    }

    .stream-num {
      display: inline-block;
    }

    &.wrap {
      .stream-num {
        display: block;
      }
    }
  }
}
</style>
