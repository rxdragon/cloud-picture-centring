<template>
  <div class="edit-retouch-institution">
    <div class="header">
      <h3>编辑修图机构</h3>
      <el-button type="primary" plain @click="toBack">返回</el-button>
    </div>
    <div class="config-list module-panel">
      <el-form ref="formEdit" :model="institutionConfig" :rules="rules" label-position="left" label-width="100px">
        <el-form-item label="机构名称：" prop="name">
          <el-input v-model="institutionConfig.name" />
        </el-form-item>
        <el-form-item label="机构代号：" prop="code">
          <el-input v-model="institutionConfig.code" maxlength="16" />
        </el-form-item>
        <el-form-item label="机构主账号：" prop="account">
          <el-input v-model="institutionConfig.account" maxlength="16" />
        </el-form-item>
        <el-form-item label="机构密码：">
          <el-input v-model="institutionConfig.secret" v-no-special maxlength="16" type="password" />
        </el-form-item>
        <el-form-item label="可接产品：" prop="toData" :show-message="false">
          <product-panel
            :default-checked-keys="defaultCheckedKeys"
            :is-loading-down.sync="isLoadingDown"
            :to-data.sync="institutionConfig.toData"
          />
        </el-form-item>
        <el-form-item label="收益配置：" prop="incomeConfig">
          <div class="list-data">
            <div v-for="(incomeItem, incomeIndex) in institutionConfig.incomeConfig" :key="incomeIndex" class="panel">
              <div class="list-title">{{ incomeIndex + 1 }} 人</div>
              <div class="panel-contetn">
                <input v-model="institutionConfig.incomeConfig[incomeIndex]" v-decimalOnly class="num-input" min="0" placeholder="0">
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">提交</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import ProductPanel from '@/components/ProductPanel'
import * as Institution from '@/api/institution.js'

export default {
  name: 'EditRetouchInstitution',
  components: { ProductPanel },
  props: {
    retouchInstitutionId: { type: [String, Number], default: '' }
  },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      rules: {
        name: [
          { validator: (rule, value, callback) => { this.noSpecialCharacter(rule, value, callback) }, trigger: ['blur', 'change'] }
        ],
        account: [
          { validator: (rule, value, callback) => { this.validateInput(rule, value, callback) }, trigger: ['blur', 'change'] }
        ],
        code: [
          { validator: (rule, value, callback) => { this.validateInput(rule, value, callback) }, trigger: ['blur', 'change'] }
        ],
        toData: [
          { validator: (rule, value, callback) => { this.validateToData(rule, value, callback) }, trigger: 'blur' }
        ],
        incomeConfig: [
          { validator: (rule, value, callback) => { this.validateIncomeConfig(rule, value, callback) }, trigger: 'blur' }
        ]
      },
      defaultCheckedKeys: [],
      isLoadingDown: false,
      institutionConfig: {
        name: '', // 机构名称
        code: '', // 机构主账号
        account: '', // 机构主账号
        secret: '', // 机构密码
        incomeConfig: [], // 收益配置
        toData: []
      }
    }
  },
  watch: {
    isLoadingDown (value) {
      if (value && this.retouchInstitutionId) { this.getRetouchOrgInfo() }
    }
  },
  created () {
    for (let index = 0; index < 20; index++) {
      this.institutionConfig.incomeConfig.push('')
    }
  },
  methods: {
    /**
     * @description 返回上一级
     */
    toBack () {
      this.$emit('update:show-edit', false)
    },
    /**
     * @description 获取修图机构信息
     * @package retouchOrgId 机构id
     */
    async getRetouchOrgInfo () {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await Institution.getRetouchOrgInfo({ 'retouchOrgId': this.retouchInstitutionId })
        this.institutionConfig = data.institutionConfig
        this.defaultCheckedKeys = data.defaultCheckedKeys
        this.institutionConfig.toData = []
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    },
    /**
     * @description 上传
     */
    onSubmit () {
      this.$refs['formEdit'].validate()
        .then(() => {
          this.institutionConfig.enableProductIds = []
          this.retouchInstitutionId && (this.institutionConfig.retouchOrgId = this.retouchInstitutionId)
          this.institutionConfig.toData.forEach(configItem => {
            configItem.children.forEach(productItem => {
              this.institutionConfig.enableProductIds.push(productItem.id)
            })
          })
          delete this.institutionConfig.toData
          const reqData = this.institutionConfig
          this.$store.dispatch('setting/showLoading', this.routeName)
          if (this.retouchInstitutionId) {
            Institution.editRetouchOrg(reqData)
              .then(() => {
                this.$newMessage.success('修改机构成功')
                this.$store.dispatch('setting/hiddenLoading', this.routeName)
                this.toBack()
              })
          } else {
            Institution.addRetouchOrg(reqData)
              .then(() => {
                this.$newMessage.success('添加机构成功')
                this.$store.dispatch('setting/hiddenLoading', this.routeName)
                this.toBack()
              })
          }
        })
        .catch(() => {})
    },
    /**
     * @description 输入验证
     */
    validateInput (rule, value, callback) {
      if (!value) {
        if (rule.field === 'account') { callback(new Error('请填写机构主账号')) }
        if (rule.field === 'code') { callback(new Error('机构代号')) }
      } else if ((/[^a-zA-Z]/g).test(value)) {
        callback(new Error('只能输入英文'))
      } else {
        callback()
      }
    },
    /**
     * @description 限制特殊字符
     */
    noSpecialCharacter (rule, value, callback) {
      if (!value) {
        callback(new Error('请填写修图机构名称'))
      } else if (!(/^[\u4E00-\u9FA5A-Za-z0-9_]+$/g).test(value)) {
        callback(new Error('不可输入特殊字符'))
      } else {
        callback()
      }
    },
    validateToData (rule, value, callback) {
      if (!this.institutionConfig.toData.length) {
        this.$newMessage.warning('请选择可接产品')
        callback(new Error('请选择可接产品'))
      } else {
        callback()
      }
    },
    validateIncomeConfig (rule, value, callback) {
      const isAllNum = value.every(item => Boolean(Number(item)))
      if (!isAllNum) {
        callback(new Error('请输入正确收益配置'))
      } else {
        callback()
      }
    }
  }
}
</script>

<style lang="less">
.edit-retouch-institution {
  .config-list {
    .el-form {
      .el-form-item {
        .el-form-item__content {
          & > .el-input {
            width: 400px;
          }

          .list-data {
            display: grid;
            grid-template-columns: repeat(10, 1fr);
            grid-gap: 1px;
            background-color: #808080;
            border: 1px solid #808080;

            .panel {
              text-align: center;

              .list-title {
                background-color: #eee;
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
      }
    }

    .product-panel {
      width: 800px;
    }
  }
}
</style>
