<template>
  <div class="account-config">
    <div v-if="!showEdit" class="main">
      <div class="header">
        <h3>账号配置</h3>
        <el-button type="primary" @click="creationAccount()">添加账号</el-button>
      </div>
      <div class="search-box">
        <div class="staff-box search-item">
          <span class="staff-label">伙伴</span>
          <el-input
            v-model.trim="staffName"
            placeholder="请输入您要查询的伙伴"
            @keyup.native.enter="getStaffListByPage(1)"
          />
        </div>
        <div class="role-box search-item">
          <span>角色组</span>
          <role-select v-model="roleValue" />
        </div>
        <div class="button-box">
          <el-button type="primary" @click="getStaffListByPage(1)">查 询</el-button>
        </div>
      </div>
      <div class="table-box">
        <el-table :data="tableData" style="width: 100%">
          <el-table-column prop="id" label="工号" />
          <el-table-column prop="name" label="伙伴姓名" />
          <el-table-column prop="position_text" label="岗位" />
          <el-table-column prop="role" label="角色组">
            <template slot-scope="scope">{{ roleMap[scope.row.role] }}</template>
          </el-table-column>
          <el-table-column prop="status" label="状态" />
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="creationAccount(scope.row)">编辑</el-button>
              <el-button v-if="!scope.row.account_available" type="success" size="mini" @click="enableStaff(scope.row.id)">启动</el-button>
              <el-button v-else type="danger" size="mini" @click="disableStaff(scope.row.id)">禁用</el-button>
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
    <add-account v-else :edit-data="editData" :show-edit.sync="showEdit" @finished="finishedAccount" />
  </div>
</template>

<script>
import AddAccount from './components/AddAccount'
import RoleSelect from '@SelectBox/RoleSelect'
import * as AccountManage from '@/api/accountManage.js'
import * as Staff from '@/api/staff.js'

export default {
  name: 'AccountConfig',
  components: { AddAccount, RoleSelect },
  data () {
    return {
      postValue: 0,
      roleValue: 0,
      staffName: null, // 伙伴信息
      tableData: [],
      roleMap: {},
      pager: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      showEdit: false,
      editData: null
    }
  },
  created () {
    this.getAllRole()
    this.getStaffListByPage()
  },
  methods: {
    /**
     * @description 跳转编辑页面
     * @param {*} row
     */
    creationAccount (row) {
      console.log(1)
      this.editData = row
      console.log(row)
      this.showEdit = true
    },
    /**
     * @description 获取角色组列表
     */
    finishedAccount () {
      console.log(2)
      this.getStaffListByPage()
      this.showEdit = false
    },
    /**
     * @description 处理数据
     */
    getParams () {
      const req = {
        page: this.pager.page,
        pageSize: this.pager.pageSize
      }
      if (this.staffName) { req.staffName = this.staffName }
      if (this.roleValue) { req.roleId = this.roleValue }
      return req
    },
    /**
     * @description 监听页面变化
     */
    handleCurrentChange () {
      this.getStaffListByPage()
    },
    /**
     * @description 获取伙伴信息
     * @param {*} value
     */
    getStaffListByPage (value) {
      if (value) { this.pager.page = value }
      const req = this.getParams()
      this.$store.dispatch('setting/showLoading')
      AccountManage.getStaffListByPage(req)
        .then(data => {
          console.log(data)
          this.tableData = data.list
          this.pager.total = data.total
          this.$store.dispatch('setting/hiddenLoading')
        })
    },
    /**
     * @description 启用伙伴
     * @param {*} staffId
     */
    enableStaff (staffId) {
      const req = { staffId }
      this.$store.dispatch('setting/showLoading')
      AccountManage.enableStaff(req)
        .then(res => {
          this.$newMessage.success('启用成功')
          this.getStaffListByPage()
        })
    },
    /**
     * @description 禁用伙伴
     * @param {*} staffId
     */
    disableStaff (staffId) {
      const req = { staffId }
      this.$store.dispatch('setting/showLoading')
      AccountManage.disableStaff(req)
        .then(res => {
          this.$newMessage.success('禁用成功!')
          this.getStaffListByPage()
        })
    },
    /**
     * @description 获取所有角色列表 (和组件重复请求)
     */
    async getAllRole () {
      const list = await Staff.getAllRole()
      const map = {}
      list.map(item => {
        map[item.id] = item.name
      })
      this.roleMap = map
    }
  }
}
</script>
<style lang="less" scoped>
@import "~@/styles/variables.less";
.account-config {
  .main {
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .search-box {
      display: flex;

      .staff-label {
        width: 40px;
      }
    }

    .table-box {
      box-shadow: @boxShadow;
      margin-top: 20px;
    }
  }
}
</style>
