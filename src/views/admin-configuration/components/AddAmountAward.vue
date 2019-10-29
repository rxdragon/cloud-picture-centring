<template>
  <div class="add-amount-award">
    <div class="header">
      <h3>新增冲量奖励</h3>
    </div>
    <div class="award-title search-item">
      <span>冲量标题</span>
      <el-input v-model.trim="awardTitle" placeholder="请输入冲量标题" />
    </div>
    <div class="award-title search-item">
      <span>外包机构</span>
      <institution-select v-model="institutionId" multiple />
    </div>
    <div class="search-item">
      <span>配置伙伴</span>
      <staff-panel
        :default-checked-keys="defaultCheckedKeys"
        :to-data.sync="toData"
      />
    </div>
    <div class="experience-box search-item">
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
    <div class="search-item valid-time">
      <span>有效日期</span>
      <date-picker v-model="timeSpan" value-format="yyyy-MM-dd HH:mm:ss" future type="datetimerange" />
    </div>
    <div class="sure-button">
      <el-button type="info" @click="goBack">返回</el-button>
      <el-button type="primary" @click="onAddNewConfig">确认</el-button>
    </div>
    <!-- 弹框 -->
    <el-dialog
      title="新增冲量奖励"
      center
      :visible.sync="dialogVisible"
      width="30%"
    >
      <div class="content-box">
        <el-form ref="addAwardConfig" :model="addAwardConfig" status-icon :rules="rules" label-position="left" label-width="120px">
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
import DatePicker from '@/components/DatePicker'
import InstitutionSelect from '@SelectBox/InstitutionSelect'
import * as Util from '@/utils/validate'

import * as OperationManage from '@/api/operationManage.js'
export default {
  name: 'AddAmountAward',
  components: { StaffPanel, DatePicker, InstitutionSelect },
  data () {
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
    return {
      defaultCheckedKeys: [],
      toData: [],
      rules: {
        reachExp: [
          { validator: checkTwoDecimals, required: true, trigger: 'change' }
        ],
        reward: [
          { validator: checkTwoDecimals, required: true, trigger: 'change' }
        ]
      },
      awardTitle: '',
      checkList: [],
      awardList: [],
      institutionId: [],
      dialogVisible: false,
      addAwardConfig: {
        reachExp: '',
        reward: ''
      },
      timeSpan: null
    }
  },
  created () {
    this.getImpulseSettingItemList()
  },
  methods: {
    /**
     * @description 返回上一级
     */
    goBack () {
      this.$emit('update:isAddConfig', false)
    },
    /**
     * @description 获取冲量配置项列表
     */
    async getImpulseSettingItemList () {
      this.awardList = await OperationManage.getImpulseSettingItemList()
    },
    /**
     * @description 删除冲量奖励配置项
     */
    async deleteAward (id) {
      try {
        const req = { itemId: id }
        this.$store.dispatch('setting/showLoading', this.$route.name)
        await OperationManage.delImpulseSettingItem(req)
        this.$newMessage.success('删除成功')
        await this.getImpulseSettingItemList()
        this.$store.dispatch('setting/hiddenLoading', this.$route.name)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.$route.name)
        throw new Error(error)
      }
    },
    /**
     * @description 新增冲量奖励配置项
     */
    addAwardItem () {
      this.dialogVisible = true
    },
    /**
     * @description 提交配置
     */
    onSumbit () {
      this.$refs['addAwardConfig'].validate((valid) => {
        if (valid) {
          const reqData = this.addAwardConfig
          this.$store.dispatch('setting/showLoading', this.$route.name)
          OperationManage.addImpulseSettingItem(reqData)
            .then(() => {
              this.$newMessage.success('添加成功')
              this.addAwardConfig.reachExp = ''
              this.addAwardConfig.reward = ''
              this.dialogVisible = false
              this.getImpulseSettingItemList()
            }).finally(() => {
              this.$store.dispatch('setting/hiddenLoading', this.$route.name)
            })
        } else {
          return false
        }
      })
    },
    /**
     * @description 新增冲量配置
     */
    onAddNewConfig () {
      if (!this.timeSpan) {
        return this.$newMessage.warning('请输入时间')
      }
      if (this.timeSpan[0] === this.timeSpan[1]) {
        return this.$newMessage.warning('请输入有效时间范围')
      }
      if (!this.toData.length && !this.institutionId.length) {
        return this.$newMessage.warning('请选择配置伙伴或者修图机构')
      }
      if (!this.checkList.length) {
        return this.$newMessage.warning('请选择配置选项')
      }
      if (!this.awardTitle) {
        return this.$newMessage.warning('请输入冲量奖名称')
      }
      const reqData = {
        title: this.awardTitle,
        settingItemIds: this.checkList,
        startAt: this.timeSpan[0],
        endAt: this.timeSpan[1]
      }
      if (this.toData.length) {
        reqData.staffIds = []
        this.toData.forEach(groupItem => {
          groupItem.children.forEach(staffItem => {
            reqData.staffIds.push(staffItem.id)
          })
        })
      }
      if (this.institutionId) { reqData.retoucherOrgIds = this.institutionId }
      this.$store.dispatch('setting/showLoading', this.$route.name)
      OperationManage.addImpulse(reqData)
        .then(() => {
          this.$newMessage({
            message: '添加经验配置成功',
            type: 'success',
            duration: 1500,
            onClose: () => {
              this.goBack()
            }
          })
        })
    }
  }
}
</script>

<style lang="less">
@import "~@/styles/variables.less";
.add-amount-award {
  .search-item {
    margin-bottom: 24px;
    display: flex;
    width: 880px;
    align-items: flex-start;

    .el-input {
      width: 319px;
    }

    &>span {
      width: 70px;
    }
  }

  .award-title {
    align-items: center;
  }

  .valid-time {
    align-items: center;

    .date-picker {
      width: 500px;
    }
  }

  .sure-button {
    width: 880px;
    text-align: center;
  }

  .award-money {
    width: 319px;

    .el-checkbox-group {
      display: grid;

      .check-box {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;

        button {
          color: @red;
          padding: 0;
        }
      }
    }
  }

  .el-checkbox__label {
    &>span {
      display: inline-block;
      width: 173px;
    }
  }

  .date-picker .el-range-editor.el-input__inner {
    width: 400px;
  }
}
</style>
