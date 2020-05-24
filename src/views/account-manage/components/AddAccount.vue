<template>
  <div class="add-account">
    <div class="header">
      <h3>{{ isEdit ? '编辑账号' : '新增账号' }}</h3>
      <el-button type="primary" plain @click="toBack">返回</el-button>
    </div>
    <el-alert title="提示：请先输入伙伴工号或伙伴姓名进行相关查询后才可配置权限" type="info" show-icon />
    <div class="search-box">
      <div class="job-number-box search-item">
        <span>工号</span>
        <el-input v-model="jobNumber" v-numberOnly type="number" placeholder="请输入伙伴工号" />
      </div>
      <div v-if="!isEdit" class="button-box">
        <el-button type="primary" @click="getStaff">查询</el-button>
      </div>
    </div>
    <template v-if="staffInfo.nickname || staffInfo.name">
      <div class="staff-info-panel module-panel">
        <div class="staff-name">伙伴姓名/花名：{{ staffInfo.nickname || staffInfo.name }}</div>
        <div class="staff-post">岗位：{{ staffInfo.position_text }}</div>
      </div>
      <el-tabs v-model="activeName">
        <el-tab-pane label="修图类别配置" name="retouchCategory" />
        <el-tab-pane label="角色权限配置" name="role" />
      </el-tabs>
      <div class="table-box main-content" :class="{'no-border': activeName === 'retouchCategory'}">
        <!-- 修图类配置 -->
        <div v-show="activeName === 'retouchCategory'" class="retouch-category-box">
          <el-alert title="提示：若非修图伙伴请勿配置可接产品" type="info" show-icon />
          <!-- 修图等级，海草值，修图身份，修图类别选择-->
          <div class="retouch-select-box">
            <div class="search-item">
              <span>修图等级</span>
              <retouch-rank-select v-model="retouchRank" showAllOption @change="onRankChange"/>
            </div>
            <div class="search-item plant-search">
              <span>海草值</span>
              <el-input v-model="retouchExp" placeholder="根据修图等级自动调整"/>
              <p class="plant-tip" v-show="showPlantTip">提示：账号当前海草值为{{ originExp }}</p>
            </div>
            <div class="search-item">
              <span>修图身份</span>
              <retouch-kind-select v-model="retouchIdentity" placeholder="请选择修图身份"/>
            </div>
            <div class="search-item">
              <span>修图类别</span>
              <retouch-type-select v-model="retouchType" import-model />
            </div>
          </div>
          <div class="product-box search-item">
            <span>可接产品</span>
            <product-panel
              ref="product-panel"
              :default-checked-keys="defaultCheckedKeys"
              :disabled-checked="retouchClassProduct"
              :to-data.sync="toData"
            />
          </div>
          <div class="button-box">
            <el-button type="primary" @click="nextStep">下一步</el-button>
          </div>
        </div>
        <!-- 修图权限配置 -->
        <div v-if="activeName === 'role'" class="role-box">
          <div class="role-search search-item">
            <span>角色组名称</span>
            <role-select v-model="roleValue" @change="roleChange" />
          </div>
          <div class="role-module search-item">
            <span>权限模块</span>
            <jurisdiction v-model="hasPermission" :role-permission="rolePermissionArr" />
          </div>
          <div class="submit-box">
            <el-button v-if="!isEdit" type="primary" @click="addStaff">提交</el-button>
            <el-button v-else type="primary" @click="updateStaff">提交</el-button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import ProductPanel from '@/components/ProductPanel'
import Jurisdiction from '@/components/Jurisdiction'
import RoleSelect from '@SelectBox/RoleSelect'
import RetouchTypeSelect from '@SelectBox/RetouchTypeSelect'
import RetouchKindSelect from '@SelectBox/RetouchKindSelect'
import RetouchRankSelect from '@SelectBox/RetouchRankSelect'

import * as AccountManage from '@/api/accountManage.js'
import * as Staff from '@/api/staff.js'

