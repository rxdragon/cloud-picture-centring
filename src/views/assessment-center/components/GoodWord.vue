<template>
  <div class="good-word-area">
    <div class="top">
      <el-button type="primary" @click="showAdd">添加词典</el-button>
    </div>
    <el-table :data="goodWordList" style="width: 100%;">
      <el-table-column prop="name" label="词典" width="200"></el-table-column>
      <el-table-column prop="createdAt" label="创建时间"></el-table-column>
      <el-table-column prop="staffName" label="创建人" width="200"></el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button type="danger" @click="delWord(scope.row.id)" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 添加词典弹出框 -->
    <el-dialog
      width="35%"
      title="添加词典"
      center
      class="dialog"
      :visible.sync="showWordDialog"
    >
      <div class="content">
        <span>词典内容:</span>
        <el-input maxlength="15" v-model="goodWord" placeholder="请填写词典内容,最多15个字符"></el-input>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="showWordDialog = false">取 消</el-button>
        <el-button type="primary" @click="addWord">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as GradeConfiguration from '@/api/gradeConfiguration.js'

export default {
  name: 'GoodWord',
  components: { },
  props: {},
  data () {
    return {
      goodWord: '',
      showWordDialog: false,
      goodWordList: []
    }
  },
  created () {
    this.getGoodWordList()
  },
  methods: {
    /**
     * @description 词典列表
     */
    async getGoodWordList () {
      const res = await GradeConfiguration.getExcitationDirList()
      if (res) {
        this.goodWordList = res
      }
    },
    /**
     * @description 添加词典
     */
    async addWord () {
      if (!this.goodWord) {
        this.$message({
          type: 'warning',
          message: '激励词不能为空!'
        })
      }
      const res = await GradeConfiguration.addExcitationDir({
        name: this.goodWord
      })
      if (res) {
        this.$message({
          type: 'success',
          message: '添加成功!'
        })
        this.getGoodWordList()
        this.showWordDialog = false
      }
    },
    /**
     * @description 添加词典
     */
    delWord (id) {
      this.$confirm('确定要删除改词典吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.fetchDelWord(id)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    /**
     * @description 添加词典
     */
    async fetchDelWord (id) {
      const res = await GradeConfiguration.delExcitationDir({
        id,
      })
      if (res) {
        this.getGoodWordList()
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }
    },
    /**
     * @description 展示
     */
    showAdd () {
      this.showWordDialog = true
    }
    
  }
}
</script>

<style lang="less" scoped>
.good-word-area {
  .top {
    display: flex;
    justify-content: flex-end;
  }

  .dialog {
    .content {
      .el-input {
        width: 250px;
        margin: 10px;
      }
    }
  }
}
</style>
