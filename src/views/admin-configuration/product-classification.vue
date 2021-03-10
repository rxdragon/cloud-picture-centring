<template>
  <div class="product-classification">
    <div class="header">
      <h3>产品分类管理</h3>
    </div>

    <div class="product-main-list">
      <el-tabs v-model="activeClassificationId">
        <el-tab-pane
          v-for="classItem in classificationList"
          :key="classItem.id"
          :label="classItem.name"
          :name="classItem.id"
        >
        </el-tab-pane>
        <div
          class="table-box"
          :class="{'no-border': activeClassificationId === firstClassifiicationId}"
        >
          <!-- 添加分类按钮 -->
          <div class="button-plug" v-if="classificationList.length">
            <el-button type="primary" size="mini" @click="addClassification">添加分类</el-button>
          </div>
          <el-table :data="tableData" style="width: 100%;">
            <el-table-column prop="date" label="分类名称" width="180" />
            <el-table-column prop="name" label="归类产品数量" width="180" />
            <el-table-column prop="address" label="创建人" />
            <el-table-column prop="address" label="创建时间" />
            <el-table-column prop="address" label="操作">
              <template slot-scope="{ row }">
                <el-button type="primary" size="mini" @click="editClassificationName(row)">修改</el-button>
                <el-button type="primary" size="mini" @click="linkToProductPage(row)">查看归类产品</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tabs>
    </div>

    <!-- 添加分类弹框 -->
    <el-dialog
      :title="isEdit ? '修改分类名称' : '添加分类'"
      width="30%"
      top="30vh"
      center
      custom-class="product-class-dialog"
      :show-close="false"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
    >
      <el-form ref="form" label-width="80px">
        <el-form-item label="分类名称">
          <el-input
            v-model="editName"
            placeholder="请输入分类名称"
            show-word-limit
            maxlength="8"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" @click="handleClose">取 消</el-button>
        <el-button
          size="medium"
          type="primary"
          :loading="submitLoading"
          @click="submitEditClassification"
        >
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as ProductClassificationApi from '@/api/productClassificationApi.js'

export default {
  name: 'ProductClassification',
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      activeClassificationId: '', // 当前激活状态id
      firstClassifiicationId: '', // 第一个classid 用于控制样式
      editClassificationId: '', // 当前编辑的分类id
      classificationList: [], // 分类列表
      tableData: [], // 表格数据
      isEdit: false, // 是否处于编辑状态
      dialogVisible: false,
      submitLoading: false,
      editName: '', // 处理编辑名称
    }
  },
  watch: {
    activeClassificationId: {
      handler (value) {
        if (Number(value)) {
          this.getActiveClassList()
        }
      }
    }
  },
  async created () {
    await this.getParentClassList()
  },
  methods: {
    /**
     * @description 修改产品名称
     */
    editClassificationName (rowData) {
      this.editClassificationId = rowData.id
      this.isEdit = true
      this.editName = rowData.name
      this.dialogVisible = true
    },
    /**
     * @description 跳转到产品管理
     */
    linkToProductPage (rowData) {
      const query = { isCheckPass: true, id: rowData.id }
      this.$router.push({
        name: 'ProductControl',
        query
      })
     
    },
    /**
     * @description 添加产品分类
     */
    addClassification () {
      this.isEdit = false
      this.dialogVisible = true
    },
    /**
     * @description 确认编辑信息
     */
    submitEditClassification () {
      if (this.editName.length > 8) return this.$newMessage.warning('最大长度不能超过8个字符')
      if (this.isEdit) {
        // TODO 确认编辑接口
        try {
          this.submitLoading = true
          const req = {
            id: this.editClassificationId,
            name: this.editName
          }
          ProductClassificationApi.editClassification(req)
          const findEditItem = this.tableData.find(item => item.id === this.editClassificationId)
          if (findEditItem) {
            findEditItem.name = this.editName
          } else {
            this.getActiveClassList()
          }
          this.handleClose()
        } finally {
          this.submitLoading = false
        }
      } else {
        // TODO 确认添加接口
        try {
          this.submitLoading = true
          const req = {
            parentId: this.activeClassificationId,
            name: this.editName
          }
          ProductClassificationApi.addClassification(req)
          this.handleClose()

          this.$newMessage.success('生成分类成功')
          this.getActiveClassList()
        } finally {
          this.submitLoading = false
        }
      }
    },
    /**
     * @description 获取细类评分
     */
    getActiveClassList () {
      this.$store.dispatch('setting/hiddenLoading', this.routeName)
      try {
        const req = {
          id: this.activeClassificationId
        }
        this.tableData = ProductClassificationApi.getClassificationList(req)
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 弹框消失前 初始化默认值
     */
    handleClose () {
      console.error('handleClose')
      this.editClassificationId = ''
      this.isEdit = false
      this.editName = ''
      this.dialogVisible = false
    },
    /**
     * @description 获取父类分类数据
     */
    async getParentClassList () {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = ProductClassificationApi.getParentClassificationList()
        await this.$delayLoading(2000)
        this.classificationList = data
        this.activeClassificationId = this.classificationList[0].id
        this.firstClassifiicationId = this.classificationList[0].id
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.product-main-list {
  .table-box {
    margin-top: 0;
  }

  .button-plug {
    margin-bottom: 20px;
    text-align: right;
  }
}
</style>

<style lang="less">
.product-class-dialog {
  .el-dialog__body {
    padding: 10px 25px;
  }

  .el-form-item {
    margin: 0;
  }
}
</style>
