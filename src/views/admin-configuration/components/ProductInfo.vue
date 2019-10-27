<template>
  <div class="product-info">
    <div class="header">
      <h3>产品详情</h3>
      <el-button type="info" @click="goBack">返回</el-button>
    </div>
    <div class="module-panel">
      <div class="info-box">
        <div class="info-panel">
          <div class="info-title">产品名称</div>
          <div class="panel-content">{{ productName }}</div>
        </div>
        <div class="info-panel">
          <div class="info-title">机构名称</div>
          <div class="panel-content">{{ photographerOrgName }}</div>
        </div>
      </div>
      <div class="info-box require-box">
        <div class="info-panel">
          <div class="info-title">修图要求</div>
          <div class="panel-content">{{ retouchRequire }}</div>
        </div>
      </div>
      <div class="sample-photo search-item">
        <span>样片素材</span>
        <div class="photo-list">
          <photo-box
            v-for="(photoItem, photoIndex) in samplePhoto"
            :key="photoIndex"
            downing
            :src="photoItem"
          />
          <div v-for="i in 3" :key="'empty' + i" class="empty-box" />
        </div>
      </div>
      <div v-if="isPending && +checkPass === 0" class="check-box">
        <el-button type="primary" @click="passProduct">审核通过</el-button>
        <el-button type="danger" @click="rejectProduct">审核拒绝</el-button>
      </div>
      <div v-if="isPending && +checkPass === 2" class="reject-box">
        <div class="reject-content search-item">
          <span>拒绝原因</span>
          <el-input
            v-model="rejectValue"
            type="textarea"
            :rows="2"
            placeholder="请输入拒绝原因"
          />
        </div>
        <div class="reject-button">
          <el-button type="info" @click="cancelCheck">取 消</el-button>
          <el-button type="danger" @click="refuseProduct">提交</el-button>
        </div>
      </div>
      <div v-if="+checkPass === 1" class="product-config">
        <el-form ref="form" label-position="left" label-width="190px">
          <el-form-item label="修图标准">
            <el-radio-group v-model="productConfig.standard">
              <el-radio label="blue">蓝标</el-radio>
              <el-radio label="master">大师</el-radio>
              <el-radio label="mainto">缦图</el-radio>
              <el-radio label="kids">kids</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="权重等级">
            <weight-select v-model="productConfig.weightType" import-data />
          </el-form-item>
          <el-form-item label="是否需要沙漏">
            <el-radio-group v-model="productConfig.sandClockValue">
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="是否需要模版占位图">
            <el-radio-group v-model="productConfig.needTemplate">
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="海草值">
            <div slot="label" class="slot-label">
              <span>海草值</span>
              <el-button type="text" @click="defaultGrass">使用默认海草值</el-button>
            </div>
            <div class="list-data">
              <div v-for="(grassItem, grassIndex) in productConfig.grassData" :key="grassIndex" class="panel">
                <div class="info-title">{{ grassIndex }} 人</div>
                <div class="panel-contetn">
                  <el-input :key="grassIndex" v-model.number="productConfig.grassData[grassIndex]" v-decimalOnly type="number" placeholder="0" />
                </div>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="非拼接收益配置">
            <div slot="label" class="slot-label">
              <span>非拼接收益配置</span>
              <el-button type="text" @click="defaultNotJointMoney">使用默认收益</el-button>
            </div>
            <div v-if="productConfig.standard !== 'blue'" class="list-data">
              <div v-for="(notJointItem, notJointIndex) in productConfig.notJointMoney" :key="notJointIndex" class="panel">
                <div class="info-title">{{ notJointIndex }} 人</div>
                <div class="panel-contetn">
                  <el-input v-model.number="productConfig.notJointMoney[notJointIndex]" placeholder="0" />
                </div>
              </div>
            </div>
            <div v-else class="blue-list-data">
              <div class="list-title">
                <span class="list-item">修图等级</span>
                <span v-for="(blueItem, blueIndex) in productConfig.blueNotJointMoney" :key="blueIndex" class="list-item">
                  {{ blueIndex | toCnLevel }}
                </span>
              </div>
              <div class="list-content">
                <div class="item-row">
                  <div v-for="item in 20" :key="item" class="list-item">{{ item }}人</div>
                </div>
                <div v-for="(blueItem, blueIndex) in productConfig.blueNotJointMoney" :key="blueIndex" class="item-row">
                  <div v-for="(moneyItem, moneyIndex) in blueItem" :key="moneyIndex" class="list-item">
                    <el-input v-model.number="productConfig.blueNotJointMoney[blueIndex][moneyIndex]" placeholder="0" />
                  </div>
                </div>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="是否需要拼接">
            <el-radio-group v-model="productConfig.needJoint" :disabled="disableChange">
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="productConfig.needJoint === 1" label="拼接海草值">
            <div slot="label" class="slot-label">
              <span>拼接海草值</span>
              <el-button type="text" @click="defaultJoinGrass">使用默认拼接海草值</el-button>
            </div>
            <div class="list-data">
              <div v-for="(grassItem, grassIndex) in productConfig.joinGrassData" :key="grassIndex" class="panel">
                <div class="info-title">{{ grassIndex }} 人</div>
                <div class="panel-contetn">
                  <el-input :key="grassIndex" v-model.number="productConfig.joinGrassData[grassIndex]" placeholder="0" />
                </div>
              </div>
            </div>
          </el-form-item>
          <el-form-item v-if="productConfig.needJoint === 1" label="拼接收益配置">
            <div slot="label" class="slot-label">
              <span>拼接收益配置</span>
              <el-button type="text" @click="defaultJointMoney">使用默认拼接收益</el-button>
            </div>
            <div v-if="productConfig.standard !== 'blue'" class="list-data">
              <div v-for="(jointItem, jointIndex) in productConfig.jointMoney" :key="jointIndex" class="panel">
                <div class="info-title">{{ jointIndex }} 人</div>
                <div class="panel-contetn">
                  <el-input v-model.number="productConfig.jointMoney[jointIndex]" placeholder="0" />
                </div>
              </div>
            </div>
            <div v-else class="blue-list-data">
              <div class="list-title">
                <span class="list-item">修图等级</span>
                <span v-for="(blueItem, blueIndex) in productConfig.blueJointMoney" :key="blueIndex" class="list-item">
                  {{ blueIndex | toCnLevel }}
                </span>
              </div>
              <div class="list-content">
                <div class="item-row">
                  <div v-for="item in 20" :key="item" class="list-item">{{ item }}人</div>
                </div>
                <div v-for="(blueItem, blueIndex) in productConfig.blueJointMoney" :key="blueIndex" class="item-row">
                  <div v-for="(moneyItem, moneyIndex) in blueItem" :key="moneyIndex" class="list-item">
                    <el-input v-model.number="productConfig.blueJointMoney[blueIndex][moneyIndex]" placeholder="0" />
                  </div>
                </div>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="备注">
            <el-input
              v-model="productConfig.productRemark"
              type="textarea"
              :rows="2"
              placeholder="请输入备注"
            />
          </el-form-item>
        </el-form>
      </div>
      <div v-if="+checkPass !== 2" class="pass-box">
        <el-button v-if="+checkPass === 1 && isPending" type="info" @click="cancelCheck">取消</el-button>
        <el-button v-if="+checkPass === 1" type="primary" @click="passProductInfo">提交</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import PhotoBox from '@/components/PhotoBox'
