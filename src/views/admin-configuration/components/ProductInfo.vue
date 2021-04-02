<template>
  <div class="product-info">
    <div class="header">
      <h3>产品详情</h3>
      <el-button type="primary" plain @click="goBack">返回</el-button>
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
        <div v-if="samplePhoto.length" class="photo-list">
          <div v-for="(photoItem, photoIndex) in samplePhoto" :key="photoIndex" class="photo-box">
            <photo-box downing :src="photoItem" />
          </div>
          <div v-for="i in 3" :key="'empty' + i" class="empty-box" />
        </div>
        <div v-else class="no-photo panel-content">暂无样片</div>
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
          <el-button type="primary" plain @click="cancelCheck">取消</el-button>
          <el-button type="danger" @click="refuseProduct">提交</el-button>
        </div>
      </div>
      <div v-if="+checkPass === 1" class="product-config">
        <el-form ref="form" label-position="left" label-width="190px">
          <el-form-item label="产品分类">
            <product-classification-select :props="{ multiple: false }" v-model="productConfig.classificationId" />
          </el-form-item>
          <el-form-item label="修图标准">
            <el-radio-group v-model="productConfig.standard">
              <el-radio label="blue">蓝标</el-radio>
              <el-radio label="master">大师</el-radio>
              <el-radio label="mainto">缦图</el-radio>
              <el-radio label="kids">kids</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="权重等级">
            <weight-select v-model="productConfig.weightSettingId" import-data />
          </el-form-item>
          <el-form-item label="是否需要模版占位图">
            <el-radio-group v-model="productConfig.needTemplate">
              <el-radio :label="1">是</el-radio>
              <el-radio :label="2">否</el-radio>
            </el-radio-group>
            <el-radio-group v-if="productConfig.needTemplate === 1" v-model="productConfig.templateSuffix" class="template-box">
              <el-radio label="jpg">JPG</el-radio>
              <el-radio label="png">PNG</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="海草值">
            <div slot="label" class="slot-label">
              <span>海草值</span>
              <el-button type="text" @click="defaultGrass">使用默认海草值</el-button>
              <el-button type="text" @click="batchEditGrass(EDIT_TYPE.GRASS)">一键修改海草值</el-button>
            </div>
            <div class="list-data">
              <div
                v-for="(grassItem, grassIndex) in productConfig.grassData"
                :key="grassIndex"
                class="panel"
              >
                <div class="info-title">{{ grassIndex }} 人</div>
                <div class="panel-contetn">
                  <input
                    :key="grassIndex"
                    v-model="productConfig.grassData[grassIndex]"
                    v-decimalOnly
                    class="num-input"
                    type="text"
                    placeholder="0"
                  >
                </div>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="非拼接收益配置">
            <div slot="label" class="slot-label">
              <span>非拼接收益配置</span>
              <el-button type="text" @click="defaultNotJointMoney">使用默认收益</el-button>
              <el-button type="text" @click="batchEditGrass(EDIT_TYPE.MONEY)">一键修改收益</el-button>
            </div>
            <div v-if="productConfig.standard !== 'blue'" class="list-data">
              <div
                v-for="(notJointItem, notJointIndex) in productConfig.notJointMoney"
                :key="notJointIndex"
                class="panel"
              >
                <div class="info-title">{{ notJointIndex }} 人</div>
                <div class="panel-contetn">
                  <input
                    v-model="productConfig.notJointMoney[notJointIndex]"
                    v-decimalOnly
                    class="num-input"
                    type="text"
                    placeholder="0"
                  >
                </div>
              </div>
            </div>
            <div v-else class="blue-list-data">
              <div class="list-title">
                <span class="list-item">修图等级</span>
                <span
                  v-for="(blueItem, blueIndex) in productConfig.blueNotJointMoney"
                  :key="blueIndex"
                  class="list-item"
                >
                  {{ blueIndex | toCnLevel }}
                </span>
              </div>
              <div class="list-content">
                <div class="item-row">
                  <div v-for="item in 20" :key="item" class="content-list-item">{{ item }}人</div>
                </div>
                <div
                  v-for="(blueItem, blueIndex) in productConfig.blueNotJointMoney"
                  :key="blueIndex"
                  class="item-row"
                >
                  <div v-for="(moneyItem, moneyIndex) in blueItem" :key="moneyIndex" class="content-list-item">
                    <input
                      v-model="productConfig.blueNotJointMoney[blueIndex][moneyIndex]"
                      v-decimalOnly
                      class="num-input"
                      type="text"
                      placeholder="0"
                    >
                  </div>
                </div>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="是否需要拼接">
            <el-radio-group v-model="productConfig.needJoint">
              <el-radio :label="1">是</el-radio>
              <el-radio :label="2">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="是否强制审核" class="need-check-box">
            <el-radio-group v-model="productConfig.needCheck">
              <el-radio :label="2">否（根据绿色通道设定进行审核）</el-radio>
              <el-radio :label="1">是强制审核限制（无时绿色通道）</el-radio>
            </el-radio-group>
            <div class="need-check-time-select" v-if="productConfig.needCheck === 1">
              <div class="time-box">
                <span>整体审核期限 </span>
                <el-date-picker
                  v-model="productConfig.checkTimeDay"
                  value-format="yyyy-MM-dd"
                  size="small"
                  type="daterange"
                  range-separator="~"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                />
              </div>
              <div class="time-box">
                <span>每日审核时限 </span>
                <el-time-picker
                  is-range
                  size="small"
                  v-model="productConfig.checkTimeTime"
                  value-format="HH:mm:ss"
                  range-separator="~"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  placeholder="选择时间范围"
                />
              </div>
            </div>
          </el-form-item>
          <el-form-item v-if="productConfig.needJoint === 1" label="拼接海草值">
            <div slot="label" class="slot-label">
              <span>拼接海草值</span>
              <el-button type="text" @click="defaultJoinGrass">使用默认拼接海草值</el-button>
              <el-button type="text" @click="batchEditGrass(EDIT_TYPE.JOIN_GRASS)">一键修改拼接海草值</el-button>
            </div>
            <div class="list-data">
              <div
                v-for="(grassItem, grassIndex) in productConfig.joinGrassData"
                :key="grassIndex"
                class="panel"
              >
                <div class="info-title">{{ grassIndex }} 人</div>
                <div class="panel-contetn">
                  <input
                    :key="grassIndex"
                    v-model="productConfig.joinGrassData[grassIndex]"
                    v-decimalOnly
                    class="num-input"
                    type="text"
                    placeholder="0"
                  >
                </div>
              </div>
            </div>
          </el-form-item>
          <el-form-item v-if="productConfig.needJoint === 1" label="拼接收益配置">
            <div slot="label" class="slot-label">
              <span>拼接收益配置</span>
              <el-button type="text" @click="defaultJointMoney">使用默认拼接收益</el-button>
              <el-button type="text" @click="batchEditGrass(EDIT_TYPE.JOIN_MONEY)">一键修改拼接收益</el-button>
            </div>
            <div v-if="productConfig.standard !== 'blue'" class="list-data">
              <div
                v-for="(jointItem, jointIndex) in productConfig.jointMoney"
                :key="jointIndex"
                class="panel"
              >
                <div class="info-title">{{ jointIndex }} 人</div>
                <div class="panel-contetn">
                  <input
                    v-model="productConfig.jointMoney[jointIndex]"
                    v-decimalOnly
                    class="num-input"
                    type="text"
                    placeholder="0"
                  >
                </div>
              </div>
            </div>
            <div v-else class="blue-list-data">
              <div class="list-title">
                <span class="list-item">修图等级</span>
                <span
                  v-for="(blueItem, blueIndex) in productConfig.blueJointMoney"
                  :key="blueIndex"
                  class="list-item"
                >
                  {{ blueIndex | toCnLevel }}
                </span>
              </div>
              <div class="list-content">
                <div class="item-row">
                  <div v-for="item in 20" :key="item" class="content-list-item">{{ item }}人</div>
                </div>
                <div
                  v-for="(blueItem, blueIndex) in productConfig.blueJointMoney"
                  :key="blueIndex"
                  class="item-row"
                >
                  <div v-for="(moneyItem, moneyIndex) in blueItem" :key="moneyIndex" class="content-list-item">
                    <input
                      v-model="productConfig.blueJointMoney[blueIndex][moneyIndex]"
                      v-decimalOnly
                      class="num-input"
                      placeholder="0"
                    >
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
        <el-button
          v-if="+checkPass === 1 && isPending"
          type="primary"
          plain
          @click="cancelCheck"
        >
          取消
        </el-button>
        <el-button v-if="+checkPass === 1" type="primary" @click="passProductInfo">提交</el-button>
      </div>
    </div>
    <!-- 批量修改海草值 -->
    <el-dialog
      :title="batchEditInfo.title"
      top="30vh"
      width="30%"
      :visible.sync="batchEditInfo.batchEditGrassDialog"
    >
      <el-form ref="form" label-width="80px">
        <el-form-item label="修改类型">
          <el-radio-group v-model="batchEditInfo.ratio">
            <el-radio label="1">增加</el-radio>
            <el-radio label="-1">减少</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="修改数值">
          <el-input-number
            v-decimalOnly
            size="small"
            v-model="batchEditInfo.value"
            :min="1"
            :max="20"
            label="修改数值"
          >
          </el-input-number>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button
          size="small"
          @click="batchEditInfo.batchEditGrassDialog = false"
        >取 消
        </el-button>
        <el-button size="small" type="primary" @click="submitBatchEditValue">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import PhotoBox from '@/components/PhotoBox'
