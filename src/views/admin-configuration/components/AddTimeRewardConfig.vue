<template>
  <div class="add-gold-config">
    <div class="header">
      <h3>新增</h3>
    </div>
    <div class="module-panel">
      <div class="search-item">
        <span>配置伙伴</span>
        <staff-panel :default-checked-keys="defaultCheckedKeys" :to-data.sync="toData"/>
      </div>
      <div class="search-item">
        <span>奖励类型</span>
        <reward-state-select v-model="rewardInfo.rewardType" />
      </div>
      <div class="search-item">
        <span>经验倍数</span>
        <time-reward-exp-select v-model="rewardInfo.expNum" />
      </div>
      <div class="search-item">
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
        <span>有效日期</span>
        <date-picker
          v-model="rewardInfo.timeSpan"
          value-format="yyyy-MM-dd HH:mm:ss"
          future
          type="datetimerange"
        />
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
        <el-button type="primary" @click="onSumbit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import StaffPanel from '@/components/StaffPanel'
import RewardStateSelect from '@SelectBox/RewardStateSelect'
import TimeRewardExpSelect from '@SelectBox/TimeRewardExpSelect'
import DatePicker from '@/components/DatePicker'

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
  components: { StaffPanel, RewardStateSelect, TimeRewardExpSelect, DatePicker },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      toData: [], // 伙伴信息
      defaultCheckedKeys: [], // 默认选中伙伴
      goldValue: '',// 配置信息

      rewardInfo: {
        rewardType: 0,
        expNum: '',
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
    }
  },
  methods: {
    /**
     * @description 监听添加按钮
     */
    async onSubmit () {
      const reqData = {
        type: 'gold_reward',
        multiple: this.goldValue
      }
      reqData.staffIds = []
      this.toData.forEach(groupItem => {
        groupItem.children.forEach(staffItem => {
          reqData.staffIds.push(staffItem.id)
        })
      })
      if (!this.goldValue) {
        this.$newMessage.warning('请选择金币倍数')
        return false
      }
      if (!reqData.staffIds.length) {
        this.$newMessage.warning('请选择组员')
        return false
      }
      this.$store.dispatch('setting/showLoading', this.routeName)
      try {
        await OperationManage.addCard(reqData)
        this.$newMessage({
          message: '添加金币配置成功',
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
    onSumbit () {
      this.$refs['addAwardConfig'].validate((valid) => {
        if (valid) {
          const reqData = this.addAwardConfig
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
