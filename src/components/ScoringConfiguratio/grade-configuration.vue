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
          v-model="editEditCategory.edit_name"
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
        修改当前类别名称1
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
        :key="tab.name"
      >
        <Assessment
          @cancel-score-item-change="handleCancelScoreItem($event, tab.id)"
          @save-score-item="handleSaveScoreItem($event, tab.id)"
          @edit-score-item="handleEditScoreItem($event, tab.id)"
          @add-score-group="handleAddScoreGroup(tab.id)"
          @delete-score-item="handleDeleteScoreItem($event, tab.id)"
          :key="tab.id"
          :groupList="tab.children"
        >
        </Assessment>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { SCORE_TYPES } from '@/utils/enumerate'
import Assessment from "./assessment-item"

function getScoreGroupBase (scoreTypeId) {
  return {
    name: '',
    edit_name: '',
    scoreTypeId,
    isEdit: true,
    isNew: true,
    id: +new Date(),
    children: [
      { id: 1, name: '小', score: undefined, edit_score: undefined, type: SCORE_TYPES.DEDUCT },
      { id: 2, name: '中', score: undefined, edit_score: undefined, type: SCORE_TYPES.DEDUCT },
      { id: 3, name: '拔草', score: undefined, edit_score: undefined, type: SCORE_TYPES.DEDUCT },
      { id: 4, name: '种草', score: undefined, edit_score: undefined, type: SCORE_TYPES.ADD }
    ]
  }
}

export default {
  name: 'GradeConfigurationMain',
  components: {
    Assessment
  },
  props: {
    addScoreType: Function,
    delScoreConfig: Function,
    addScoreConfig: Function,
    editScoreConfig: Function,
    getScoreConfig: Function,
    editScoreTypeName: Function
  },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
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
    isShowEditCategoryButton () {
      return this.tabList.some(tab => tab.name === this.tabKey)
    }
  },
  mounted () {
    this.getAllScoreConfig()
  },
  methods: {
    async getAllScoreConfig () {
      const res = await this.getScoreConfig()
      this.tabList = res
      if (res.length > 0) {
        this.tabKey = res[0].name
      }
      this.$store.commit('gradeConfiguration/SAVE_CLOUD_GRADE_CONFIGURATION_LIST', res)
    },
    async handleConfirmCategory () {
      if (this.tabList.some(tab => tab.name === this.addCategoryName)) {
        this.$message.error('存在相同的评分类别。')
        return
      }
      if (!this.addCategoryName) {
        this.$message.error('请填写正确的类别名称')
        return
      }
      const req = {
        name: this.addCategoryName
      }
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const res = await this.addScoreType(req)
        if (res) this.$message.success('评分类别创建成功。')
        const data = {
          id: res,
          name: this.addCategoryName,
          children: []
        }
        this.tabList.unshift(data)
        this.tabKey = data.name
        this.showAddCategoryDialog = false
        this.addCategoryName = ''
      } catch (error) {
        console.error(error)
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * 自组建冒泡上来的添加事件
     */
    handleAddScoreGroup (id) {
      const index = this.tabList.findIndex(tab => tab.id === id)
      if (!this.tabList[index].children) {
        this.$set(this.tabList[index], 'children', [])
      }
      this.tabList[index].children.unshift(getScoreGroupBase(id))
    },
    /**
     * 编辑某个类下的某一个组
     */
    handleEditScoreItem (groupId, categoryId) {
      const editCategory = this.tabList.find(tab => Number(tab.id) === Number(categoryId))
      const editGroup = editCategory.children.find(group => Number(group.id) === Number(groupId))
      if (!editGroup.hasOwnProperty('isEdit')) {
        this.$set(editGroup, 'isEdit', true)
      } else {
        editGroup.isEdit = true
      }
      this.$set(editGroup, 'edit_name', editGroup.name)
      editGroup.children.forEach(item => {
        this.$set(item, 'edit_score', item.score)
      })
    },
    /**
     * 删除一个组
     */
    async handleDeleteScoreItem (groupId, categoryId) {
      const editCategory = this.tabList.find(tab => Number(tab.id) === Number(categoryId))
      const deleteGroupIndex = editCategory.children.findIndex(group => Number(group.id) === Number(groupId))
      const deleteGroup = editCategory.children[deleteGroupIndex]
      // 没有保存过的， 不需要调接口
      if (deleteGroup.isNew) {
        editCategory.children.splice(deleteGroupIndex, 1)
        return
      }
      const req = { id: deleteGroup.id }
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        await this.delScoreConfig(req)
        editCategory.children.splice(deleteGroupIndex, 1)
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        console.error(error)
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * 取消编辑
     */
    handleCancelScoreItem (groupId, categoryId) {
      const editCategory = this.tabList.find(tab => Number(tab.id) === Number(categoryId))
      const editGroup = editCategory.children.find(group => Number(group.id) === Number(groupId))
      editGroup.isEdit = false
      delete editGroup.edit_name
      editGroup.children.forEach(item => {
        delete item.edit_score
      })
    },
    /**
     * 保存评分组
     */
    async handleSaveScoreItem (groupId, categoryId) {
      const editCategory = this.tabList.find(tab => Number(tab.id) === Number(categoryId))
      const editGroup = editCategory.children.find(group => Number(group.id) === Number(groupId))
      // 区分是新增还是编辑
      const action = editGroup.isNew
        ? this.addScoreConfig
        : this.editScoreConfig

      // 删除无用数据
      delete editGroup.isNew
      editGroup.isEdit = false
      editGroup.name = editGroup.edit_name
      delete editGroup.edit_name
      editGroup.children.forEach(item => {
        item.score = item.edit_score
        delete item.edit_score
      })

      const req = {
        ...editGroup
      }
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const res = await action(req)
        if (res) this.$message.success('评分内容创建成功。')
        editGroup.id = res
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    },
    /**
     * 打开修改分类名称的弹窗
     */
    handleOpenEditCategoryNameView () {
      const editEditCategory = this.tabList.find(tab => tab.name === this.tabKey)
      editEditCategory.edit_name = editEditCategory.name
      this.editEditCategory = _.cloneDeep(editEditCategory)
    },
    /**
     * 确认修改类别名称
     */
    async handleConfirmEditCategoryName () {
      if (this.tabList.some(tab => tab.name === this.editEditCategory.edit_name)) {
        this.$message.error('存在相同的评分类别。')
        return
      }
      if (!this.editEditCategory.edit_name) {
        this.$message.error('请填写正确的评分类型。')
        return
      }
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const req = {
          name: this.editEditCategory.edit_name,
          id: this.editEditCategory.id
        }
        await this.editScoreTypeName(req)
        const origin = this.tabList.find(tab => tab.id === this.editEditCategory.id)
        origin.name = this.editEditCategory.edit_name
        this.tabKey = this.editEditCategory.edit_name
        this.showEditCategoryDialog = false
        this.editEditCategory = {}
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
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
