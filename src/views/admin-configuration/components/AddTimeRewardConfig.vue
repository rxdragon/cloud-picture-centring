<template>
  <div class="add-gold-config">
    <div class="header">
      <h3>新增</h3>
    </div>
    <div class="module-panel">
      <div class="search-item title">
        <span>标题</span>
        <el-input v-model.trim="rewardInfo.title" maxlength="15" placeholder="请输入时段奖励标题,最多15个字符" />
      </div>
      <div class="search-item">
        <span>配置伙伴</span>
        <staff-panel :to-data.sync="toData"/>
      </div>
      <div class="search-item">
        <span>奖励类型</span>
        <time-reward-type-select v-model="rewardInfo.rewardType" />
      </div>
      <div
        class="search-item"
        v-if="rewardInfo.rewardType === TIME_REWARD_TYPE.EXP_POWER"
      >
        <span>经验倍数</span>
        <time-reward-exp-select v-model="rewardInfo.expNum" />
      </div>
      <div
        class="search-item"
        v-if="rewardInfo.rewardType === TIME_REWARD_TYPE.GOLD"
      >
        <span>金币卡</span>
        <time-reward-gold-select v-model="rewardInfo.goldNum" />
      </div>
      <div
        class="search-item"
        v-if="rewardInfo.rewardType === TIME_REWARD_TYPE.IMPULSE"
      >
        <span>冲量奖励</span>
        <div class="award-money">
          <el-checkbox-group v-model="checkList">
            <div v-for="(awardItem, awardIndex) in awardList" :key="awardIndex" class="check-box">
              <el-checkbox :label="awardItem.id">
                <span>当日海草值达到{{ awardItem.reach_exp }}</span>
                <span>额外奖励¥{{ awardItem.reward }}</span>
              </el-checkbox>
              <el-button type="text" @click="deleteAward(awardItem.id)">删除</el-button>
            </div>
            <el-button type="primary" @click="addAwardItem">新增冲量奖励</el-button>
          </el-checkbox-group>
        </div>
      </div>
      <div class="search-item">
        <span>生效时段</span>
        <time-picker v-model="rewardInfo.timeSpan" value-format="HH:mm:ss" />
      </div>
      <div class="sure-button">
        <el-button type="primary" plain @click="goBack">返回</el-button>
        <el-button type="primary" @click="onSubmit">确认</el-button>
      </div>
    </div>
    <!-- 弹框 -->
    <el-dialog
      title="新增冲量奖励"
      center
      :visible.sync="dialogVisible"
      width="30%"
    >
      <div class="content-box">
        <el-form
          ref="addAwardConfig"
          :model="addAwardConfig"
          status-icon
          :rules="rules"
          label-position="left"
          label-width="120px"
        >
          <el-form-item prop="reachExp" label="当前达到海草：">
            <el-input v-model="addAwardConfig.reachExp" placeholder="请输入达到海草数，最多2位小数" />
          </el-form-item>
          <el-form-item prop="reward" label="奖励：">
            <el-input v-model="addAwardConfig.reward" placeholder="请输入奖励金额数值，最多2位小数" />
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addImpulseConfig">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import StaffPanel from '@/components/StaffPanel'
import TimeRewardTypeSelect from '@SelectBox/TimeRewardTypeSelect'
import TimeRewardExpSelect from '@SelectBox/TimeRewardExpSelect'
import TimeRewardGoldSelect from '@SelectBox/TimeRewardGoldSelect'
import TimePicker from '@/components/TimePicker'

import { TIME_REWARD_TYPE } from '@/utils/enumerate.js'

import * as Util from '@/utils/validate'
import * as OperationManage from '@/api/operationManage.js'

const checkTwoDecimals = (rule, value, callback) => {
  if (!value) return callback(new Error('填写内容不能为空'))
  setTimeout(() => {
    if (!Util.isTwoDecimals(value)) {
      callback(new Error('请输入两位小数数字值'))
    } else {
      if (Number(value) <= 0) {
        callback(new Error('请输入正数'))
      } else {
        callback()
      }
    }
  }, 500)
}

