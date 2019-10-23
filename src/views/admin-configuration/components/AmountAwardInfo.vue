<template>
  <div class="amount-award-info">
    <div class="header">
      <h3>冲量详情</h3>
    </div>
    <div class="module-panel">
      <div class="info-box info-title">
        <span>冲量标题：</span>
        <p>{{ title }}</p>
      </div>
      <div class="info-box info-staff">
        <span>配置伙伴：</span>
        <staff-info :staff-list="staffList" />
      </div>
      <div class="info-box info-title">
        <span>冲量奖励：</span>
        <div class="award-list">
          <p v-for="(awardItem, awardIndex) in awardList" :key="awardIndex">
            当日海草值达到{{ awardItem.reach_exp }} 额外奖励¥{{ awardItem.reward }}
          </p>
        </div>
      </div>
      <div class="info-box info-title">
        <span>有效日期：</span>
        <p>{{ startTime }} ~ {{ endTime }}</p>
      </div>
      <div class="button-box">
        <el-button type="info" @click="goBack">返 回</el-button>
      </div>
    </div>

  </div>
</template>

<script>
import StaffInfo from '@/components/StaffInfo'

import * as OperationManage from '@/api/operationManage.js'
export default {
  name: 'AmountAwardInfo',
  components: { StaffInfo },
  props: {
    editId: { type: [String, Number], default: '' }
  },
  data () {
    return {
      title: '',
      awardList: [],
      staffList: [],
      startTime: '',
      endTime: ''
    }
  },
  created () {
    if (this.editId) { this.getImpulseInfo() }
  },
  methods: {
    /**
     * @description 返回上一级
     */
    goBack () {
      this.$emit('update:showAmountInfo', false)
    },
    /**
     * @description 获取冲量奖励详情
     */
    async getImpulseInfo () {
      const reqData = { impulseId: this.editId }
      this.$store.dispatch('setting/showLoading')
      const data = await OperationManage.getImpulseInfo(reqData)
      this.title = data.title
      this.awardList = data.impulse_setting_item
      this.startTime = data.start_at
      this.endTime = data.end_at
      const staff = data.staff
      this.staffList = []
      staff.forEach(staffItem => {
        const findGroup = this.staffList.find(item => item.lable === staffItem.retouch_group)
        const createData = { label: staffItem.name }
        if (findGroup) {
          findGroup.children = [...findGroup.children, createData]
        } else {
          this.staffList.push({
            label: staffItem.retouch_group.name,
            children: [createData]
          })
        }
      })
      this.$store.dispatch('setting/hiddenLoading')
    }
  }
}
</script>

<style lang="less">
.amount-award-info {
  .info-box {
    display: flex;
    margin-bottom: 20px;
    font-size:14px;
    font-weight:400;
    color:rgba(48,49,51,1);
    line-height:22px;

    &>span {
      width: 100px;
    }
  }

  .button-box {
    text-align: center;
  }
}
</style>
