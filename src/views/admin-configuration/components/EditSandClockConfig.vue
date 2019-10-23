<template>
  <div class="edit-sand-clock-config">
    <div class="header">
      <h3>编辑沙漏配置</h3>
    </div>
    <div class="module-panel">
      <!-- 修图标准 -->
      <div class="search-item product-box">
        <span>修图标准</span>
        <product-linkage v-if="!baseEdit" v-model="productValue" />
        <retouch-kind-select v-else v-model="retouchStandard" />
      </div>
      <!-- 配置伙伴 -->
      <div class="search-item staff-panel">
        <span>配置伙伴</span>
        <div class="label-box">
          <el-checkbox-group v-model="checkList" @change="checkListChange">
            <el-checkbox label="all">所有伙伴</el-checkbox>
            <el-checkbox label="staffEntryTagOneMonth" :disabled="!canCheck">0-1个月新人伙伴</el-checkbox>
            <el-checkbox label="staffEntryTagTwoMonth" :disabled="!canCheck">1-2个月新人伙伴</el-checkbox>
            <el-checkbox label="staffEntryTagThreeMonth" :disabled="!canCheck">2-3个月新人伙伴</el-checkbox>
            <el-checkbox label="staffEntryTagFormal" :disabled="!canCheck">正式伙伴</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <!-- 基础时间 -->
      <div class="search-item time-panel">
        <span>基础时间</span>
        <el-input v-model.number="baseTime" v-numberOnly type="number" placeholder="请填写整数，单位：分钟" />
        <el-popover
          class="popover-class"
          placement="bottom-start"
          width="200"
          trigger="hover"
          content="基础时间说明：该时间配置的是每张照片的每个人数的时间"
        >
          <i slot="reference" class="el-icon-warning" />
        </el-popover>
      </div>
      <!-- 叠加时间 -->
      <div class="search-item time-panel">
        <span>叠加时间</span>
        <el-input v-model.number="addTime" v-numberOnly type="number" placeholder="请填写整数，单位：分钟" />
        <span> / 人</span>
        <el-popover
          class="popover-class"
          placement="bottom-start"
          width="200"
          trigger="hover"
          content="叠加时间说明：该时间配置的是每张照片的增加人数的时间"
        >
          <i slot="reference" class="el-icon-warning" />
        </el-popover>
      </div>
      <div class="button-box">
        <el-button type="info" @click="goBack">返 回</el-button>
        <el-button v-if="!editId" type="primary" @click="addHourGlass">确 认</el-button>
        <el-button v-else type="primary" @click="editHourGlass">确 认</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import ProductLinkage from '@/components/LinkageSelect/ProductLinkage'
import RetouchKindSelect from '@SelectBox/RetouchKindSelect'

import { HourGlassSettingEnum } from '@/utils/enumerate.js'
import * as OperationManage from '@/api/operationManage.js'

