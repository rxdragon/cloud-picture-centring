<template>
  <div class="add-work-load">
    <el-alert title="请为修图组不同工龄伙伴配置建议工作量，更改完工作量隔日早上8点生效" type="info" show-icon />
    <div class="groud-box search-item">
      <span>修图组</span>
      <el-select v-model="groupId" placeholder="请选择">
        <el-option label="全部修图组" :value="0" />
        <el-option
          v-for="(item, index) in retoucherGroup"
          :key="index"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>
    <el-form ref="staffWork" :model="staffWork" label-position="left" label-width="150px">
      <el-form-item v-for="(staffItem, staffIndex) in staffWork" :key="staffIndex" :label="staffIndex | filterName">
        <el-input v-model="staffWork[staffIndex]" v-numberOnly />
        张/日
      </el-form-item>
    </el-form>
    <div class="button-box">
      <el-button type="primary" plain @click="goBack">返回</el-button>
      <el-button type="primary" @click="saveSuggestWorkload">提交</el-button>
    </div>
  </div>
</template>

<script>
import * as WorkManage from '@/api/workManage.js'
import * as Staff from '@/api/staff'

export default {
  name: 'AddWorkLoad',
  filters: {
    filterName (value) {
      switch (value) {
        case 'staffOneMonth':
          return '0～1个月伙伴'
        case 'staffOneToThreeMonth':
          return '1~3个月伙伴'
        case 'staffThreeToFourMonth':
          return '3~4个月伙伴'
        case 'staffFourToSixMonth':
          return '4~6个月伙伴'
        case 'staffSixToNineMonth':
          return '6～9个月伙伴'
        case 'staffNineToTwelveMonth':
          return '9～12个月伙伴'
        case 'staffOverTwelveMonth':
          return '12个月以上伙伴'
        default:
          return '转换错误'
      }
    }
  },
  data () {
    return {
      groupId: 0,
      staffWork: {
        staffOneMonth: '',
        staffOneToThreeMonth: '',
        staffThreeToFourMonth: '',
        staffFourToSixMonth: '',
        staffSixToNineMonth: '',
        staffNineToTwelveMonth: '',
        staffOverTwelveMonth: ''
      },
      retoucherGroup: []

    }
  },
  created () {
    this.getRetoucherGroup()
  },
  methods: {
    /**
     * @description 返回
     */
    goBack () {
      this.$emit('update:isAddShow', false)
    },
    /**
     * @description 整理参数
     */
    getParams () {
      const req = {}
      for (const [key, val] of Object.entries(this.staffWork)) {
        if (val) {
          req[key] = +val
        }
      }
      if (!Object.keys(req).length) {
        this.$newMessage.warning('请填写建议工作量')
        return false
      }
      if (this.groupId) { req.retouchClassId = this.groupId }
      return req
    },
    /**
     * @description 提交
     */
    saveSuggestWorkload () {
      const req = this.getParams()
      if (!req) return
      WorkManage.getSuggestWorkload(req).then(data => {
        if (data) {
          this.$newMessage.success('保存成功!')
          this.goBack()
        }
      })
    },
    /**
     * @description 获取修图组
     */
    getRetoucherGroup () {
      Staff.getRetoucherGroup().then(data => {
        this.retoucherGroup = data
      })
    }
  }
}
</script>

<style lang="less">
.add-work-load {
  .groud-box {
    margin: 20px 0;

    &>span {
      display: inline-block;
      width: 150px;
      margin-right: 0;
    }

    .el-select {
      width: 200px;
    }
  }

  .el-form  {
    .el-form-item__content {
      .el-input {
        width: 200px;
      }
    }
  }

  .button-box {
    text-align: center;
  }
}
</style>