import WeightSelect from '@SelectBox/WeightSelect'
import ProductClassificationSelect from '@SelectBox/ProductClassificationSelect'

import { objEveryNumberValue, twoTierObjEveryNumberValue } from '@/utils/index.js'
import * as Timespan from '@/utils/timespan.js'
import * as MathUtil from '@/utils/mathUtil.js'
import { StaffLevelEnum } from '@/utils/enumerate.js'
import * as defaultGrass from '@/assets/config/grassConfig.js'
import * as defaultMoney from '@/assets/config/moneyConfig.js'

import * as OperationManage from '@/api/operationManage.js'

const EDIT_TYPE = {
  GRASS: 'Grass',
  JOIN_GRASS: 'JoinGrass',
  MONEY: 'Money',
  JOIN_MONEY: 'JointMoney'
}

export default {
  name: 'ProductInfo',
  components: { PhotoBox, WeightSelect, ProductClassificationSelect },
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
      EDIT_TYPE,
      routeName: this.$route.name, // 路由名字
      rejectValue: '',
      productName: '', // 产品名称
      retouchRequire: '', // 修图要求
      samplePhoto: [], // 样片素材
      photographerOrgName: '', // 机构名称
      productConfig: {
        classificationId: '', // 修图分类id
        standard: '', // 修图标准
        weightSettingId: '', // 权重等级
        needTemplate: '', // 是否需要模版
        templateSuffix: 'jpg', // 模版照类型
        grassData: {}, // 海草数据
        joinGrassData: {}, // 拼接海草
        notJointMoney: {},
        jointMoney: {}, // 拼接收益
        blueNotJointMoney: {},
        blueJointMoney: {}, // 拼接收益
        needJoint: '', // 是否需要拼接
        needCheck: '', // 是否需要强制审核
        checkTimeDay: null, // 强制审核日期
        checkTimeTime: null, // 强制审核时间
        productRemark: ''
      },
      batchEditInfo: {
        title: '一键更改海草值',
        type: '',
        batchEditGrassDialog: false,
        ratio: '1',
        value: 1
      },
      checkPass: 0 // 0 没审核 1 审核通过 2 拒绝审核
    }
  },
  created () {
    this.resetData()
    if (!this.isPending) {
      this.checkPass = 1
    }
    if (this.editId) {
      this.getProductInfo()
    }
  },
  methods: {
    /**
     * @description 编辑海草
     */
    batchEditGrass (type) {
      if (!type) return this.$newMessage.warning('代码异常，请联系互联网小伙伴')

      this.batchEditInfo.type = type
      switch (type) {
        case EDIT_TYPE.GRASS:
          this.batchEditInfo.title = '一键修改海草值'
          break
        case EDIT_TYPE.JOIN_GRASS:
          this.batchEditInfo.title = '一键修改拼接海草值'
          break
        case EDIT_TYPE.MONEY:
          this.batchEditInfo.title = '一键修改收益'
          break
        case EDIT_TYPE.JOIN_MONEY:
          this.batchEditInfo.title = '一键修改拼接收益'
          break
        default:
          break
      }
      this.batchEditInfo.batchEditGrassDialog = true
    },
    /**
     * @description 确认批量更改信息
     */
    submitBatchEditValue () {
      const editValue = this.batchEditInfo.value * Number(this.batchEditInfo.ratio)
      switch (this.batchEditInfo.type) {
        case EDIT_TYPE.GRASS:
          for (const valueKey in this.productConfig.grassData) {
            const valueItem = this.productConfig.grassData[valueKey]
            let value = Number(valueItem) + Number(editValue)
            if (value < 0) value = 0
            this.productConfig.grassData[valueKey] = MathUtil.toFixed(value)
          }
          break
        case EDIT_TYPE.JOIN_GRASS:
          for (const valueKey in this.productConfig.joinGrassData) {
            const valueItem = this.productConfig.joinGrassData[valueKey]
            let value = Number(valueItem) + Number(editValue)
            if (value < 0) value = 0
            this.productConfig.joinGrassData[valueKey] = MathUtil.toFixed(value)
          }
          break
        case EDIT_TYPE.MONEY:
          if (this.productConfig.standard === 'blue') {
            for (const levelKey in this.productConfig.blueNotJointMoney) {
              const levelItem = this.productConfig.blueNotJointMoney[levelKey]
              for (const valueKey in levelItem) {
                const valueItem = levelItem[valueKey]
                let value = Number(valueItem) + Number(editValue)
                if (value < 0) value = 0
                levelItem[valueKey] = MathUtil.toFixed(value)
              }
            }
          } else {
            for (const valueKey in this.productConfig.notJointMoney) {
              const valueItem = this.productConfig.notJointMoney[valueKey]
              let value = Number(valueItem) + Number(editValue)
              if (value < 0) value = 0
              this.productConfig.notJointMoney[valueKey] = MathUtil.toFixed(value)
            }
          }
          break
        case EDIT_TYPE.JOIN_MONEY:
          if (this.productConfig.standard === 'blue') {
            for (const levelKey in this.productConfig.blueJointMoney) {
              const levelItem = this.productConfig.blueJointMoney[levelKey]
              for (const valueKey in levelItem) {
                const valueItem = levelItem[valueKey]
                let value = Number(valueItem) + Number(editValue)
                if (value < 0) value = 0
                levelItem[valueKey] = MathUtil.toFixed(value)
              }
            }
          } else {
            for (const valueKey in this.productConfig.jointMoney) {
              const valueItem = this.productConfig.jointMoney[valueKey]
              let value = Number(valueItem) + Number(editValue)
              if (value < 0) value = 0
              this.productConfig.jointMoney[valueKey] = MathUtil.toFixed(value)
            }
          }
          break
        default:
          break
      }
      this.batchEditInfo.batchEditGrassDialog = false
    },
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
      this.productConfig.templateSuffix = 'jpg'
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
      if (!type) return this.$newMessage.warning('请选择修图标准')
      this.productConfig.grassData = JSON.parse(JSON.stringify(defaultGrass[type + 'Grass']))
    },
    /**
     * @description 拼接海草数
     */
    defaultJoinGrass () {
      const type = this.productConfig.standard
      if (!type) return this.$newMessage.warning('请选择修图标准')
      this.productConfig.joinGrassData = JSON.parse(JSON.stringify(defaultGrass[type + 'ConcatGrass']))
    },
    /**
     * @description 默认非拼接收益配置
     */
    defaultNotJointMoney () {
      const type = this.productConfig.standard
      if (!type) return this.$newMessage.warning('请选择修图标准')
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
      try {
        const req = { productId: this.editId }
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await OperationManage.getProductInfo(req)
        this.productName = data.name
        this.retouchRequire = data.retouchRequire
        this.samplePhoto = data.simpleImages
        this.photographerOrgName = data.photographerOrg.name
        data.splicingSeaGrassConfig && (this.productConfig.joinGrassData = data.splicingSeaGrassConfig)
        if (!this.isPending) {
          this.productConfig.standard = data.retouchStandard
          this.productConfig.weightSettingId = data.weightSettingId
          this.productConfig.needTemplate = data.needTemplate ? 1 : 2
          this.productConfig.needJoint = data.needSplicing ? 1 : 2
          this.productConfig.productRemark = data.note
          this.productConfig.grassData = data.seaGrassConfig
          this.productConfig.templateSuffix = data.templateSuffix
          this.productConfig.classificationId = data.productCategoryId || ''
          this.productConfig.needCheck = data.forceReview ? 1 : 2

          if (data.forceReviewStartAt && data.forceReviewEndAt) {
            this.productConfig.checkTimeDay = [
              Timespan.revertTimeSpan(data.forceReviewStartAt),
              Timespan.revertTimeSpan(data.forceReviewEndAt)
            ]
          }
          if (data.forceReviewDayStart && data.forceReviewDayEnd) {
            this.productConfig.checkTimeTime = [
              data.forceReviewDayStart,
              data.forceReviewDayEnd
            ]
          }

          if (data.retouchStandard !== 'blue') {
            this.productConfig.notJointMoney = data.normalIncomeConfig
            this.productConfig.jointMoney = data.splicingIncomeConfig
          } else {
            for (const key in StaffLevelEnum) {
              this.$set(this.productConfig.blueNotJointMoney, key, data.normalIncomeConfig[key])
              this.$set(this.productConfig.blueJointMoney, key, data.splicingIncomeConfig[key])
            }
          }
        }
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 审核拒绝
     */
    refuseProduct () {
      if (!this.rejectValue) {
        this.$newMessage.warning('请填写拒绝理由')
        return
      }
      const reqData = {
        productId: this.editId,
        refuseReason: this.rejectValue
      }
      this.$store.dispatch('setting/showLoading', this.routeName)
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
        weightSettingId: this.productConfig.weightSettingId,
        needSplicing: +this.productConfig.needJoint === 1,
        needTemplate: +this.productConfig.needTemplate === 1,
        templateSuffix: this.productConfig.templateSuffix,
        normalIncomeConfig: this.productConfig.notJointMoney,
        splicingIncomeConfig: this.productConfig.jointMoney,
        seaGrassConfig: this.productConfig.grassData,
        splicingSeaGrassConfig: this.productConfig.joinGrassData,
        note: this.productConfig.productRemark,
        forceReview: this.productConfig.needCheck === 1,
        productCategoryId: this.productConfig.classificationId
      }
      // 是否需要强制审核
      if (this.productConfig.needCheck === 1) {
        reqData.forceReviewDayStart = this.productConfig.checkTimeTime[0]
        reqData.forceReviewDayEnd = this.productConfig.checkTimeTime[1]
        reqData.forceReviewStartAt = this.productConfig.checkTimeDay[0] + ' 00:00:00'
        reqData.forceReviewEndAt = this.productConfig.checkTimeDay[1] + ' 23:59:59'
      }
      if (this.productConfig.standard === 'blue') {
        reqData.normalIncomeConfig = this.productConfig.blueNotJointMoney
        reqData.splicingIncomeConfig = this.productConfig.blueJointMoney
      }
      this.$store.dispatch('setting/showLoading', this.routeName)
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
      if (!this.productConfig.classificationId) {
        this.$newMessage.warning('请选中产品分类')
        return false
      }
      if (!this.productConfig.weightSettingId) {
        this.$newMessage.warning('请选中权重类型')
        return false
      }
      if (!this.productConfig.needJoint) {
        this.$newMessage.warning('请选择是否需要拼接')
        return false
      }
      if (!this.productConfig.needTemplate) {
        this.$newMessage.warning('请选择是否需要模版')
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
      if (!this.productConfig.needCheck) {
        this.$newMessage.warning('请填写是否需要强制审核')
        return false
      }
      if (this.productConfig.needCheck === 1) {
        if (!this.productConfig.checkTimeDay || !this.productConfig.checkTimeTime) {
          this.$newMessage.warning('请填写强制审核日期或审核时间')
          return false
        }
      }
      if (this.productConfig.standard === 'blue' && !twoTierObjEveryNumberValue(this.productConfig.blueNotJointMoney)) {
        this.$newMessage.warning('请填写蓝标非拼接收益')
        return false
      }
      if (this.productConfig.standard !== 'blue' && this.productConfig.needJoint === 1 && !objEveryNumberValue(this.productConfig.joinGrassData)) {
        this.$newMessage.warning('请填写拼接海草值')
        return false
      }
      if (this.productConfig.standard !== 'blue' && this.productConfig.needJoint === 1 && !objEveryNumberValue(this.productConfig.jointMoney)) {
        this.$newMessage.warning('请填写拼接收益')
        return false
      }
      if (this.productConfig.standard === 'blue' && this.productConfig.needJoint === 1 && !twoTierObjEveryNumberValue(this.productConfig.jointMoney)) {
        this.$newMessage.warning('请填写蓝标拼接收益')
        return false
      }
      return true
    }
  }
}
</script>

