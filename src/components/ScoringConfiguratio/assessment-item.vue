<template>
  <div class="assessment-item">
    <div class="add-group-wrap">
      <el-button @click="handleAddGroup" size="mini">添加评分项</el-button>
    </div>
    <div class="table-group"  v-for="(item, index) in groupList" :key="index">
      <div class="table-nav">
        <div class="left">
          <el-input
            maxlength="8"
            v-no-special-chinese
            placeholder="请填写评分项名称"
            v-if="item.isEdit"
            v-model="item.edit_mainName"
          >
          </el-input>
          <span v-else>{{ item.mainName }}</span>
        </div>
        <div class="right">
          <div @click="handleDeleteScoreGroup(item)">删除</div>
          <div @click="handleEditScoreGroup(item)">编辑</div>
        </div>
      </div>
      <el-table :data="item.configData" style="width: 100%;">
        <el-table-column prop="name" label="问题程度" align="center"></el-table-column>
        <el-table-column prop="score" label="分值" align="center">
          <template slot-scope="{ row }">
            <el-input
              v-if="item.isEdit"
              v-numberOnly
              type="number"
              min="0"
              max="100"
              v-model="row.edit_score"
            ></el-input>
            <span v-else>{{ row.type === 'add' ? row.score : '-' + row.score }}</span>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-bottom" v-if="item.isEdit">
        <el-button type="info" @click="handleCancelSoreItemChange(item)">
          取消
        </el-button>
        <el-button type="primary" @click="handleSaveScoreItem(item)">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'GradeConfigurationMainItem',
  props: {
    groupList: Array
  },
  methods: {
    // 删除
    handleDeleteScoreGroup (item) {
      this.$confirm('是否确定删除该评分项?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$emit('delete-score-item', item.id)
      }).catch(() => {
        // not
      })
    },
    /**
     * 编辑
     * @param group
     */
    handleEditScoreGroup (group) {
      this.$emit('edit-score-item', group.id)
    },
    // 添加评分项
    handleAddGroup () {
      this.$emit('add-score-group')
    },
    handleSaveScoreItem (item) {
      const hasError = item.configData.some(scoreItem => {
        return scoreItem.edit_score === undefined || scoreItem.edit_score === ''
      })
      if (hasError) {
        this.$message.error('请填写分值')
        return
      }
      const hasDuplicate = this.groupList.some(group => {
        return group.id !== item.id && group.mainName === item.edit_mainName
      })
      if (hasDuplicate) {
        this.$message.error('存在相同的评分项。')
        return
      }
      if (!item.edit_mainName) {
        this.$message.error('请填写评分项名称')
        return
      }
      this.$emit('save-score-item', item.id)
    },
    handleCancelSoreItemChange (item) {
      if (item.isNew) {
        this.$emit('delete-score-item', item.id)
        return
      }
      this.$emit('cancel-score-item-change', item.id)
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