import WeightSelect from '@SelectBox/WeightSelect'

import { objEveryNumberValue, twoTierObjEveryNumberValue } from '@/utils/index.js'
import { StaffLevelEnum } from '@/utils/enumerate.js'
import * as defaultGrass from '@/assets/config/grassConfig.js'
import * as defaultMoney from '@/assets/config/moneyConfig.js'
import * as OperationManage from '@/api/operationManage.js'
export default {
  name: 'ProductInfo',
  components: { PhotoBox, WeightSelect },
  filters: {
    toCnLevel (value) {
      return StaffLevelEnum[value]
    }
  },
  props: {
    isPending: { type: Boolean, default: false },
    editId: { type: [String, Number], default: '' }
  },
  data () {
    return {
      rejectValue: '',
      productName: '', // 产品名称
      retouchRequire: '', // 修图要求
      samplePhoto: [], // 样片素材
      photographerOrgName: '', // 机构名称
      productConfig: {
        standard: '', // 修图标准
        weightType: '', // 权重等级
        sandClockValue: 1, //  是否需要沙漏
        needTemplate: 1, // 是否需要模版
        grassData: {},
        joinGrassData: {}, // 拼接海草,不为拼接可不传或传[]
        notJointMoney: {},
        jointMoney: {}, // 不为拼接可不传或传[]
        blueNotJointMoney: {},
        blueJointMoney: {}, // 不为拼接可不传或传[]
        needJoint: 1, // 是否需要拼接
        productRemark: ''
      },
      disableChange: false,
      checkPass: 0 // 0 没审核 1 审核通过 2 拒绝审核
    }
  },
  watch: {
    'productConfig.standard': function (val) {
      if (val === 'blue' || val === 'master') {
        this.disableChange = false
        this.productConfig.needJoint = 1
      } else {
        this.disableChange = true
        this.productConfig.needJoint = 0
      }
    }
  },
  created () {
    this.resetData()
    if (!this.isPending) { this.checkPass = 1 }
    if (this.editId) { this.getProductInfo() }
  },
  methods: {
    /**
     * @description 初始化数据
     */
    resetData () {
      const circulation = 20
      const createObj = {}
      const blueNotJointMoney = {}
      const blueJointMoney = {}
      for (let i = 1; i <= circulation; i++) {
        createObj[i] = ''
      }
      for (const key in StaffLevelEnum) {
        blueNotJointMoney[key] = createObj
        blueJointMoney[key] = createObj
      }
      this.productConfig.grassData = JSON.parse(JSON.stringify(createObj))
      this.productConfig.joinGrassData = JSON.parse(JSON.stringify(createObj))
      this.productConfig.notJointMoney = JSON.parse(JSON.stringify(createObj))
      this.productConfig.jointMoney = JSON.parse(JSON.stringify(createObj))
      this.productConfig.blueNotJointMoney = JSON.parse(JSON.stringify(blueNotJointMoney))
      this.productConfig.blueJointMoney = JSON.parse(JSON.stringify(blueJointMoney))
    },
    /**
     * @description 返回上一级
     */
    goBack () {
      this.checkPass = 0
      this.$emit('update:showInfo', false)
    },
    /**
     * @description 通过产品
     */
    passProduct () {
      this.checkPass = 1
    },
    /**
     * @description 拒绝产品
     */
    rejectProduct () {
      this.checkPass = 2
    },
    /**
     * @description 取消审核
     */
    cancelCheck () {
      this.rejectValue = ''
      this.checkPass = 0
    },
    /**
     * @description 默认海草数
     */
    defaultGrass () {
      const type = this.productConfig.standard
      if (!type) {
        this.$newMessage.warning('请选择修图标准')
        return false
      }
      this.productConfig.grassData = JSON.parse(JSON.stringify(defaultGrass[type + 'Grass']))
    },
    /**
     * @description 拼接海草数
     */
    defaultJoinGrass () {
      const type = this.productConfig.standard
      if (!type) {
        this.$newMessage.warning('请选择修图标准')
        return false
      }
      this.productConfig.joinGrassData = JSON.parse(JSON.stringify(defaultGrass[type + 'ConcatGrass']))
    },
    /**
     * @description 默认非拼接收益配置
     */
    defaultNotJointMoney () {
      const type = this.productConfig.standard
      if (!type) {
        this.$newMessage.warning('请选择修图标准')
        return false
      }
      if (type === 'blue') {
        this.productConfig.blueNotJointMoney = JSON.parse(JSON.stringify(defaultMoney[type + 'Money']))
      } else {
        this.productConfig.notJointMoney = JSON.parse(JSON.stringify(defaultMoney[type + 'Money']))
      }
    },
    /**
     * @description 默认非拼接收益配置
     */
    defaultJointMoney () {
      const type = this.productConfig.standard
      if (!type) {
        this.$newMessage.warning('请选择修图标准')
        return false
      }
      if (type === 'blue') {
        this.productConfig.blueJointMoney = JSON.parse(JSON.stringify(defaultMoney[type + 'ConcatMoney']))
      } else {
        this.productConfig.jointMoney = JSON.parse(JSON.stringify(defaultMoney[type + 'ConcatMoney']))
      }
    },
    /**
     * @description 获取审核详情
     */
    async getProductInfo () {
      const req = { productId: this.editId }
      this.$store.dispatch('setting/showLoading')
      const data = await OperationManage.getProductInfo(req)
      console.log(data)
      this.productName = data.name
      this.retouchRequire = data.retouchRequire
      this.samplePhoto = data.simpleImages
      this.photographerOrgName = data.photographerOrg.name
      this.productConfig.joinGrassData = data.splicingSeaGrassConfig || {}
      if (!this.isPending) {
        this.productConfig.standard = data.retouchStandard
        this.productConfig.weightType = data.weightLevel
        this.productConfig.sandClockValue = +data.needHourglass
        this.productConfig.needTemplate = +data.needTemplate
        this.productConfig.needJoint = +data.needSplicing
        this.productConfig.productRemark = data.note
        this.productConfig.grassData = data.seaGrassConfig
        if (data.retouchStandard !== 'blue') {
          this.productConfig.notJointMoney = data.normalIncomeConfig
          this.productConfig.jointMoney = data.splicingIncomeConfig
        } else {
          this.productConfig.blueNotJointMoney = data.normalIncomeConfig
          this.productConfig.blueJointMoney = data.splicingIncomeConfig
        }
      }
      this.$store.dispatch('setting/hiddenLoading')
    },
    /**
     * @description 审核拒绝
     */
    refuseProduct () {
      const reqData = {
        productId: this.editId,
        refuseReason: this.rejectValue
      }
      this.$store.dispatch('setting/showLoading')
      OperationManage.refuseProduct(reqData)
        .then(() => {
          this.$newMessage.success('审核拒绝成功')
          this.goBack()
        })
    },
    /**
     * @description 审核通过
     */
    passProductInfo () {
      if (!this.verificationData()) return false
      const reqData = {
        productId: this.editId,
        retouchStandard: this.productConfig.standard,
        weightLevel: this.productConfig.weightType,
        needSplicing: Boolean(this.productConfig.needJoint),
        needHourglass: Boolean(this.productConfig.sandClockValue),
        needTemplate: Boolean(this.productConfig.needTemplate),
        normalIncomeConfig: this.productConfig.notJointMoney,
        splicingIncomeConfig: this.productConfig.jointMoney,
        seaGrassConfig: this.productConfig.grassData,
        splicingSeaGrassConfig: this.productConfig.joinGrassData,
        note: this.productConfig.productRemark
      }
      if (this.productConfig.standard === 'blue') {
        reqData.normalIncomeConfig = this.productConfig.blueNotJointMoney
        reqData.splicingIncomeConfig = this.productConfig.blueJointMoney
      }
      this.$store.dispatch('setting/showLoading')
      if (this.isPending) {
        OperationManage.passProduct(reqData)
          .then(() => {
            this.$newMessage.success('审核通过成功')
            this.goBack()
          })
      } else {
        OperationManage.editProduct(reqData)
          .then(() => {
            this.$newMessage.success('修改成功')
            this.goBack()
          })
      }
    },
    /**
     * @description 验证是否填写数据
     */
    verificationData () {
      if (!this.productConfig.standard) {
        this.$newMessage.warning('请选中修图标准')
        return false
      }
      if (!this.productConfig.weightType) {
        this.$newMessage.warning('请选中权重等级')
        return false
      }
      if (!objEveryNumberValue(this.productConfig.grassData)) {
        this.$newMessage.warning('请填写海草值')
        return false
      }
      if (this.productConfig.standard !== 'blue' && !objEveryNumberValue(this.productConfig.notJointMoney)) {
        this.$newMessage.warning('请填写非拼接收益')
        return false
      }
      if (this.productConfig.standard === 'blue' && !twoTierObjEveryNumberValue(this.productConfig.blueNotJointMoney)) {
        this.$newMessage.warning('请填写蓝标非拼接收益')
        return false
      }
      if (this.productConfig.standard !== 'blue' && this.productConfig.needJoint && !objEveryNumberValue(this.productConfig.joinGrassData)) {
        this.$newMessage.warning('请填写拼接海草值')
        return false
      }
      if (this.productConfig.standard !== 'blue' && this.productConfig.needJoint && !objEveryNumberValue(this.productConfig.jointMoney)) {
        this.$newMessage.warning('请填写拼接收益')
        return false
      }
      if (this.productConfig.standard === 'blue' && this.productConfig.needJoint && !twoTierObjEveryNumberValue(this.productConfig.jointMoney)) {
        this.$newMessage.warning('请填写蓝标拼接收益')
        return false
      }
      return true
    }
  }
}
</script>

