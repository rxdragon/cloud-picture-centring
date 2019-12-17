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
              <span class="info-title">订单号：</span>{{ scope.row.order && scope.row.order.external_num || '-' }}
            </span>
            <span>
              <span class="info-title">流水号：</span>{{ scope.row.stream_num || '-' }}
            </span>
            <span>
              <span class="info-title">拍摄产品：</span>{{ scope.row.product && scope.row.product.name || '-' }}
            </span>
            <span>
              <span class="info-title">照片数量：</span>{{ scope.row.photoNum }}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="index" label="修图师" min-width="140">
        <template slot-scope="scope">
          <div v-if="scope.row.retoucherOrgName" class="staff-info">
            <span>修图师：{{ scope.row.retoucherOrgRetouchName }}</span>
            <span>机构名称：{{ scope.row.retoucherOrgName }}</span>
          </div>
          <div v-else class="staff-info">
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
            <el-dropdown placement="bottom" :show-timeout="100" trigger="hover">
              <el-button size="mini" type="primary">
                操作<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item class="primary-color" @click.native="linkto(scope.row)">流水详情</el-dropdown-item>
                <el-dropdown-item
                  v-if="canUrgent(scope.row)"
                  class="danger-color"
                  @click.native="urgentStream(scope.row.id)"
                >
                  流水加急
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="canManualReview(scope.row)"
                  class="warning-color"
                  @click.native="manualReview(scope.row.id)"
                >
                  直接审核
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import * as AdminManage from '@/api/adminManage'
import { StreamStateEnum } from '@/utils/enumerate'
import { mapGetters } from 'vuex'

export default {
  name: 'WorkBoardTable',
  props: {
    tableData: { type: Array, required: true }, // 列表数据
    showChecker: { type: Boolean }, // 是够显示审核人
    urgentSearch: { type: Boolean } // 是否是加急查询
  },
  data () {
    return {
      routeName: this.$route.name // 路由名字
    }
  },
  computed: {
    ...mapGetters(['showUrgentStream'])
  },
  methods: {
    /**
     * @description 是够可以加急
     */
    canUrgent (item) {
      const urgentState = [StreamStateEnum.Reviewing, StreamStateEnum.Finish]
      return this.showUrgentStream && !item.staticsUrgent && !urgentState.includes(item.state)
    },
    /**
     * @description 是否可以直接审核
     */
    canManualReview (item) {
      const manualReviewState = [StreamStateEnum.WaitReview]
      // TODO 直接审核的权限
      return manualReviewState.includes(item.state)
    },
    /**
     * @description 加急流水
     */
    async urgentStream (streamId) {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const req = { streamId }
        const data = await AdminManage.urgentStream(req)
        if (data) {
          this.$newMessage.success('操作成功!')
          const type = this.urgentSearch ? 'urgent' : 'other'
          this.$emit('urgentSuccess', type)
        }
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    },
    /**
     * @description 跳转
     */
    linkto (item) {
      const streamId = item.id
      const workBoardStreamNum = item.stream_num
      if (item.state === 'finish') {
        this.$router.push({
          path: '/order-detail',
          query: { streamId }
        })
      } else {
        this.$router.push({
          path: '/order-detail',
          query: { workBoardStreamNum }
        })
      }
    },
    /**
     * @description 直接审核
     */
    manualReview (streamId) {
      this.$store.dispatch('setting/showLoading', this.routeName)
      const req = { streamId }
      AdminManage.manualReview(req)
        .then(() => {
          this.$newMessage.success('流水审核绑定成功。')
          this.$router.push({ path: '/audit-center' })
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.$store.dispatch('setting/hiddenLoading', this.routeName)
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

<style lang="less">
@import '~@/styles/variables.less';

.primary-color {
  color: @blue;
}

.danger-color {
  color: @red;

  &:hover {
    background-color: @bgRed !important;
    color: #ff1b5b !important;
  }
}

.warning-color {
  color: #f7a741;

  &:hover {
    background-color: @bgOrange !important;
    color: @orange !important;
  }
}
</style>
