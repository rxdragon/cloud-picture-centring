<template>
  <div class="ShiftSupervisorManagement">
    <div class="header">
      <h3>值班主管配置</h3>
    </div>
    <div class="module-panel">
      <el-form ref="form" :model="submitData" :rules="rules" label-width="50px" label-position="right">
        <el-form-item v-for="(item, key) in submitData" :key="key" :label="key | filterWeek" :prop="key">
          <supervisor-on-duty-select v-model="submitData[key]" clearable multiple />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">提交配置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import SupervisorOnDutySelect from '@SelectBox/SupervisorOnDutySelect'
import * as SupervisorOnDuty from '@/api/supervisorOnDuty'

export default {
  name: 'ShiftSupervisorManagement',
  components: { SupervisorOnDutySelect },
  filters: {
    filterWeek (week) {
      const weekName = {
        monday: '周一',
        tuesday: '周二',
        wednesday: '周三',
        thursday: '周四',
        friday: '周五',
        saturday: '周六',
        sunday: '周日'
      }
      return weekName[week]
    }
  },
  data () {
    const enumWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const rules = {}
    enumWeek.forEach(key => {
      rules[key] = [{ type: 'array', message: '请选择值班主管', required: true, trigger: 'change' }]
    })
    return {
      routeName: this.$route.name, // 路由名字
      submitData: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      },
      rules
    }
  },
  created () {
    this.getSupervisorOnDuty()
  },
  methods: {
    /**
     * @description 提交修改接口
     */
    onSubmit () {
      this.$refs['form'].validate(async valid => {
        console.log(valid, 'valid')
        if (valid) {
          const supervisorOnDutyData = []
          for (const key in this.submitData) {
            const weekItem = this.submitData[key]
            const supervisorInfo = weekItem.map(item => {
              const itemArr = item.split(',')
              return {
                id: Number(itemArr[0]),
                name: itemArr[1]
              }
            })
            supervisorOnDutyData.push({
              dayOfWeek: key,
              supervisorInfo
            })
          }
          console.log(supervisorOnDutyData)
          const req = { supervisorOnDutyData }
          try {
            this.$store.dispatch('setting/showLoading', this.routeName)
            await SupervisorOnDuty.setSupervisorOnDuty(req)
            this.$newMessage.success('修改成功')
            this.$store.dispatch('setting/hiddenLoading', this.routeName)
          } catch (error) {
            this.$store.dispatch('setting/hiddenLoading', this.routeName)
            console.error(error)
          }
        } else {
          this.$newMessage.warning('请选择值班主管')
          return false
        }
      })
    },
    /**
     * @description 获取值班数据列表
     */
    getSupervisorOnDuty () {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = SupervisorOnDuty.getSupervisorOnDuty()
        console.log(data)
        // for (const key in this.submitData) { this.$set(this.submitData, key, data[key]) }
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.ShiftSupervisorManagement {
  .supervisor-onDuty-select {
    width: 390px;
  }
}
</style>
