<template>
  <div class="issue-class">
    <div class="issue-class-header">
      <div class="class-name">
        <span v-if="!edit">{{ issueClassData.name }}（共{{ issueClassData.child.length }}项）</span>
        <el-input v-else v-model="issueClassData.name" maxlength="10" show-word-limit placeholder="请输入评分大类名称"></el-input>
      </div>
      <div class="class-tool">
        <el-popover
          placement="bottom-end"
          width="462"
          popper-class="add-new-item"
          :offset="20"
          v-model="showAddNewProp"
          trigger="click">
          <div class="add-item-main">
            <span class="add-desc">添加细类数量：</span>
            <el-input-number v-model="newIssueItem" :min="1" :max="10" label="添加数量"></el-input-number>
            <el-button @click="addNewAddItem" size="small" type="primary">确认</el-button>
            <el-button @click="showAddNewProp = false" size="small" type="info">取消</el-button>
          </div>
          <div class="tool-box" slot="reference"><i class="el-icon-plus"></i></div>
        </el-popover>
        <div class="tool-box">
          <!-- 保存 -->
          <i class="el-icon-document-checked" @click="saveClass" v-if="edit"></i>
          <!-- 编辑 -->
          <i class="el-icon-edit-outline" @click="editClass" v-else></i>
        </div>
        <div class="tool-box" @click="delectClass"><i class="el-icon-delete"></i></div>
      </div>
    </div>
    <div class="issue-table">
      <span>细类名称</span>
      <span>权重点</span>
      <span>分值</span>
      <span class="operation">操作</span>
    </div>
    <issue-item v-for="issueItem in issueClassData.child"
      :key="issueItem.key" :issue-item-data="issueItem"
      @delete="delectItem"
      :class-edit="edit" />
  </div>
</template>

<script>
import IssueItem from './IssueItem'
import uuidv4 from 'uuid'
import * as GradeConfiguration from '@/api/gradeConfiguration.js'

export default {
  name: 'IssueClass',
  components: { IssueItem },
  props: {
    issueClassData: { type: Object, required: true }
  },
  data () {
    return {
      cacheData: {},
      newIssueItem: 1,
      showAddNewProp: false
    }
  },
  computed: {
    edit () {
      return this.issueClassData.isEdit
    }
  },
  methods: {
    /**
     * @description 编辑标签大类
     */
    editClass () {
      this.cacheData = JSON.parse(JSON.stringify(this.issueClassData))
      this.$set(this.issueClassData, 'isEdit', true)
      this.issueClassData.child.forEach(issueItem => issueItem.isEdit = true)
    },
    /**
     * @description 保存数据
     */
    async saveClass () {
      try {
        if (!this.hasEditData()) {
          this.$set(this.issueClassData, 'isEdit', false)
          this.issueClassData.child.forEach(issueItem => issueItem.isEdit = false)
          return false
        }
        const req = {
          mainName: this.issueClassData.name,
          configData: []
        }
        if (this.issueClassData.id) { req.id = this.issueClassData.id }
        this.issueClassData.child.forEach(item => {
          const createData = {
            name: item.name,
            weights: item.weights
          }
          if (item.id) { createData.id = item.id }
          req.configData.push(createData)
        })
        if (this.issueClassData.isNewAdd) {
          await GradeConfiguration.addScoreConfig(req)
        } else {
          await GradeConfiguration.editScoreConfig(req)
        }
        this.$emit('getList')
      } catch (error) {
        console.error(error)
        if (error.message) {
          this.$newMessage.warning(error.message)
        } else {
          this.$emit('getList')
        }
      }
    },
    /**
     * @description 删除单项
     */
    delectItem (sendData) {
      if (this.edit) {
        const key = sendData.key
        const findDeleteIssueItemIndex = this.issueClassData.child.findIndex(item => item.key === key)
        this.issueClassData.child.splice(findDeleteIssueItemIndex, 1)
      } else {
        this.$emit('getList')
      }
    },
    /**
     * @description 判断是否有数据
     */
    hasEditData () {
      let hasChange = false
      if (!this.issueClassData.name) {
        throw new Error('请填写完整信息')
      }
      if (this.issueClassData.name !== this.cacheData.name) {
        hasChange = true
        return hasChange
      }
      const cacheChild = this.cacheData.child
      if (cacheChild.length !== this.issueClassData.child.length) { hasChange = true }
      this.issueClassData.child.forEach(issueItem => {
        if (!issueItem.name || !issueItem.weights) {
          throw new Error('请填写完整信息')
        }
        const findIssue = cacheChild.find(item => item.id === issueItem.id)
        if (findIssue) {
          const sameName = findIssue.name === issueItem.name
          const sameWeights = findIssue.weights === issueItem.weights
          if (!sameName || !sameWeights) {
            hasChange = true
          }
        } else {
          hasChange = true
        }
      })
      return hasChange
    },
    /**
     * @description 添加新项目
     */
    addNewAddItem () {
      for (let index = 0; index < this.newIssueItem; index++) {
        this.issueClassData.child.push({
          key: uuidv4(),
          name: '',
          weights: 1,
          isEdit: true
        })
      }
      this.editClass()
      this.showAddNewProp = false
    },
    /**
     * @description 删除大类
     */
    async delectClass () {
      try {
        const req = { id: this.issueClassData.id }
        await GradeConfiguration.delScoreConfig(req)
        this.$emit('getList')
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.issue-class {
  .issue-class-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    padding: 0 20px;
    background-color: #fafafa;

    .class-name {
      font-size: 14px;
      font-weight: 500;
      line-height: 24px;
      color: #303133;
    }

    .class-tool {
      display: flex;

      .tool-box {
        width: 24px;
        height: 24px;
        margin-left: 11px;
        cursor: pointer;

        i {
          font-size: 24px;
          color: #91939a;
        }
      }
    }
  }

  .issue-table {
    display: grid;
    grid-template-columns: 2fr 2fr 2fr 1fr;
    align-items: center;
    padding: 21px 20px;
    font-size: 14px;
    font-weight: 400;
    line-height: 14px;
    color: #606266;
    border-bottom: 1px solid #f2f6fc;

    & .operation {
      text-align: center;
    }
  }
}
</style>

<style lang="less">
.el-popper {
  padding: 12px 20px;
}

.add-item-main {
  .add-desc {
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: #606266;
  }

  .el-input-number {
    width: 146px;
    margin-right: 20px;
  }
}
</style>
