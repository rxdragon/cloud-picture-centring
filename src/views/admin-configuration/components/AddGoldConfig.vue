<template>
  <div class="add-gold-config">
    <div class="header">
      <h3>编辑金币配置</h3>
    </div>
    <div class="module-panel">
      <div class="search-item">
        <span>配置伙伴</span>
        <staff-panel
          :default-checked-keys="defaultCheckedKeys"
          :to-data.sync="toData"
        />
      </div>
      <div class="search-item gold-box">
        <span>金币卡</span>
        <el-select v-model="goldValue" placeholder="请选择金币卡">
          <el-option label="1.2倍" :value="1.2" />
          <el-option label="1.5倍" :value="1.5" />
        </el-select>
      </div>
      <div class="sure-button">
        <el-button type="primary" plain @click="goBack">返回</el-button>
        <el-button type="primary" @click="onSubmit">确认</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import StaffPanel from '@/components/StaffPanel'

import * as OperationManage from '@/api/operationManage.js'

export default {
  name: 'AddGoldConfig',
  components: { StaffPanel },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      toData: [], // 伙伴信息
      defaultCheckedKeys: [], // 默认选中伙伴
      goldValue: ''// 配置信息
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
    }
  }
}
</script>

<style lang="less">
.add-gold-config {
  .search-item {
    margin-bottom: 24px;
    align-items: flex-start;

    &>span {
      width: 80px;
    }
  }

  .gold-box {
    align-items: center;

    .el-select {
      width: 319px;
    }
  }

  .sure-button {
    width: 880px;
    text-align: left;
    padding-left: 92px;
  }
}
</style>