export default {
  name: 'EditSandClockConfig',
  components: { ProductLinkage, RetouchKindSelect },
  props: {
    editId: { type: [String, Number], default: '' },
    baseEdit: { type: Boolean } // 是否是基础配置
  },
  data () {
    return {
      baseTime: '',
      addTime: '',
      productValue: {},
      checkList: [],
      retouchStandard: '',
      canCheck: true
    }
  },
  watch: {
    editId (value) {
      if (value) {
        const req = { configId: this.editId }
        this.getHourGlassInfo(req)
      }
    }
  },
  methods: {
    /**
     * @description 跳转上一级
     */
    goBack () {
      this.baseTime = ''
      this.addTime = ''
      this.retouchStandard = ''
      this.productValue = {}
      this.checkList = []
      this.canCheck = true
      this.$emit('update:editConfig', false)
    },
    /**
     * @description 监听label选项
     */
    checkListChange () {
      this.canCheck = !this.checkList.includes('all')
      if (!this.canCheck) {
        this.checkList = ['all']
      }
    },
    /**
     * @description 获取沙漏详情
     */
    async getHourGlassInfo (id) {
      this.$store.dispatch('setting/showLoading')
      const data = await OperationManage.getHourGlassInfo(id)
      console.log(data)
      this.productValue = {
        productClass: data.productClass,
        product: data.productValue
      }
      if (Object.keys(HourGlassSettingEnum).length === data.range.length) {
        this.checkList = ['all']
        this.canCheck = false
      } else {
        this.checkList = [...data.range]
      }
      this.baseTime = data.base_time
      this.addTime = data.superimposed_time
      this.$store.dispatch('setting/hiddenLoading')
    },
    /**
     * @description 添加沙漏时间
     */
    addHourGlass () {
      const allStaffRanges = [
        'staffEntryTagOneMonth',
        'staffEntryTagTwoMonth',
        'staffEntryTagThreeMonth',
        'staffEntryTagFormal'
      ]
      if (!this.verificationData()) return
      const reqData = {
        staffRanges: this.checkList.includes('all') ? allStaffRanges : this.checkList,
        baseTime: this.baseTime,
        superimposedTime: this.addTime
      }
      if (this.baseEdit) {
        reqData.retouchStandard = this.retouchStandard
      } else {
        reqData.productIds = this.productValue.product
        reqData.retouchStandard = this.productValue.productClass
      }
      this.$store.dispatch('setting/showLoading')
      OperationManage.addHourGlass(reqData)
        .then(() => {
          this.$newMessage({
            message: '添加沙漏配置成功',
            type: 'success',
            duration: 1500,
            onClose: () => {
              this.goBack()
            }
          })
        })
    },
    /**
     * @description 添加沙漏时间
     */
    editHourGlass () {
      const allStaffRanges = [
        'staffEntryTagOneMonth',
        'staffEntryTagTwoMonth',
        'staffEntryTagThreeMonth',
        'staffEntryTagFormal'
      ]
      if (!this.verificationData()) return
      const reqData = {
        configId: this.editId,
        retouchStandard: this.productValue.productClass,
        productIds: this.productValue.product,
        staffRanges: this.checkList.includes('all') ? allStaffRanges : this.checkList,
        baseTime: this.baseTime,
        superimposedTime: this.addTime
      }
      this.$store.dispatch('setting/showLoading')
      OperationManage.editHourGlass(reqData)
        .then(() => {
          this.$newMessage({
            message: '编辑沙漏配置成功',
            type: 'success',
            duration: 1500,
            onClose: () => {
              this.goBack()
            }
          })
        })
    },
    /**
     * @description 验证数据
     */
    verificationData () {
      if (this.baseEdit && !this.retouchStandard) {
        this.$newMessage.warning('请填写修图标准')
        return false
      }
      if (!this.baseEdit && !this.productValue.product.length) {
        this.$newMessage.warning('请填写产品')
        return false
      }
      if (!this.checkList.length) {
        this.$newMessage.warning('请选择范围')
        return false
      }
      if (!Number(this.baseTime)) {
        this.$newMessage.warning('请填写基准时间')
        return false
      }
      if (!Number(this.addTime)) {
        this.$newMessage.warning('请填叠加时间')
        return false
      }
      return true
    }
  }
}
</script>

<style lang="less">
.edit-sand-clock-config {
  .el-cascader {
    width: 310px;
  }

  .search-item {
    margin-bottom: 24px;
    width: 900px;
    align-items: flex-start;

    &>span {
      width: 60px;
      display: inline-block;
    }

    .el-input {
      width: 319px;
      margin-right: 10px;
    }
  }

  .product-box,
  .time-panel {
    align-items: center;
    width: 500px;
    position: relative;
  }

  .popover-class {
    position: absolute;
    right: 0;
    display: inline !important;
    width: min-content !important;
    color: #D7D7D7;
    font-size: 20px;
  }

  .button-box {
    text-align: center;
    width: 880px;
  }
}
</style>
