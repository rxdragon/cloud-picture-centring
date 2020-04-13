<template>
  <div class="issue-item">
    <div class="issue-name">
      <span v-if="!edit">{{ issueItemData.name }}</span>
      <el-input v-else v-model="issueItemData.name" placeholder="请输入评分细类名称"></el-input>
    </div>
    <div class="issue-weight">
      <span v-if="!edit">{{ issueItemData.weights }}</span>
      <el-input-number v-else v-model="issueItemData.weights" :min="1" :max="99" label="请输入评分细类权重"></el-input-number>
    </div>
    <div class="issue-score">{{ itemWeightScore }}</div>
    <div class="issue-operation-box">
      <template v-if="!classEdit">
        <span class="issue-operation edit" @click="saveIssueItem" v-if="edit">保存</span>
        <span class="issue-operation edit" @click="editIssueItem" v-else>编辑</span>
      </template>
      <span class="issue-operation deleted">删除</span>
    </div>
  </div>
</template>

<script>
import * as GradeConfiguration from '@/api/gradeConfiguration.js'

export default {
  name: 'IssueItem',
  props: {
    issueItemData: { type: Object, required: true },
    classEdit: { type: Boolean }
  },
  data () {
    return {
      itemName: '',
      itemWeight: 0,
      weightScore: 5,
      isClassEdit: false
    }
  },
  computed: {
    // 是否是编辑状态
    edit () {
      return this.issueItemData.isEdit
    },
    // 单项权重分数
    itemWeightScore () {
      return this.issueItemData.weights * this.weightScore
    }
  },
  methods: {
    // 编辑单项
    editIssueItem () {
      this.$set(this.issueItemData, 'isEdit', true)
      this.itemName = this.issueItemData.name
      this.itemWeight = this.issueItemData.weights
    },
    /**
     * @description 保存数据
     */
    async saveIssueItem () {
      const sameName = this.itemName === this.issueItemData.name
      const sameWeights = this.itemWeight === this.issueItemData.weights
      if (!sameName || !sameWeights) {
        try {
          const req = {
            id: this.issueItemData.id,
            configData: {
              name: this.issueItemData.name,
              weights: this.issueItemData.weights
            }
          }
          await GradeConfiguration.editChildScoreConfig(req)
        } catch (error) {
          console.error(error)
          this.$set(this.issueItemData, 'name', this.itemName)
          this.$set(this.issueItemData, 'weights', this.itemWeight)
        } finally {
          this.$set(this.issueItemData, 'isEdit', false)
        }
      } else {
        this.$set(this.issueItemData, 'isEdit', false)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.issue-item {
  display: grid;
  grid-template-columns: 2fr 2fr 2fr 1fr;
  align-items: center;
  height: 56px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 400;
  line-height: 14px;
  color: #606266;
  border-bottom: 1px solid #f2f6fc;

  .issue-operation-box {
    display: flex;
    justify-content: space-around;

    .issue-operation {
      cursor: pointer;
    }

    .deleted {
      color: #ff3974;
    }

    .edit {
      color: #4669fb;
    }
  }

  .issue-weight,
  .issue-name {
    .el-input {
      width: 80%;
    }
  }
}
</style>
