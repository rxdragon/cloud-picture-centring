<template>
  <div class="grade-configuration-main">
    <el-popover
      placement="bottom-start"
      width="420"
      :offset="20"
      v-model="showEditCategoryDialog"
      popper-class="add-new-item"
      trigger="click"
    >
      <div class="grade-configuration-add-item-main">
        <span>类别名称:</span>
        <el-input
          class="ml-10 w150"
          v-no-special-chinese
          v-model="editEditCategory.edit_categoryName"
          placeholder="请输入类别"
          maxlength="5"
        >
        </el-input>
        <el-button type="info" class="ml-10" @click="showEditCategoryDialog = false">取 消</el-button>
        <el-button type="primary" @click="handleConfirmEditCategoryName">确 定</el-button>
      </div>
      <el-button
        v-show="isShowEditCategoryButton"
        slot="reference"
        @click.stop="handleOpenEditCategoryNameView"
        class="edit-category-button"
      >
        修改当前类别名称
      </el-button>
    </el-popover>
    <el-popover
      placement="bottom-start"
      width="420"
      :offset="20"
      v-model="showAddCategoryDialog"
      trigger="click"
    >
      <div class="grade-configuration-add-item-main">
        <span>类别名称:</span>
        <el-input
          class="ml-10 w150"
          v-no-special-chinese
          v-model="addCategoryName"
          placeholder="请输入类别"
          maxlength="5"
        >
        </el-input>
        <el-button type="info" class="ml-10" @click="showAddCategoryDialog = false">取 消</el-button>
        <el-button type="primary" @click="handleConfirmCategory">确 定</el-button>
      </div>
      <el-button slot="reference" class="add-category-button">添加类别</el-button>
    </el-popover>
    <el-tabs v-model="tabKey">
      <el-tab-pane
        v-for="tab in tabList"
        :label="tab.name"
        :name="tab.name"
        :key="tab.id"
      >
        <Assessment
          @cancel-score-item-change="handleCancelScoreItem($event, tab.id)"
          @save-score-item="handleSaveScoreItem($event, tab.id)"
          @edit-score-item="handleEditScoreItem($event, tab.id)"
          @add-score-group="handleAddScoreGroup(tab.id)"
          :key="tab.id"
          :groupData="tab.scoreGroup"
        >
        </Assessment>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { SCORE_TYPES } from "@/utils/enumerate"
import Assessment from "./assessment-item"
import { mapGetters } from 'vuex'

function getScoreGroupBase () {
  return {
    groupName: '',
    isEdit: true,
    id: +new Date(),
    data: [
      { id: 1, name: '小', score: undefined, type: SCORE_TYPES.DEDUCT },
      { id: 2, name: '中', score: undefined, type: SCORE_TYPES.DEDUCT },
      { id: 3, name: '拔草', score: undefined, type: SCORE_TYPES.DEDUCT },
      { id: 4, name: '种草', score: undefined, type: SCORE_TYPES.ADD }
    ]
  }
}
export default {
  name: 'gradeConfigurationMain',
  components: {
    Assessment
  },
  data () {
    return {
      tabList: [],
      tabKey: '',

      // 类别弹出框
      showAddCategoryDialog: false,
      addCategoryName: '',
      showEditCategoryDialog: false, // 修改当前类别名称
      editEditCategory: {}, // 当前正在编辑的类别
    }
  },
  computed: {
    ...mapGetters(['showEmptyCheckPool']),
    isShowEditCategoryButton () {
      return this.tabList.some(tab => tab.name === this.tabKey)
    }
  },
  methods: {
    handleConfirmCategory () {
      if (this.tabList.some(tab => tab.name === this.addCategoryName)) {
        this.$message.error('存在相同的评分类别。')
        return
      }
      const data = {
        id: '' + +new Date(),
        name: '新分类' + +new Date(),
        type: '123',
        scoreGroup: [getScoreGroupBase()]
      }
      this.tabList.unshift(data)
      this.tabKey = data.name
      this.showAddCategoryDialog = false
      this.addCategoryName = ''
    },
    /**
     * 自组建冒泡上来的添加事件
     */
    handleAddScoreGroup (id) {
      const index = this.tabList.findIndex(tab => tab.id === id)
      if (!this.tabList[index].scoreGroup) {
        this.$set(this.tabList[index], 'scoreGroup', [])
      }
      this.tabList[index].scoreGroup.unshift(getScoreGroupBase())
    },
    /**
     * 编辑某个类下的某一个组
     */
    handleEditScoreItem (groupId, categoryId) {
      const editCategory = this.tabList.find(tab => Number(tab.id) === Number(categoryId))
      const editGroup = editCategory.scoreGroup.find(group => Number(group.id) === Number(groupId))
      if (!editGroup.hasOwnProperty('isEdit')) {
        this.$set(editGroup, 'isEdit', true)
      } else {
        editGroup.isEdit = true
      }
      this.$set(editGroup, 'edit_groupName', editGroup.groupName)
      editGroup.data.forEach(item => {
        this.$set(item, 'edit_score', item.score)
      })
    },
    /**
     * 取消编辑
     */
    handleCancelScoreItem (groupId, categoryId) {
      const editCategory = this.tabList.find(tab => Number(tab.id) === Number(categoryId))
      const editGroup = editCategory.scoreGroup.find(group => Number(group.id) === Number(groupId))
      editGroup.isEdit = false
      delete editGroup.edit_groupName
      editGroup.data.forEach(item => {
        delete item.edit_score
      })
    },
    /**
     * 保存评分组
     */
    handleSaveScoreItem (groupId, categoryId) {
      const editCategory = this.tabList.find(tab => Number(tab.id) === Number(categoryId))
      const editGroup = editCategory.scoreGroup.find(group => Number(group.id) === Number(groupId))
      editGroup.isEdit = false
      editGroup.groupName = editGroup.edit_groupName
      delete editGroup.edit_groupName
      editGroup.data.forEach(item => {
        item.score = item.edit_score
        delete item.edit_score
      })
    },
    /**
     * 打开修改分类名称的弹窗
     */
    handleOpenEditCategoryNameView () {
      // this.showEditCategoryDialog = true
      const editEditCategory = this.tabList.find(tab => tab.name === this.tabKey)
      editEditCategory.edit_categoryName = editEditCategory.name
      this.editEditCategory = _.cloneDeep(editEditCategory)
    },
    /**
     * 确认修改类别名称
     */
    handleConfirmEditCategoryName () {
      if (this.tabList.some(tab => tab.name === this.editEditCategory.edit_categoryName)) {
        this.$message.error('存在相同的评分类别。')
        return
      }
      if (!this.editEditCategory.edit_categoryName) {
        this.$message.error('请填写正确的评分类型。')
        return
      }
      this.showEditCategoryDialog = false
      const origin = this.tabList.find(tab => tab.id === this.editEditCategory.name)
      origin.name = this.editEditCategory.edit_categoryName
      // todo
    }
  }
}
</script>

<style scoped lang="less">

.grade-configuration-main {
  position: relative;
  height: 100%;

  .add-category-button {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 10;
  }

  .edit-category-button {
    position: absolute;
    top: 0;
    right: 120px;
    z-index: 10;
  }
}
</style>

<style lang="less">

.grade-configuration-add-item-main {
  display: flex;
  align-items: center;

  .ml-10 {
    margin-left: 10px;
  }

  .w150 {
    width: 150px;
  }
}
</style>
