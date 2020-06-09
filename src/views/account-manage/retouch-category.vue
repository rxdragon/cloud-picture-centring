<template>
  <div class="retouch-category page-class">
    <transition name="fade" mode="out-in">
      <div v-if="!showEdit" class="main">
        <div class="header">
          <h3>修图类型配置</h3>
          <el-button type="primary" @click="editCateGory()">添加修图类别</el-button>
        </div>
        <div class="search-box">
          <div class="category-box search-item">
            <span>修图类别名称</span>
            <retouch-type-select v-model="retouchClassId" />
          </div>
          <div class="button-box">
            <el-button type="primary" @click="getList(1)">查 询</el-button>
          </div>
        </div>
        <div class="table-box">
          <el-table :data="tableData" style="width: 100%;">
            <el-table-column prop="name" label="修图类别名称" />
            <el-table-column label="最近操作时间">
              <template slot-scope="scope">
                {{ scope.row.updated_at | toTimeSpan }}
              </template>
            </el-table-column>
            <el-table-column prop="nickname" label="操作人" />
            <el-table-column label="操作人">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="editCateGory(scope.row)">编辑</el-button>
                <el-button type="danger" size="mini" @click="deleteCategory(scope.row.id)">删除</el-button>
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
      <edit-category
        v-else
        :edit-data="editData"
        :show-edit.sync="showEdit"
        @finishedEdit="finishedEdit"
      />
    </transition>
  </div>
</template>
<script>
import EditCategory from './components/EditCategory'
import RetouchTypeSelect from '@SelectBox/RetouchTypeSelect'
import * as AccountManage from '@/api/accountManage'

export default {
  name: 'RetouchCategory',
  components: { EditCategory, RetouchTypeSelect },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      showEdit: false, // 是否编辑
      retouchClassId: 0, // 修图类别
      pager: {
        page: 1,
        pageSize: 10,
        total: 10
      },
      tableData: [], // 列表数据
      editData: null // 编辑数据
    }
  },
  created () {
    this.getList()
  },
  methods: {
    /**
     * @description 监听完成编辑
     * @param {*} row
     */
    editCateGory (row) {
      this.editData = row
      this.showEdit = true
    },
    /**
     * @description 监听自组件完成
     * @param {*} row
     */
    finishedEdit (row) {
      this.showEdit = false
      this.getList()
    },
    /**
     * @description 删除修图类型
     * @param {*} id
     */
    deleteCategory (id) {
      this.$confirm('确认删除该修图类型吗？', '', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        const req = { retoucherClassId: id }
        try {
          this.$store.dispatch('setting/showLoading', this.routeName)
          const data = await AccountManage.delRetoucherClass(req)
          if (data) {
            this.$newMessage.success('删除成功!')
            this.getList()
          }
        } catch (error) {
          this.$store.dispatch('setting/hiddenLoading', this.routeName)
          console.error(error)
        }
      }).catch()
    },
    /**
     * @description 获取列表参数
     */
    getParams () {
      const req = {
        page: this.pager.page,
        pageSize: this.pager.pageSize
      }
      if (this.retouchClassId) {
        req.retouchClassId = this.retouchClassId
      }
      return req
    },
    /**
     * @description 监听页面变化
     */
    handleCurrentChange () {
      this.getList()
    },
    /**
     * @description 获取修图列表
     * @param {*} value
     */
    getList (value) {
      if (value) {
        this.pager.page = value
      }
      this.$store.dispatch('setting/showLoading', this.routeName)
      const req = this.getParams()
      AccountManage.getRetoucherClassList(req)
        .then(data => {
          this.tableData = data.list
          this.pager.total = data.total
          this.$store.dispatch('setting/hiddenLoading', this.routeName)
        })
    }
  }
}
</script>

<style lang="less">
.retouch-category {
  .main {
    .search-box {
      .category-box {
        .el-input {
          width: 220px;
        }
      }

      .button-box {
        .el-button {
          margin-left: 20px;
        }
      }
    }
  }
}
</style>