<style lang="less">
@import "~@/styles/variables.less";
.product-info {
  .info-box {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    margin-bottom: 10px;

    .info-panel {
      display: flex;
      margin-bottom: 24px;

      .info-title {
        width: 100px;
        font-size: 14px;
        color: #303133;
      }
    }
  }

  .require-box {
    display: flex;
  }

  .sample-photo {
    display: flex;
    align-items: flex-start;

    &>span {
      width: 100px;
    }

    .photo-list {
      width: calc(~'100% - 100px');
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;

      .photo {
        width: 30%;
        box-shadow: @boxShadow;
        margin-bottom: 3%;
      }

      .empty-box {
        width: 30%;
      }
    }
  }

  .check-box {
    text-align: center;
  }

  .reject-box {
    margin-top: 10px;
    width: 500px;

    .reject-content {
      display: flex;
      align-items: flex-start;

      &>span {
        width: 100px;
      }
    }

    .reject-button {
      padding-left: 100px;
      margin-top: 10px;
      text-align: center;
    }
  }

  .product-config {
    margin-top: 20px;

    .slot-label {
      display: flex;
      flex-direction: column;

      .el-button {
        text-align: left;
      }
    }

    .list-data {
      display: grid;
      grid-template-columns: repeat(10, 1fr);
      grid-gap: 1px;
      background-color: #EBEEF5;
      border: 1px solid #EBEEF5;
      font-size:14px;
      color:#303133;
      text-align: center;

      .panel {
        text-align: center;

        .info-title {
          background-color: #FAFAFA;
        }

        .panel-contetn {
          background-color: #fff;

          .el-input__inner {
            text-align: center;
            border: none;
          }
        }
      }
    }
  }

  .pass-box {
    margin-left: 190px;
  }

  .blue-list-data {
    border: 1px solid #EBEEF5;
    display: flex;
    border-top: 1px solid #EBEEF5;
    font-size:14px;
    color:#303133;
    text-align: center;

    .list-title {
      width: 100px;
      display: flex;
      flex-direction: column;
      background-color: #FAFAFA;
      border-right: 1px solid #EBEEF5;

      .list-item {
        border-top: 1px solid #EBEEF5;

        &:nth-child(1) {
          border-top: none;
        }
      }
    }

    .list-content {
      display: flex;
      width: calc(100% - 100px);
      overflow: auto;
      flex-direction: column;

      .item-row {
        display: -webkit-box;

        &:nth-child(1) {
          .list-item {
            background-color: #FAFAFA;
          }
        }

        &:nth-last-child(1) {
          .list-item {
            border-bottom: none;
          }
        }

        .list-item {
          width: 88px;
          border-right: 1px solid #EBEEF5;
          border-bottom: 1px solid #EBEEF5;

          .el-input__inner {
            border: none;
          }

          &:nth-last-child(1) {
            border-right: none;
          }
        }
      }
    }
  }
}
</style>
