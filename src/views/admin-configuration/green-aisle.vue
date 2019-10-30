<template>
  <div class="green-aisle">
    <div class="header">
      <h3>绿色免审通道</h3>
    </div>
    <div class="module-panel">
      <div class="staff-config search-item">
        <span>配置伙伴</span>
        <staff-panel
          ref="staffPanel"
          :default-checked-keys="defaultCheckedKeys"
          :is-loading-down.sync="isLoadingDown"
          :to-data.sync="toData"
        />
      </div>
      <div class="button-box">
        <el-button type="primary" @click="saveGreenChannelInfo">确定</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import StaffPanel from '@/components/StaffPanel'

import * as OperationManage from '@/api/operationManage.js'

export default {
  name: 'GreenAisle',
  components: { StaffPanel },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      defaultCheckedKeys: [],
      toData: [],
      isLoadingDown: false
    }
  },
  watch: {
    isLoadingDown (value) {
      if (value) { this.getGreenChannelInfo() }
    }
  },
  methods: {
    /**
     * @description 获取绿色通道人员
     */
    async getGreenChannelInfo () {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await OperationManage.getGreenChannelInfo()
        this.defaultCheckedKeys = JSON.parse(JSON.stringify(data))
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        throw new Error(error)
      }
    },
    /**
     * @description 更新绿色通道
     */
    async saveGreenChannelInfo () {
      try {
        const reqData = {}
        reqData.staffIds = []
        this.toData.forEach(groupItem => {
          groupItem.children.forEach(staffItem => {
            reqData.staffIds.push(staffItem.id)
          })
        })
        this.$store.dispatch('setting/showLoading', this.routeName)
        await OperationManage.saveGreenChannelInfo(reqData)
        this.$newMessage.success('绿色通道已更新')
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        throw new Error(error)
      }
    }
  }
}
</script>

<style lang="less">
.green-aisle {
  .search-item {
    align-items: flex-start;
  }

  .button-box {
    text-align: center;
    margin: 20px;
    width: 900px;
  }
}
</style>