export default {
  name: 'AddAccount',
  components: { ProductPanel, Jurisdiction, RoleSelect, RetouchTypeSelect, RetouchKindSelect, RetouchRankSelect },
  props: {
    editData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      routeName: this.$route.name,
      jobNumber: '', // 伙伴工号
      activeName: 'retouchCategory', // retouchCategory 修图类别 role 角色权限配置
      roleValue: '', // 权限值
      toData: [], // 产品选中数据
      defaultCheckedKeys: [], // 默认选中产品
      hasPermission: [], // 默认选中权限
      staffInfo: {}, // 用户信息
      roleList: [], // 权限列表
      staffPermission: [], // 用户个人权限
      rolePermissionArr: [], // 角色id
      retouchClassProduct: [], // 修图类别的可接产品
      retouchRank: '', // 修图等级 默认为一级
      retouchExp: 0, // 海草值
      retouchIdentity: '', // 修图身份
      retouchType: '', // 修图类别
      originExp: 0, // 初始海草值
      allRetouchRankExp: [], // 所有等级海草值列表
      allRetouchRank: {} // 所有修图师等级列表
    }
  },
  computed: {
    // 是否编辑
    isEdit () {
      const data = this.editData || {}
      return Object.keys(data).length
    },
    // 初始海草值是否显示
    showPlantTip () {
      return this.originExp !== parseFloat(this.retouchExp)
    }
  },
  watch: {
    staffInfo: {
      handler (value) {
        if (!Object.keys(this.staffInfo).length) return
        if (this.staffInfo.can_receive_product) {
          const productIds = this.staffInfo.can_receive_product.map(item => item.id)
          this.defaultCheckedKeys = productIds
        }
      },
      immediate: true
    },
    retouchType: {
      handler (value) {
        if (!value) {
          this.retouchClassProduct = []
          return
        }
        this.getRetoucherClassInfo(value)
      },
      immediate: true
    }
  },
  async created () {
    this.getAllLevelExp()
    this.getAllRetouchRankList()
    if (this.isEdit) {
      this.jobNumber = this.editData.id
      await this.getStaffInfo()
      this.roleValue = this.editData.role
      this.retouchType = this.editData.retoucher_class_id
      this.$store.dispatch('setting/showLoading', this.routeName)
      Promise.all([
        this.getRoleInfo(this.roleValue),
        this.getStaffPermission()
      ]).then(() => {
        this.resetPermission()
      }).catch(() => {
        this.$newMessage.error('初始化权限失败')
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      })
    }
  },
  methods: {
    /**
     * @description 获取修图类别能接产品
     */
    async getRetoucherClassInfo (id) {
      try {
        const req = { retoucherClassId: id }
        this.$refs['product-panel'].productLoading = true
        const data = await AccountManage.getRetoucherClassInfo(req)
        this.toData = []
        this.retouchClassProduct = data.products.map(item => item.id)
      } catch (error) {
        this.$newMessage.error(error.message || error)
        this.retouchClassProduct = []
      }
    },
    /**
     * @description 下一步
     */
    nextStep () {
      if (!this.validateParams()) {
        return false
      }
      this.activeName = 'role'
    },
    /**
     * @description 返回上一页
     */
    toBack () {
      this.$emit('update:showEdit', false)
    },
    /**
     * @description 配置参数验证
     */
    validateParams () {
      if (!this.jobNumber) {
        this.$newMessage.warning('请填写工号')
        return false
      }
      if (!this.retouchType && !this.toData.length) {
        this.$newMessage.warning('请选择修图类别或产品')
        return false
      }
      return true
    },
    /**
     * @description 获取参数
     */
    getParams () {
      if (!this.validateParams()) {
        return false
      }
      if (!this.roleValue) {
        this.$newMessage.warning('请选择角色组名称')
        return false
      }
      if (!this.hasPermission || !this.hasPermission.length) {
        this.$newMessage.warning('请选择权限')
        return false
      }
      const req = {
        staffNum: this.jobNumber,
        productIds: [],
        retoucherClass: this.retouchType,
        roleId: this.roleValue,
        permissionIds: this.hasPermission,
        level: Number(this.retouchRank),
        identity: this.retouchIdentity,
        exp: this.retouchExp
      }
      let productIds = []
      this.toData.forEach(listItem => {
        let childrenIds = listItem.children.map(item => {
          if (!this.retouchClassProduct.includes(item.id)) {
            return item.id
          }
        })
        childrenIds = childrenIds.filter(item => item)
        productIds = [...productIds, ...childrenIds]
      })
      req.productIds = productIds
      return req
    },
    /**
     * @description 添加伙伴
     * @param {*} params
     */
    addStaff () {
      const req = this.getParams()
      if (!req) return
      this.$store.dispatch('setting/showLoading', this.routeName)
      AccountManage.addStaff(req)
        .then(res => {
          if (res) {
            this.$newMessage.success('添加成功!')
            this.$emit('finished')
          }
        })
    },
    /**
     * @description 修改伙伴
     */
    async updateStaff () {
      try {
        const req = this.getParams()
        if (!req) return
        this.$store.dispatch('setting/showLoading', this.routeName)
        await AccountManage.editStaff(req)
        this.$newMessage.success('修改成功!')
        this.$emit('finished')
      } catch (error) {
        console.error(error)
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 重置未保存配置
     */
    resetParams () {
      this.hasPermission = []
      this.rolePermissionArr = []
      this.staffPermission = []
      this.retouchType = ''
      this.roleValue = ''
      this.originExp = 0
      this.retouchIdentity = 'blue'
      this.retouchRank = '1'
      this.retouchExp = 0
    },
    /**
     * @description 等级改变联动设置海草值
     */
    onRankChange (val) {
      if (val) {
        const expIndex = Number(val) - 1
        this.retouchExp = this.allRetouchRankExp[expIndex]
      }
    },
    /**
     * @description 查询伙伴
     */
    async getStaff () {
      if (!this.jobNumber) {
        this.$newMessage.warning('请输入伙伴工号')
        return false
      }
      try {
        const req = { staffNum: this.jobNumber }
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await Staff.getStaff(req)
        this.staffInfo = data
        this.resetParams()
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        console.error(error)
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 获取伙伴信息
     */
    async getStaffInfo () {
      if (!this.jobNumber) {
        return false
      }
      const req = { staffNum: this.jobNumber }
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await Staff.getStaffInfo(req)
        this.staffInfo = data
        this.retouchIdentity = _.get(data, 'info.identity') || ''
        this.retouchRank = String(_.get(data, 'info.level')) || ''
        this.retouchExp = parseFloat(_.get(data, 'info.exp') || 0)
        this.originExp = parseFloat(_.get(data, 'info.exp') || 0)
      } catch (error) {
        console.error(error)
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 获取伙伴权限
     */
    async getStaffPermission () {
      if (!this.jobNumber) {
        return false
      }
      const req = { staffNum: this.jobNumber }
      const data = await AccountManage.getStaffPermission(req)
      this.staffPermission = data.map(item => item.id)
    },
    /**
     * @description 获取角色组权限
     */
    async getRoleInfo (id) {
      try {
        const req = {}
        req.roleId = id
        req.additionInfo = false
        const data = await AccountManage.getRoleInfo(req)
        this.rolePermissionArr = data.permissions.map(item => item.permission_id)
      } catch (error) {
        console.error(error)
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 初始化用户权限
     */
    resetPermission () {
      const permissionSet = new Set([...this.staffPermission, ...this.rolePermissionArr])
      this.hasPermission = [...permissionSet]
      this.$store.dispatch('setting/hiddenLoading', this.routeName)
    },
    /**
     * @description 角色组变化
     */
    async roleChange () {
      this.$store.dispatch('setting/showLoading', this.routeName)
      this.staffPermission = []
      await this.getRoleInfo(this.roleValue)
      this.resetPermission()
    },
    /**
     * @description 获取等级海草值
     */
    async getAllLevelExp () {
      const data = await AccountManage.getAllLevelExp()
      this.allRetouchRankExp = data
    },
    /**
     * @description 获取全部修图等级
     */
    async getAllRetouchRankList () {
      const data = await AccountManage.getAllRetouchRank()
      this.allRetouchRank = data
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";

.add-account {
  .search-box {
    margin-top: 20px;

    .job-number-box {
      .el-input {
        width: 229px;
      }
    }
  }

  .staff-info-panel {
    display: flex;
    margin-top: 24px;

    .staff-name {
      margin-right: 20px;
    }
  }

  .role-box {
    padding: 20px;

    .role-module,
    .role-search {
      margin-bottom: 24px;

      & > span {
        display: inline-block;
        width: 70px;
      }
    }

    .role-module {
      align-items: flex-start;
    }

    .role-search {
      align-items: center;
    }
  }

  .retouch-category-box {
    .retouch-select-box {
      .search-item {
        margin: 24px 0;

        span {
          width: 56px;
        }

        .el-input {
          width: 194px;
        }
      }

      .plant-search {
        .plant-tip {
          padding: 10px 5px;
          font-size: 13px;
          color: red;
        }
      }
    }

    .product-box {
      align-items: flex-start;

      .product-panel {
        width: 800px;
      }
    }

    .button-box {
      width: 856px;
      padding-left: 68px;
      margin-top: 24px;
      text-align: left;
    }
  }

  .submit-box {
    padding-left: 82px;
    text-align: left;
  }

  .main-content {
    margin-top: 0;
  }

  .el-tabs {
    margin-top: 24px;
  }
}
</style>
