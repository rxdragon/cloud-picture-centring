<template>
  <div class="retouch-manage page-class">
    <transition name="fade" mode="out-in">
      <div v-if="!showEdit" class="institution-list">
        <div class="header">
          <h3>修图机构管理</h3>
          <el-button type="primary" @click="addRetouch">添加机构</el-button>
        </div>
        <div class="table-box">
          <el-table :data="tableData" style="width: 100%;">
            <el-table-column prop="name" label="机构名" />
            <el-table-column prop="code" label="机构代号" />
            <el-table-column label="创建时间">
              <template slot-scope="scope">
                {{ scope.row.created_at | toTimeSpan }}
              </template>
            </el-table-column>
            <el-table-column prop="subAccountCount" label="子账号数量" />
            <el-table-column label="当前状态">
              <template slot-scope="scope">
                {{ scope.row.state ? '启用' : '禁用' }}
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  v-if="!scope.row.state"
                  type="success"
                  size="mini"
                  @click="enableRetouchOrg(scope.row)"
                >
                  启动
                </el-button>
                <el-button
                  v-else
                  type="danger"
                  size="mini"
                  @click="disableRetouchOrg(scope.row)"
                >
                  禁用
                </el-button>
                <el-button type="primary" size="mini" @click="editRetouch(scope.row)">修改</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <edit-retouch-institution v-else :retouch-institution-id="retouchInstitutionId" :show-edit.sync="showEdit" />
    </transition>
  </div>
</template>

<script>
import EditRetouchInstitution from './components/EditRetouchInstitution'

import * as Institution from '@/api/institution'
export default {
  name: 'RetouchManage',
  components: { EditRetouchInstitution },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      showEdit: false,
      tableData: [],
      retouchInstitutionId: '' // 修图机构id
    }
  },
  watch: {
    showEdit: {
      handler: function (value) {
        if (!value) {
          this.retouchInstitutionId = ''
          this.getRetouchOrgList()
        }
      }
    }
  },
  created () {
    this.getRetouchOrgList()
  },
  methods: {
    /**
     * @description 新增修图机构
     */
    addRetouch () {
      this.showEdit = true
    },
    /**
     * @description 编辑修图机构
     */
    editRetouch (item) {
      this.showEdit = true
      this.retouchInstitutionId = item.id
    },
    /**
     * @description 获取修图机构列表
     */
    async getRetouchOrgList () {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        this.tableData = await Institution.getRetouchOrgList()
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    },
    /**
     * @description 启用机构
     * @param {*} item
     */
    enableRetouchOrg (item) {
      this.$confirm('是否启用该修图机构？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        center: true
      }).then(() => {
        const reqData = { retouchOrgId: item.id }
        this.$store.dispatch('setting/showLoading', this.routeName)
        Institution.enableRetouchOrg(reqData)
          .then(() => {
            this.$newMessage.success('修图机构启用成功')
            this.$store.dispatch('setting/hiddenLoading', this.routeName)
            item.state = true
          })
      }).catch()
    },
    /**
     * @description 禁用机构
     */
    disableRetouchOrg (item) {
      this.$confirm('是否禁用该修图机构？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        center: true
      }).then(() => {
        const reqData = { retouchOrgId: item.id }
        this.$store.dispatch('setting/showLoading', this.routeName)
        Institution.disableRetouchOrg(reqData)
          .then(() => {
            this.$newMessage.success('修图机构禁用成功')
            this.$store.dispatch('setting/hiddenLoading', this.routeName)
            item.state = false
          })
      }).catch()
    }
  }
}
</script>

<style lang="less" scoped>
.table-box {
  margin-top: 0;
}
</style>
