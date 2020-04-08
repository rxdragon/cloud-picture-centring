<template>
  <div class="role-config page-class">
    <transition name="fade" mode="out-in">
      <div v-if="!showEdit" class="main">
        <div class="header">
          <h3>角色组配置</h3>
          <el-button type="primary" @click="editRole">添加角色组</el-button>
        </div>
        <div class="search-box">
          <div class="role-box search-item">
            <span>角色组名称</span>
            <el-input v-model.trim="roleName" @keyup.native.enter="getRoleList(1)" />
          </div>
          <div class="button-box">
            <el-button type="primary" @click="getRoleList(1)">查 询</el-button>
          </div>
        </div>
        <div class="table-box">
          <el-table :data="tableData" style="width: 100%;">
            <el-table-column prop="title" label="角色组名称" />
            <el-table-column prop="founder_name" label="操作人" />
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="editRole(scope.row)">编辑</el-button>
                <el-button type="danger" size="mini" @click="delRole(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页 -->
          <div class="page-box">
            <el-pagination
              :hide-on-single-page="true"
              :current-page.sync="pager.page"
              :page-size="pager.pageSize"
              layout="total, prev, pager, next, jumper"
              :total="pager.total"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
      <edit-role v-else :role-id="roleId" :show-edit.sync="showEdit" @update:showEdit="finishedEditRole" />
    </transition>
  </div>
</template>

<script>
import EditRole from './components/EditRole'

import * as AccountManage from '@/api/accountManage.js'

export default {
  name: 'RoleConfig',
  components: { EditRole },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      showEdit: false,
      roleName: '',
      pager: {
        page: 1,
        pageSize: 10,
        total: 10
      },
      tableData: [],
      roleId: ''
    }
  },
  watch: {
    showEdit: {
      handler: function (show) {
        if (!show) {
          this.roleId = ''
        }
      }
    }
  },
  created () {
    this.getRoleList()
  },
  methods: {
    /**
     * @description 页码更改
     */
    handleCurrentChange () {
      this.getRoleList()
    },
    /**
     * @description 编辑添加角色组
     */
    editRole (item) {
      this.showEdit = true
      this.roleId = item.role_id
    },
    /**
     * @description 编辑添加角色组
     */
    finishedEditRole () {
      this.showEdit = false
      this.getRoleList()
    },
    /**
     * @description 获取角色组列表
     */
    async getRoleList (page) {
      this.pager.page = page || this.pager.page
      const reqData = {
        page: this.pager.page,
        pageSize: this.pager.pageSize
      }
      if (this.roleName) {
        reqData.title = this.roleName
      }
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await AccountManage.getRoleList(reqData)
        this.tableData = data.list
        this.pager.total = data.total
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 删除角色组
     */
    delRole (item) {
      this.$confirm('确认删除该角色组吗？', '', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        try {
          const reqData = { roleId: item.role_id }
          this.$store.dispatch('setting/showLoading', this.routeName)
          await AccountManage.delRole(reqData)
          this.$newMessage.success('删除成功')
          this.getRoleList()
        } catch (error) {
          this.$store.dispatch('setting/hiddenLoading', this.routeName)
          console.error(error)
        }
      }).catch()
    }
  }
}
</script>

<style lang="less">
.role-config {
  .main {
    .search-box {
      .role-box {
        .el-input {
          width: 220px;
        }
      }
    }
  }
}
</style>
