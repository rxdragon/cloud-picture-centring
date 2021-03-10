<template>
  <div class="assessment-item">
    <div class="add-group-wrap">
      <el-button @click="handleAddGroup" size="mini">添加评分项</el-button>
    </div>
    <div class="table-group"  v-for="(item, index) in data" :key="index">
      <div class="table-nav">
        <div class="left">
          <el-input v-if="item.isEdit" v-model="item.groupName"></el-input>
          <span v-else>{{ item.groupName }}</span>
        </div>
        <div class="right">
          <div @click="handleDeleteCategory(item)">删除</div>
          <div @click="handleEditCategory(item)">编辑</div>
        </div>
      </div>
      <el-table :data="item.data" style="width: 100%;">
        <el-table-column prop="wenti" label="问题程度" align="center"></el-table-column>
        <el-table-column prop="score" label="分值" align="center">
          <template slot-scope="{ row }">
            <el-input v-if="item.isEdit" v-model="row.score"></el-input>
            <span v-else>{{ row.score }}</span>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-bottom">
        <el-button type="info">取消</el-button>
        <el-button type="primary">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script>
const groupBase = {
  groupName: '',
  isEdit: true,
  data: [
    { id: 1, wenti: '小', score: 1 },
    { id: 2, wenti: '中', score: 2 },
    { id: 3, wenti: '拔草', score: 3 },
    { id: 4, wenti: '种草', score: 4 },
  ]
}
export default {
  name: 'assessment-item',
  data () {
    return {
      categoryName: '',
      mode: '',
      data: [
        {
          groupName: '发型',
          isEdit: true,
          data: [
            {
              id: 1,
              wenti: 'q',
              score: 1
            },
            {
              id: 2,
              wenti: 'qe',
              score: 2
            }
          ]
        },
        {
          groupName: '发型1',
          isEdit: true,
          data: [
            {
              id: 1,
              wenti: 'q',
              score: 1
            },
            {
              id: 2,
              wenti: 'qe',
              score: 2
            }
          ]
        }
      ]
    }
  },
  methods: {
    // 删除
    handleDeleteCategory () {
      this.$confirm('是否确定删除该评分项?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //
      }).catch(() => {
        // not
      })
    },
    // 切换编辑模式
    handleEditCategory (group) {
      group.isEdit = !group.isEdit
    },
    // 添加评分项
    handleAddGroup () {
      this.data.push(Object.assign({}, groupBase))
    }
  }
}
</script>

<style scoped lang="less">

.assessment-item {
  .add-group-wrap {
    display: flex;
    justify-content: flex-end;
  }

  .table-group {
    padding: 10px;
    margin-bottom: 30px;
    background-color: #fff;

    .table-nav {
      display: flex;
      align-content: center;
      justify-content: space-between;
      margin-bottom: 10px;

      .right {
        display: flex;
        align-items: center;
      }
    }

    .table-bottom {
      display: flex;
      justify-content: center;
      margin-top: 10px;
    }
  }
}
</style>
