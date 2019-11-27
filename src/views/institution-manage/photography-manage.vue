<template>
  <div class="photography-manage">
    <div class="header">
      <h3>摄影机构管理</h3>
      <el-button type="primary" @click="addNewInstitution">新增摄影机构</el-button>
    </div>
    <div class="table-box">
      <el-table :data="tableData" style="width: 100%;">
        <el-table-column prop="name" label="机构名" />
        <el-table-column prop="loginType" label="登录方式" />
        <el-table-column prop="viscountNum" label="子账号数量" />
        <el-table-column label="当前状态">
          <template slot-scope="scope">
            {{ scope.row.state ? '启用' : '禁用' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template slot-scope="scope">
            <el-button v-if="!scope.row.state" type="success" size="mini" @click="enablePhotographerOrg(scope.row)">启用</el-button>
            <el-button v-else type="danger" size="mini" @click="disablePhotographerOrg(scope.row)">禁用</el-button>
            <el-button type="primary" size="mini" @click="editNewInstitution(scope.row)">修改</el-button>
            <el-button type="primary" size="mini" @click="checkProduct(scope.row)">查看产品</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 弹出框 -->
    <el-dialog :title="editInstitutionId ? '编辑摄影机构' : '新增摄影机构'" width="500px" :before-close="hiddenDialog" :visible.sync="dialogTableVisible">
      <el-form ref="formEdit" :model="institutionConfig" :rules="rules" label-position="left" label-width="108px">
        <el-form-item label="机构名：" required prop="name">
          <el-input v-model="institutionConfig.name" maxlength="32" placeholder="请填写摄影机构名称" />
        </el-form-item>
        <el-form-item>
          <el-radio-group v-model="institutionConfig.loginType">
            <el-radio :label="1">直接通信</el-radio>
            <el-radio :label="2">密码登录</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="institutionConfig.loginType === 2" prop="account" required label="机构主账号：">
          <el-input v-model="institutionConfig.account" maxlength="16" placeholder="请填写摄影机构主账号，请勿使用特殊字符" class="accountInput" />
        </el-form-item>
        <el-form-item v-if="institutionConfig.loginType === 2" label="机构密码：">
          <el-input v-model="institutionConfig.secret" maxlength="16" type="password" placeholder="未有特殊密码要求可不用填写" />
        </el-form-item>
        <el-form-item v-if="institutionConfig.loginType === 2" prop="code" required label="机构代号：">
          <el-input v-model="institutionConfig.code" :disabled="Boolean(editInstitutionId)" maxlength="16" placeholder="请填写摄影机构代号" />
        </el-form-item>
        <el-form-item>
          <el-button type="info" @click="hiddenDialog">取消</el-button>
          <el-button type="primary" @click="onSubmit">提交</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import * as Institution from '@/api/institution.js'

export default {
  name: 'PhotographyManage',
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
        ]
      },
      tableData: [], // 列表数据
      dialogTableVisible: false, // 是否显示弹出框
      institutionConfig: {
        name: '',
        loginType: 1,
        account: '',
        secret: '',
        code: ''
      },
      editInstitutionId: ''
    }
  },
  async created () {
    try {
      this.$store.dispatch('setting/showLoading', this.routeName)
      await this.getPhotographerOrgList()
    } catch (error) {
      this.$store.dispatch('setting/hiddenLoading', this.routeName)
    }
  },
  methods: {
    /**
     * @description 添加摄影机构
     */
    addNewInstitution () {
      this.dialogTableVisible = true
    },
    /**
     * @description 修改摄影机构信息
     */
    async editNewInstitution (item) {
      const reqData = {
        photographerOrgId: item.id
      }
      const data = await Institution.getPhotographerOrgInfo(reqData)
      this.institutionConfig.name = data.name
      this.institutionConfig.loginType = data.type === 'api' ? 1 : 2
      this.institutionConfig.account = data.account
      this.institutionConfig.code = data.code
      this.editInstitutionId = item.id
      this.dialogTableVisible = true
    },
    /**
     * @description 关闭并且初始化弹出框数据
     */
    hiddenDialog () {
      this.institutionConfig = {
        name: '',
        loginType: 1,
        account: '',
        secret: '',
        code: ''
      }
      this.editInstitutionId = ''
      this.dialogTableVisible = false
      this.$refs['formEdit'].resetFields()
    },
    /**
     * @description 查看产品
     */
    checkProduct (item) {
      this.$router.push({
        name: 'ProductControl',
        query: {
          isCheckPass: true,
          photographerOrgId: item.id
        }
      })
    },
    /**
     * @description 获取摄影机构列表
     */
    async getPhotographerOrgList () {
      this.tableData = await Institution.getPhotographerOrgList()
      this.$store.dispatch('setting/hiddenLoading', this.routeName)
    },
    /**
     * @description 启用摄影机构
     * @param {*} item
     */
    enablePhotographerOrg (item) {
      this.$confirm('是否启用该摄影机构？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        center: true
      }).then(() => {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const reqData = { photographerOrgId: item.id }
        Institution.enablePhotographerOrg(reqData)
          .then(() => {
            this.$newMessage.success('机构启用成功')
            this.$store.dispatch('setting/hiddenLoading', this.routeName)
            item.state = true
          })
      }).catch(() => {})
    },
    /**
     * @description 禁用摄影机构
     */
    disablePhotographerOrg (item) {
      this.$confirm('是否禁用该摄影机构？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        center: true
      }).then(() => {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const reqData = { photographerOrgId: item.id }
        Institution.disablePhotographerOrg(reqData)
          .then(() => {
            this.$newMessage.success('机构禁用成功')
            this.$store.dispatch('setting/hiddenLoading', this.routeName)
            item.state = false
          })
      }).catch(() => {})
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
        callback(new Error('请填写摄影机构名称'))
      } else if (!(/^[\u4E00-\u9FA5A-Za-z0-9_]+$/g).test(value)) {
        callback(new Error('不可输入特殊字符'))
      } else {
        callback()
      }
    },
    /**
     * @description 添加摄影机构
     */
    async addPhotographerOrg () {
      const reqData = {
        name: this.institutionConfig.name,
        type: this.institutionConfig.loginType === 1 ? 'api' : 'secret'
      }
      if (this.institutionConfig.loginType === 2) {
        reqData.account = this.institutionConfig.account
        reqData.code = this.institutionConfig.code
        if (this.institutionConfig.secret) { reqData.secret = this.institutionConfig.secret }
      }
      this.$refs['formEdit'].validate()
        .then(() => {
          this.$store.dispatch('setting/showLoading', this.routeName)
          Institution.addPhotographerOrg(reqData)
            .then(() => {
              this.$newMessage.success('添加成功')
              this.hiddenDialog()
              this.getPhotographerOrgList()
            })
            .catch(() => {
              this.$store.dispatch('setting/hiddenLoading', this.routeName)
            })
        })
        .catch(() => {})
    },
    /**
     * @description 编辑摄影机构
     */
    async editPhotographerOrg () {
      const reqData = {
        photographerOrgId: this.editInstitutionId,
        type: this.institutionConfig.loginType === 1 ? 'api' : 'secret',
        name: this.institutionConfig.name
      }
      if (this.institutionConfig.loginType === 2) {
        reqData.account = this.institutionConfig.account
        if (this.institutionConfig.secret) { reqData.secret = this.institutionConfig.secret }
      }
      this.$refs['formEdit'].validate()
        .then(() => {
          this.$store.dispatch('setting/showLoading', this.routeName)
          Institution.editPhotographerOrg(reqData)
            .then(() => {
              this.$newMessage.success('编辑成功')
              this.hiddenDialog()
              this.getPhotographerOrgList()
            })
            .catch(() => {
              this.$store.dispatch('setting/hiddenLoading', this.routeName)
            })
        })
        .catch(() => {})
    },
    /**
     * @description 验证参数
     */
    verificationParam () {
      return this.$refs['formEdit'].validate()
    },
    /**
     * @description 监听提交按钮
     */
    onSubmit () {
      if (this.editInstitutionId) {
        this.editPhotographerOrg()
      } else {
        this.addPhotographerOrg()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.photography-manage {
  .table-box {
    margin-top: 0;
  }
}
</style>
