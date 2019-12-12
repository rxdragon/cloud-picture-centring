<template>
  <div class="ShiftSupervisorManagement">
    <div class="header">
      <h3>值班主管配置</h3>
    </div>
    <div class="module-panel">
      <el-form ref="form" :model="submitData" label-width="80px">
        <el-form-item v-for="i in 7" :key="i + 'asd'" label="周一">
          <el-select v-model="submitData.value" multiple placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">提交配置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShiftSupervisorManagement',
  data () {
    return {
      options: [{
        value: '选项1',
        label: '黄金糕'
      }, {
        value: '选项2',
        label: '双皮奶'
      }, {
        value: '选项3',
        label: '蚵仔煎'
      }, {
        value: '选项4',
        label: '龙须面'
      }, {
        value: '选项5',
        label: '北京烤鸭'
      }],
      submitData: {
        value: []
      }
    }
  },
  methods: {
    onSubmit () {
    }
  }
}
</script>

<style lang="less" scoped>
.ShiftSupervisorManagement {
  .el-select {
    width: 360px;
  }
}
</style>
