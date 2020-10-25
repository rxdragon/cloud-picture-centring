<template>
  <div class="amount-award-info">
    <div class="header">
      <h3>详情</h3>
    </div>
    <div class="module-panel">
      <div class="info-box info-title">
        <span>标题：</span>
        <p>{{ title }}</p>
      </div>
      <div v-if="staffList.length" class="info-box info-staff">
        <span>伙伴：</span>
        <staff-info :staff-list="staffList" />
      </div>
      <div class="info-box info-title">
        <span>奖励类型：</span>
        <p>{{ typeStr }}</p>
      </div>
      <div v-if="type === TIME_REWARD_TYPE.IMPULSE" class="info-box info-title">
        <span>冲量奖励：</span>
        <div class="award-list">
          <p v-for="(awardItem, awardIndex) in awardList" :key="awardIndex">
            当日海草值达到{{ awardItem.reach_exp }} 额外奖励¥{{ awardItem.reward }}
          </p>
        </div>
      </div>
      <div v-if="type === TIME_REWARD_TYPE.EXP_POWER" class="info-box info-title">
        <span>经验倍数：</span>
        <p>{{ rewardValue }}倍</p>
      </div>
      <div v-if="type === TIME_REWARD_TYPE.GOLD" class="info-box info-title">
        <span>金币倍数：</span>
        <p>{{ rewardValue }}倍</p>
      </div>
      <div class="info-box info-title">
        <span>有效日期：</span>
        <p>{{ rangeAt }}</p>
      </div>
      <div class="button-box">
        <el-button type="primary" plain @click="goBack">返 回</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import StaffInfo from '@/components/StaffInfo'

import { TIME_REWARD_TYPE } from '@/utils/enumerate.js'

import * as SessionTool from '@/utils/sessionTool.js'
import * as OperationManage from '@/api/operationManage.js'
export default {
  name: 'TimeAwardInfo',
  components: { StaffInfo },
  props: {
    configId: { type: [String, Number], default: '' }
  },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      title: '', // 冲量奖标题
      type: '',
      typeStr: '', // 奖励类型中文
      rewardValue: '',
      TIME_REWARD_TYPE,
      rangeAt: '',
      awardList: [], // 冲量配置列表
      staffList: [] // 伙伴列表
    }
  },
  created () {
    if (this.configId) {
      this.getImpulseInfo()
    }
  },
  methods: {
    /**
     * @description 返回上一级
     */
    goBack () {
      this.$emit('update:showTimeAwardInfo', false)
    },
    /**
     * @description 获取冲量奖励详情
     */
    async getImpulseInfo () {
      try {
        const reqData = { id: this.configId }
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await OperationManage.getTimeIntervalRewardConfigDetail(reqData)
        this.title = data.title
        this.type = data.type
        this.typeStr = data.typeStr
        this.rangeAt = data.rangeAt
        this.rewardValue = data.rewardValue
        // 处理staffid
        const staffArr = SessionTool.getStaffList()
        const staffObj = staffArr.reduce((sumObj, staff) => {
          sumObj[staff.id] = staff
          return sumObj
        }, {})

        data.staffs.forEach(staffItem => {
          const findGroup = this.staffList.find(item => item.label === staffObj[staffItem.id].department.name)
          const createData = { label: staffObj[staffItem.id].nickname }
          if (findGroup) {
            findGroup.children = [...findGroup.children, createData]
          } else {
            this.staffList.push({
              label: staffObj[staffItem.id].department.name,
              children: [createData]
            })
          }
        })
        this.awardList = data.impulseSettingItems

        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    }
  }
}
</script>

<style lang="less">
.amount-award-info {
  .info-box {
    display: flex;
    margin-bottom: 20px;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
    color: rgba(48, 49, 51, 1);

    & > span {
      width: 100px;
    }
  }

  .button-box {
    padding-left: 100px;
    text-align: left;
  }
}
</style>
