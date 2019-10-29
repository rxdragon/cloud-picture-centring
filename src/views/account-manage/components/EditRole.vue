<template>
  <div class="edit-role">
    <div class="header">
      <h3>{{ isNewAdd?'新增角色组':'编辑角色组' }}</h3>
      <el-button type="info" @click="toBack">返回</el-button>
    </div>
    <div class="role-name search-item">
      <span>角色组名称</span>
      <el-input v-model="roleName" v-maxLength16 placeholder="请输入角色组名称" />
    </div>
    <div class="jurisdiction-box search-item">
      <span>权限模块</span>
      <jurisdiction v-model="hasPermission" />
    </div>
    <div class="submit-box">
      <el-button type="primary" @click="onSubmit">提交</el-button>
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
        this.$store.dispatch('setting/showLoading', this.$route.name)
        if (this.isNewAdd) return false
        const reqData = {
          roleId: this.roleId,
          additionInfo: true
        }
        const data = await AccountManage.getRoleInfo(reqData)
        this.roleName = data.title
        const permissions = data.permissions.flatMap(permissionItem => [permissionItem.permission_id])
        this.hasPermission = permissions
        this.$store.dispatch('setting/hiddenLoading', this.$route.name)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.$route.name)
        throw new Error(error)
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
          this.$store.dispatch('setting/hiddenLoading', this.$route.name)
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
      this.$store.dispatch('setting/showLoading', this.$route.name)
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
