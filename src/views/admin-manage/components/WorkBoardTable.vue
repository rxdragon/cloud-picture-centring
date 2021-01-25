<template>
  <div class="work-board-table">
    <el-table :data="tableData" style="width: 100%;">
      <el-table-column prop="index" label="位置" min-width="100px">
        <template slot-scope="{ row }">
          <div class="index-box">
            <span>{{ row.queue_index || '-' }}</span>
            <div class="icon-box">
              <el-tag v-if="row.staticsUrgent" type="danger" size="mini">急</el-tag>
              <el-tag v-if="row.isReturn" type="danger" size="mini">审核退回</el-tag>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="修图标准">
        <template slot-scope="{ row }">
          <div class="standard-box">
            {{ row.retouchType | toRetouchClass }}
            <div class="standard-icon">
              <div :class="`iconmap-standard-${row.retouchType}`" />
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="订单信息" min-width="240">
        <template slot-scope="{ row }">
          <div v-if="row.order" class="order-info">
            <span>
              <span class="info-title">订单号：</span>{{ row.order && row.order.external_num || '-' }}
            </span>
            <span>
              <span class="info-title">流水号：</span>{{ row.stream_num || '-' }}
            </span>
            <span v-if="canSeeInfo(row)">
              <span class="info-title">拍摄产品：</span>{{ row.product && row.product.name || '-' }}
            </span>
            <span v-if="canSeeInfo(row)">
              <span class="info-title">照片数量：</span>{{ row.photoNum }}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="修图师" min-width="140">
        <template slot-scope="{ row }">
          <div v-if="row.retoucherOrgName" class="staff-info">
            <span>修图师：{{ row.retoucherOrgRetouchName }}</span>
            <span>机构名称：{{ row.retoucherOrgName }}</span>
          </div>
          <div v-else class="staff-info">
            <span>修图师：{{ row.retoucherName }}</span>
            <span>组长：{{ row.retouchLeader }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column v-if="showChecker" prop="reviewerName" label="审核人" />
      <el-table-column prop="waitTime" label="等待时间" />
      <el-table-column prop="streamState" label="当前状态" />
      <el-table-column label="操作" width="160">
        <template slot-scope="{ row }">
          <div class="operation-box">
            <el-dropdown
              v-if="showDropdown(row)"
              placement="bottom"
              :show-timeout="100"
              trigger="hover"
            >
              <el-button size="mini" type="primary">操作<i class="el-icon-arrow-down el-icon--right" /></el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :disabled="!canSeeInfo(row)" class="primary-color" @click.native="linkto(row)">
                  流水详情
                </el-dropdown-item>
                <el-dropdown-item v-if="canUrgent(row)" class="danger-color" @click.native="urgentStream(row.id)">
                  流水加急
                </el-dropdown-item>
                <el-dropdown-item v-if="canManualReview(row)" class="warning-color" @click.native="manualReview(row.id)">
                  直接审核
                </el-dropdown-item>
                <el-dropdown-item  v-if="canReturnQueue(row)" @click.native="returnBackQueue(row.id)">
                  退回队列
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <el-button
              v-else
              size="mini"
              type="primary"
              :disabled="!canSeeInfo(row)"
              @click.native="linkto(row)"
            >
              流水详情
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import * as AdminManage from '@/api/adminManage'
import { STREAM_STATE } from '@/utils/enumerate'
import { mapGetters } from 'vuex'
import * as dayjs from 'dayjs'

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
    ...mapGetters(['showUrgentStream', 'roles', 'showWorkInfo'])
  },
  methods: {
    /**
     * @description 是否显示下拉框
     */
    showDropdown (item) {
      return this.canUrgent(item) || this.canManualReview(item)
    },
    canSeeInfo (item) {
      return this.showWorkInfo || item.state !== STREAM_STATE.WAIT_RETOUCH
    },
    /**
     * @description 是够可以加急
     */
    canUrgent (item) {
      const urgentState = [STREAM_STATE.REVIEWING, STREAM_STATE.FINISH]
      return this.showUrgentStream && !item.staticsUrgent && !urgentState.includes(item.state)
    },
    /**
     * @description 是否可以直接审核
     */
    canManualReview (item) {
      const isWaitReview = [STREAM_STATE.WAIT_REVIEW].includes(item.state)
      const hasManualReviewPermission = this.roles.includes('AdminManage.workBoard.manualReview')
      return isWaitReview && hasManualReviewPermission
    },
    /**
     * @description 是否可以退回队列
     */
    canReturnQueue (item) {
      const isMoreThen10 = item.photoNum >= 10
      if (!isMoreThen10) return false
      // 判断是否有权限
      const hasManualReviewPermission = this.roles.includes('AdminManage.workBoard.manualReview')
      if (!hasManualReviewPermission) return false

      // 判断是否在修图中
      const isRetouch = item.state === STREAM_STATE.RETOUCHING
      if (!isRetouch) return false

      // 判断时间是否处于 22点后 或者 8点前
      let startTime = dayjs().format('YYYY-MM-DD') + ' 22:00'
      startTime = dayjs(startTime).valueOf()

      let endTime = dayjs().format('YYYY-MM-DD') + ' 08:00'
      endTime = dayjs(endTime).valueOf()
      const nowTime = new Date().getTime()
      const canReturnQueueTime = nowTime >= startTime || nowTime <= endTime
      return canReturnQueueTime
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
    async manualReview (streamId) {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const req = { streamId }
        await AdminManage.manualReview(req)
        this.$newMessage.success('流水审核绑定成功。')
        this.$router.push({ path: '/audit-center' })
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 退回队列
     */
    async returnBackQueue (streamId) {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const req = { streamId }
        await AdminManage.returnBackQueue(req)
        this.$newMessage.success('退回队列成功!')
        const type = this.urgentSearch ? 'urgent' : 'other'
        this.$emit('urgentSuccess', type)
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
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
    color: #ff1b5b !important;
    background-color: @bgRed !important;
  }
}

.warning-color {
  color: #f7a741;

  &:hover {
    color: @orange !important;
    background-color: @bgOrange !important;
  }
}
</style>
