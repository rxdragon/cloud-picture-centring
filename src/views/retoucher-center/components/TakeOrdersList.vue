<template>
  <div class="take-orders-list">
    <el-table :data="tableData" style="width: 100%;">
      <el-table-column prop="streamNum" label="流水号" min-width="150">
        <template slot-scope="scope">
          <div
            class="stream-state"
            :class="{'wrap': scope.row.isCheckReturn && scope.row.isStoreReturn}"
          >
            <div class="stream-num">{{ scope.row.streamNum }}</div>
            <el-tag v-if="scope.row.isCheckReturn" size="mini" type="danger">审核退回</el-tag>
            <el-tag v-if="scope.row.isStoreReturn" size="mini" type="danger">门店退回</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="拍摄产品">
        <template slot-scope="scope">{{ scope.row.productInfo.productName }}</template>
      </el-table-column>
      <el-table-column prop="photoNum" label="照片张数" />
      <el-table-column label="修图标准">
        <template slot-scope="scope">
          <div class="standard-box">
            {{ scope.row.productInfo.type | toRetouchClass }}
            <div class="standard-icon">
              <div :class="`iconmap-standard-${scope.row.productInfo.type}`" />
            </div>
          </div>
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
      this.$store.commit('notification/SET_RETOUCH_STREAM_ID', aid)
    }
  }
}
</script>

<style lang="less" scoped>
.take-orders-list {
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