export default {
  name: 'AddTimeRewardConfig',
  components: { StaffPanel, TimeRewardTypeSelect, TimeRewardExpSelect, TimeRewardGoldSelect, TimePicker },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      toData: [], // 伙伴信息

      rewardInfo: {
        title: '',
        rewardType: TIME_REWARD_TYPE.IMPULSE,
        expNum: '',
        goldNum: '',
        timeSpan: ''
      },
      checkList: [],
      awardList: [], // 冲量列表
      addAwardConfig: {
        reachExp: '',
        reward: ''
      },
      dialogVisible: false,
      rules: {
        reachExp: [
          { validator: checkTwoDecimals, required: true, trigger: 'change' }
        ],
        reward: [
          { validator: checkTwoDecimals, required: true, trigger: 'change' }
        ]
      },
      TIME_REWARD_TYPE
    }
  },
  created () {
    if (this.rewardInfo.rewardType === TIME_REWARD_TYPE.IMPULSE) {
      this.getImpulseSettingItemList()
    }
  },
  methods: {
    /**
     * @description 获取冲量配置项列表
     */
    async getImpulseSettingItemList () {
      this.awardList = await OperationManage.getImpulseSettingItemList({ type: 'time_interval' })
    },
    /**
     * @description 提交检测
     */
    submitCheck () {
      const { title, rewardType, expNum, goldNum, timeSpan } = this.rewardInfo
      if (!title) {
        this.$newMessage.warning('请输入标题')
        return false
      }
      if (!rewardType) {
        this.$newMessage.warning('请选择奖励类型')
        return false
      }
      if (timeSpan.length < 2) {
        this.$newMessage.warning('请选择生效时段')
        return false
      }
      const hasStaff = this.toData.some(item => {
        return item.children.length
      })
      if (!hasStaff) {
        this.$newMessage.warning('请配置伙伴')
        return false
      }
      let warnText = ''
      switch (rewardType) {
        case TIME_REWARD_TYPE.EXP_POWER:
          if (!expNum) warnText = '请选择经验倍数'
          break
        case TIME_REWARD_TYPE.GOLD:
          if (!goldNum) warnText = '请选择金币倍数'
          break
        case TIME_REWARD_TYPE.IMPULSE:
          if (!this.checkList.length) warnText = '请选择至少一个冲量奖励'
          break
        default:
      }
      if (warnText) {
        this.$newMessage.warning(warnText)
        return false
      }
      return true
    },
    /**
     * @description 提交
     */
    async onSubmit () {
      if (!this.submitCheck()) return
      const { title, rewardType, expNum, goldNum, timeSpan } = this.rewardInfo
      const reqData = {
        title,
        type: rewardType,
        beginAt: timeSpan[0],
        endAt: timeSpan[1]
      }
      switch (rewardType) {
        case TIME_REWARD_TYPE.EXP_POWER:
          reqData.exp = expNum
          break
        case TIME_REWARD_TYPE.GOLD:
          reqData.gold = goldNum
          break
        case TIME_REWARD_TYPE.IMPULSE:
          reqData.settingItemIds = this.checkList
          break
        default:
      }
      reqData.staffIds = []
      this.toData.forEach(groupItem => {
        groupItem.children.forEach(staffItem => {
          reqData.staffIds.push(staffItem.id)
        })
      })
      this.$store.dispatch('setting/showLoading', this.routeName)
      try {
        await OperationManage.addTimeIntervalRewardConfig(reqData)
        this.$newMessage({
          message: '时段奖励配置成功',
          type: 'success',
          duration: 1500,
          onClose: () => {
            this.goBack()
          }
        })
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    },
    /**
     * @description 返回上一级
     */
    goBack () {
      this.$emit('update:isAddConfig', false)
    },
    /**
     * @description 删除冲量奖励配置项
     */
    async deleteAward (id) {
      try {
        const req = { itemId: id }
        this.$store.dispatch('setting/showLoading', this.routeName)
        await OperationManage.delImpulseSettingItem(req)
        this.$newMessage.success('删除成功')
        await this.getImpulseSettingItemList()
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    },
    /**
     * @description 新增冲量奖励配置项
     */
    addAwardItem () {
      this.dialogVisible = true
    },
    /**
     * @description 提交冲量配置
     */
    addImpulseConfig () {
      this.$refs['addAwardConfig'].validate((valid) => {
        if (valid) {
          const reqData = this.addAwardConfig
          reqData.type = 'time_interval'
          this.$store.dispatch('setting/showLoading', this.routeName)
          OperationManage.addImpulseSettingItem(reqData)
            .then(() => {
              this.$newMessage.success('添加成功')
              this.addAwardConfig.reachExp = ''
              this.addAwardConfig.reward = ''
              this.dialogVisible = false
              this.getImpulseSettingItemList()
            }).finally(() => {
              this.$store.dispatch('setting/hiddenLoading', this.routeName)
            })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style lang="less">
.add-gold-config {
  .search-item {
    align-items: flex-start;
    margin-bottom: 24px;

    &.title {
      .el-input {
        width: 319px;
      }
    }

    & > span {
      width: 80px;
    }
  }

  .sure-button {
    width: 880px;
    padding-left: 92px;
    text-align: left;
  }
}
</style>
