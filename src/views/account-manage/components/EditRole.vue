<template>
  <div class="edit-role">
    <div class="header">
      <h3>{{ isNewAdd?'新增角色组':'编辑角色组' }}</h3>
      <div class="button-box">
        <el-button type="primary" plain @click="toBack">返回</el-button>
        <el-button type="primary" @click="onSubmit">提交</el-button>
      </div>
    </div>
    <div class="role-name search-item">
      <span>角色组名称</span>
      <el-input v-model="roleName" v-maxLength16 placeholder="请输入角色组名称" />
    </div>
    <div class="jurisdiction-box module-panel">
      <div class="panel-title">权限模块</div>
      <jurisdiction v-model="hasPermission" />
    </div>
  </div>
</template>

<script>
import Jurisdiction from '@/components/Jurisdiction'

import * as AccountManage from '@/api/accountManage.js'
export default {
  name: 'EditRole',
  components: { Jurisdiction },
  props: {
    roleId: { type: [Array, String, Number], default: '' }
  },
  data () {
    return {
      routeName: this.$route.name,
      roleName: '',
      hasPermission: [],
      isNewAdd: true
    }
  },
  created () {
    if (this.roleId) { this.isNewAdd = false }
    this.getRoleInfo()
  },
  methods: {
    /**
     * @description 返回上一级
     */
    toBack () {
      this.$emit('update:showEdit', false)
    },
    /**
     * @description 获取权限信息
     */
    async getRoleInfo () {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        if (this.isNewAdd) {
          this.$store.dispatch('setting/hiddenLoading', this.routeName)
          return false
        }
        const reqData = {
          roleId: this.roleId,
          additionInfo: true
        }
        const data = await AccountManage.getRoleInfo(reqData)
        this.roleName = data.title
        const permissions = data.permissions.flatMap(permissionItem => [permissionItem.permission_id])
        this.hasPermission = permissions
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    },
    /**
     * @description 添加权限
     */
    addRole () {
      if (!this.roleName) {
        this.$newMessage.warning('请填写角色组名称')
        return false
      }
      if (!this.hasPermission.length) {
        this.$newMessage.warning('请勾选权限')
        return false
      }
      const reqData = {
        title: this.roleName,
        permissionIds: this.hasPermission
      }
      AccountManage.addRole(reqData)
        .then(() => {
          this.$store.dispatch('setting/hiddenLoading', this.routeName)
          this.$newMessage.success('添加角色组成功')
          this.toBack()
        })
    },
    /**
     * @description 编辑角色组
     */
    editRole () {
      const reqData = {
        roleId: this.roleId,
        permissionIds: this.hasPermission,
        title: this.roleName
      }
      this.$store.dispatch('setting/showLoading', this.routeName)
      AccountManage.editRole(reqData)
        .then(() => {
          this.$newMessage({
            message: '编辑成功',
            type: 'success',
            duration: 1500,
            onClose: () => {
              this.toBack()
            }
          })
        })
    },
    /**
     * @description 监听提交按钮
     */
    onSubmit () {
      if (this.isNewAdd) {
        this.addRole()
      } else {
        this.editRole()
      }
    }
  }
}
</script>

<style lang="less">
.edit-role {
  .role-name {
    margin-bottom: 24px;

    .el-input {
      width: 220px;
    }
  }

  .jurisdiction-box {
    align-items: flex-start;

    .panel-title {
      margin-bottom: 20px;
    }
  }

  .search-item {
    &>span {
      display: inline-block;
      width: 70px;
    }
  }

  .submit-box {
    text-align: center;
    margin-top: 20px;
  }
}
</style>
