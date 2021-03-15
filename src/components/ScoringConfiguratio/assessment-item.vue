<template>
  <div class="assessment-item">
    <div class="add-group-wrap">
      <el-button @click="handleAddGroup" type="primary">添加评分项</el-button>
    </div>
    <div class="table-group"  v-for="(item, index) in groupList" :key="index">
      <div class="table-nav">
        <div class="left">
          <el-input
            maxlength="8"
            v-no-special-chinese
            placeholder="请输入评分项名称"
            v-if="item.isEdit"
            v-model="item.editName"
          >
          </el-input>
          <span v-else>{{ item.name }}</span>
        </div>
        <div class="right">
          <div v-if="item.isEdit">
            <el-button type="info" size="small" @click="handleCancelSoreItemChange(item)">
              取消
            </el-button>
            <el-button type="primary" size="small" @click="handleSaveScoreItem(item)">保存</el-button>
          </div>
          <div v-else class="icon">
            <i class="el-icon-edit-outline" @click="handleEditScoreGroup(item)"></i>
            <i class="el-icon-delete" @click="handleDeleteScoreGroup(item)"></i>
          </div>
        </div>
      </div>
      <el-table :data="item.children" style="width: 100%;">
        <el-table-column prop="name" label="问题程度"></el-table-column>
        <el-table-column prop="score" label="分值">
          <template slot-scope="{ row }">
            <div :class="row.type === 'add' ? 'green' : 'red'">
              <span v-if="item.isEdit" >
                {{ row.type === 'add' ? '加分项' : '扣分项' }}
                <el-input-number
                  v-numberOnly
                  type="number"
                  style="width: 140px;"
                  class="ml-10"
                  :min="0"
                  :max="100"
                  v-model="row.editScore"
                ></el-input-number>
              </span>

              <span v-else>{{ row.type === 'add' ? row.score : '-' + row.score }}</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
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
      const hasError = item.children.some(scoreItem => {
        return scoreItem.editScore === undefined || scoreItem.editScore === ''
      })
      if (hasError) {
        this.$message.error('请填写分值')
        return
      }
      const hasDuplicate = this.groupList.some(group => {
        return group.id !== item.id && group.name === item.editName
      })
      if (hasDuplicate) {
        this.$message.error('存在相同的评分项。')
        return
      }
      if (!item.editName) {
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
@import '~@/styles/variables.less';

.assessment-item {
  padding: 20px 16px 20px 16px;
  background-color: #fff;

  .add-group-wrap {
    display: flex;
    justify-content: flex-start;
  }

  .table-group {
    padding: 10px;
    margin-top: 20px;
    background-color: #fff;

    .table-nav {
      display: flex;
      align-content: center;
      justify-content: space-between;
      height: 56px;
      padding: 0 12px;
      font-size: 14px;
      font-weight: bold;
      line-height: 48px;
      color: #303133;
      background-color: #fafafa;
      border-bottom: 1px solid #ebeef5;

      .right,
      .left {
        display: flex;
        align-items: center;

        .icon {
          font-size: 24px;
          color: #94979c;

          & > i {
            margin-left: 10px;
            cursor: pointer;
          }
        }
      }
    }

    .table-bottom {
      display: flex;
      justify-content: center;
      margin-top: 10px;
    }
  }

  .ml-10 {
    margin-left: 10px;
  }

  .w140 {
    width: 140px;
  }

  .green {
    color: @green;
  }

  .red {
    color: @red;
  }
}
</style>
