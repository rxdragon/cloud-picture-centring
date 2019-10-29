<template>
  <div class="edit-experience-config">
    <div class="header">
      <h3>编辑经验配置</h3>
    </div>
    <div class="module-panel">
      <div class="search-item">
        <span>配置伙伴</span>
        <staff-panel
          :default-checked-keys="defaultCheckedKeys"
          :to-data.sync="toData"
        />
      </div>
      <div class="experience-box search-item">
        <span>经验倍数</span>
        <el-select v-model="experienceValue" placeholder="请选择经验倍数">
          <el-option label="1.5倍" :value="1.5" />
          <el-option label="2倍" :value="2" />
        </el-select>
      </div>
      <div class="sure-button">
        <el-button type="info" @click="goBack">返回</el-button>
        <el-button type="primary" @click="onSubmit">确认</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import StaffPanel from '@/components/StaffPanel'

import * as OperationManage from '@/api/operationManage.js'

export default {
  name: 'EditExperienceConfig',
  components: {
    StaffPanel
  },
  data () {
    return {
      toData: [], // 伙伴信息
      defaultCheckedKeys: [], // 默认选中伙伴
      experienceValue: '' // 配置信息
    }
  },
  methods: {
    /**
     * @description 提交新建配置
     */
    async onSubmit () {
      const reqData = {
        type: 'exp',
        multiple: this.experienceValue
      }
      reqData.staffIds = []
      this.toData.forEach(groupItem => {
        groupItem.children.forEach(staffItem => {
          reqData.staffIds.push(staffItem.id)
        })
      })
      if (!this.experienceValue) {
        this.$newMessage.warning('请选择经验倍数')
        return false
      }
      if (!reqData.staffIds.length) {
        this.$newMessage.warning('请选择组员')
        return false
      }
      this.$store.dispatch('setting/showLoading', this.$route.name)
      try {
        await OperationManage.addCard(reqData)
        this.$newMessage({
          message: '添加经验配置成功',
          type: 'success',
          duration: 1500,
          onClose: () => {
            this.goBack()
          }
        })
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.$route.name)
      }
    },
    /**
     * @description 返回上一级
     */
    goBack () {
      this.$emit('update:isAddConfig', false)
    }

  }
}
</script>

<style lang="less">
.edit-experience-config {
  .search-item {
    margin-bottom: 24px;
    align-items: flex-start;

    &>span {
      width: 80px;
      display: inline-block;
    }
  }

  .experience-box {
    align-items: center;

    .el-select {
      width: 319px;
    }
  }

  .sure-button {
    width: 880px;
    text-align: center;
  }
}
</style>
