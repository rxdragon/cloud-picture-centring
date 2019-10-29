<template>
  <div class="add-account">
    <div class="header">
      <h3>{{ editData ? '编辑账号' : '新增账号' }}</h3>
      <el-button type="info" @click="toBack">返回</el-button>
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
          <div class="retouch-select search-item">
            <span>修图类别</span>
            <retouch-type-select v-model="retouchSelectType" import-model />
          </div>
          <div class="product-box search-item">
            <span>可接产品</span>
            <product-panel
              :default-checked-keys="defaultCheckedKeys"
              :is-loading-down.sync="isLoadingDown"
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
            <role-select v-model="roleValue" />
          </div>
          <div class="role-module search-item">
            <span>权限模块</span>
            <jurisdiction v-model="hasPermission" />
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
import RetouchTypeSelect from '@SelectBox/RetouchTypeSelect'
import RoleSelect from '@SelectBox/RoleSelect'

import * as AccountManage from '@/api/accountManage.js'
import * as Staff from '@/api/staff.js'

export default {
  name: 'AddAccount',
  components: { ProductPanel, Jurisdiction, RetouchTypeSelect, RoleSelect },
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
      jobNumber: '', // 伙伴工号
      activeName: 'retouchCategory', // retouchCategory 修图类别 role 角色权限配置
      retouchSelectType: '', // 修图列表选项
      roleValue: '', // 权限值
      toData: [], // 产品选中数据
      isLoadingDown: false, // 产品模块 是否加载完成
      defaultCheckedKeys: [], // 默认选中产品
      hasPermission: [], // 默认选中权限
      staffInfo: {}, // 用户信息
      roleList: [] // 权限列表
    }
  },
  computed: {
    // 是否编辑
    isEdit () {
      const data = this.editData || {}
      return Object.keys(data).length
    }
  },
  watch: {
    isLoadingDown (value) {
      if (value && this.isEdit) {
        const productIds = this.editData.staff_product.map(item => item.id)
        this.defaultCheckedKeys = productIds
      }
    }
  },
  created () {
    if (this.isEdit) {
      this.jobNumber = this.editData.id
      this.getStaffInfo()
      this.staffInfo = { ...this.editData }
      this.roleValue = this.editData.role
      this.retouchSelectType = this.editData.retoucher_class_id
      this.getStaffPermission()
    }
  },
  methods: {
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
      if (!this.retouchSelectType && !this.toData.length) {
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
        retoucherClass: this.retouchSelectType,
        roleId: this.roleValue,
        permissionIds: this.hasPermission
      }
      this.toData.forEach(listItem => {
        const childrenIds = listItem.children.map(item => item.id)
        req.productIds = [...req.productIds, ...childrenIds]
      })
      return req
    },
    /**
     * @description 添加伙伴
     * @param {*} params
     */
    addStaff () {
      const req = this.getParams()
      if (!req) return
      this.$store.dispatch('setting/showLoading', this.$route.name)
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
    updateStaff () {
      const req = this.getParams()
      if (!req) return
      this.$store.dispatch('setting/showLoading', this.$route.name)
      AccountManage.editStaff(req).then(() => {
        this.$newMessage.success('修改成功!')
        this.$emit('finished')
      })
    },
    /**
     * @description 重置未保存配置
     */
    resetParams () {
      this.hasPermission = []
      this.retouchSelectType = ''
      this.roleValue = ''
    },
    /**
     * @description 查询伙伴
     */
    getStaff () {
      if (!this.jobNumber) {
        this.$newMessage.warning('请输入伙伴工号')
        return false
      }
      const req = { staffNum: this.jobNumber }
      this.$store.dispatch('setting/showLoading', this.$route.name)
      Staff.getStaff(req)
        .then(data => {
          this.staffInfo = data
          this.resetParams()
          this.$store.dispatch('setting/hiddenLoading', this.$route.name)
        })
    },
    /**
     * @description 获取伙伴信息
     */
    getStaffInfo () {
      if (!this.jobNumber) { return false }
      const req = { staffNum: this.jobNumber }
      this.$store.dispatch('setting/showLoading', this.$route.name)
      Staff.getStaffInfo(req)
        .then(data => {
          this.staffInfo = data
          this.$store.dispatch('setting/hiddenLoading', this.$route.name)
        })
    },
    /**
     * @description 获取伙伴权限
     */
    getStaffPermission () {
      if (!this.jobNumber) { return false }
      const req = { staffNum: this.jobNumber }
      this.$store.dispatch('setting/showLoading', this.$route.name)
      AccountManage.getStaffPermission(req)
        .then(data => {
          this.hasPermission = data.base_auth.map(item => item.id)
          this.$store.dispatch('setting/hiddenLoading', this.$route.name)
        })
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

  .retouch-category-box {

    .retouch-select {
      margin: 24px 0;
    }

    .product-box  {
      align-items: flex-start;

      .product-panel {
        width: 800px;
      }
    }

    .button-box {
      margin-top: 24px;
      width: 856px;
      padding-left: 56px;
      text-align: center;
    }
  }

  .role-box {
    padding: 20px;
    .role-module,
    .role-search {
      margin-bottom: 24px;

      &>span {
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

  .submit-box {
    text-align: center;
  }

  .main-content {
    margin-top: 0;
  }

  .el-tabs {
    margin-top: 24px;
  }
}
</style>