<style lang="less">
.product-info {
  .module-panel {
    .panel-content {
      font-size: 14px;
      color: #606266;
    }
  }

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
        font-weight: 700;
        color: #606266;
      }
    }
  }

  .require-box {
    display: flex;
  }

  .sample-photo {
    display: flex;
    align-items: flex-start;

    & > span {
      width: 100px;
      margin: 0;
    }

    .photo-list {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      width: calc(~'100% - 100px');
      margin-right: -24px;

      .photo-box {
        width: 253px;
        margin-right: 24px;
        margin-bottom: 24px;
      }
    }
  }

  .check-box {
    padding-left: 100px;
    text-align: left;
  }

  .reject-box {
    margin-top: 10px;

    .reject-content {
      display: flex;
      align-items: flex-start;

      .el-textarea {
        width: 500px;
      }

      & > span {
        width: 100px;
        margin-right: 0;
      }
    }

    .reject-button {
      padding-left: 100px;
      margin-top: 10px;
      text-align: left;
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

    .need-check-box {
      .need-check-time-select {
        display: flex;
        margin-top: 12px;

        .time-box {
          margin-right: 12px;

          & > span {
            margin-right: 12px;
            font-size: 14px;
            color: #606266;
          }

          .el-date-editor {
            width: 300px;
          }
        }
      }
    }

    .list-data {
      display: grid;
      grid-template-columns: repeat(10, 1fr);
      grid-gap: 1px;
      font-size: 14px;
      color: #303133;
      text-align: center;
      background-color: @borderColor;
      border: 1px solid @borderColor;

      .panel {
        text-align: center;

        .info-title {
          background-color: #fafafa;
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

    .template-box {
      margin-left: 24px;
    }
  }

  .pass-box {
    margin-left: 190px;
  }

  .blue-list-data {
    display: flex;
    font-size: 14px;
    color: #303133;
    text-align: center;
    border: 1px solid @borderColor;
    border-top: 1px solid @borderColor;

    .list-title {
      display: flex;
      flex-direction: column;
      width: 100px;
      background-color: #fafafa;
      border-right: 1px solid @borderColor;

      .list-item {
        border-top: 1px solid @borderColor;

        &:nth-child(1) {
          border-top: none;
        }
      }
    }

    .list-content {
      display: flex;
      flex-direction: column;
      width: calc(100% - 100px);
      overflow: auto;

      .item-row {
        display: -webkit-box;

        &:nth-child(1) {
          .list-item {
            background-color: #fafafa;
          }
        }

        &:nth-last-child(1) {
          .list-item {
            border-bottom: none;
          }
        }

        .content-list-item {
          width: 88px;
          border-right: 1px solid @borderColor;
          border-bottom: 1px solid @borderColor;

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
