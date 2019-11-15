<template>
  <div class="work-board-table">
    <el-table :data="tableData" style="width: 100%;">
      <el-table-column prop="index" label="位置" min-width="100px">
        <template slot-scope="scope">
          <div class="index-box">
            <span>{{ scope.row.queue_index || '-' }}</span>
            <div class="icon-box">
              <el-tag v-if="scope.row.staticsUrgent" type="danger" size="mini">急</el-tag>
              <el-tag v-if="scope.row.isReturn" type="danger" size="mini">审核退回</el-tag>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="修图标准">
        <template slot-scope="scope">
          {{ scope.row.retouchType | toRetouchClass }}
        </template>
      </el-table-column>
      <el-table-column label="订单信息" min-width="240">
        <template slot-scope="scope">
          <div v-if="scope.row.order" class="order-info">
            <span>
              <span class="info-title">订单号：</span>{{ scope.row.order.external_num }}
            </span>
            <span>
              <span class="info-title">流水号：</span>{{ scope.row.stream_num }}
            </span>
            <span>
              <span class="info-title">拍摄产品：</span>{{ scope.row.product.name }}
            </span>
            <span>
              <span class="info-title">照片数量：</span>{{ scope.row.photos.length }}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="index" label="修图师" min-width="140">
        <template slot-scope="scope">
          <div class="staff-info">
            <span>修图师：{{ scope.row.retoucherName }}</span>
            <span>组长：{{ scope.row.retouchLeader }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column v-if="showChecker" prop="reviewerName" label="审核人" />
      <el-table-column prop="waitTime" label="等待时间" />
      <el-table-column prop="streamState" label="当前状态" />
      <el-table-column label="操作" width="160">
        <template slot-scope="scope">
          <div class="operation-box">
            <el-button type="primary" size="mini" @click="linkto(scope.row.stream_num)">详情</el-button>
            <el-button v-if="!scope.row.staticsUrgent" type="danger" size="mini" @click="urgentStream(scope.row.id, 'other')">加急</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import * as AdminManage from '@/api/adminManage'
export default {
  name: 'WorkBoardTable',
  props: {
    tableData: { type: Array, required: true }, // 列表数据
    showChecker: { type: Boolean } // 是够显示审核人
  },
  data () {
    return {
      routeName: this.$route.name // 路由名字
    }
  },
  methods: {
    /**
     * @description 加急流水
     */
    async urgentStream (streamId, type) {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const req = { streamId }
        const data = await AdminManage.urgentStream(req)
        if (data) {
          this.$newMessage.success('操作成功!')
          if (type === 'urgent') {
            this.getStreamList(1)
          } else {
            this.getList(1)
          }
        }
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    },
    /**
     * @description 跳转
     */
    linkto (workBoardStreamNum) {
      this.$router.push({
        path: '/order-detail',
        query: { workBoardStreamNum }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.work-board-table {
  margin-top: 0;

  .index-box {
    display: flex;
    align-items: center;

    & > span {
      display: inline-block;
      height: 20px;
      margin-right: 10px;
    }

    .icon-box {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: space-around;
      height: 45px;
    }
  }

  .order-info {
    display: grid;
    text-align: left;

    .info-title {
      display: inline-block;
      width: 70px;
      text-align-last: justify;
    }
  }

  .operation-box {
    text-align: left;
  }

  .staff-info {
    display: grid;
    text-align: left;
  }
}
</style>
