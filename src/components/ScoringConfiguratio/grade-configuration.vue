<template>
  <div class="grade-configuration-main">
    <div class="header">
      <h3>{{ title }}</h3>
      <div>
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
          <el-button slot="reference" type="primary">添加类别</el-button>
        </el-popover>
        <el-button
          class="empty-button"
          v-if="showEmptyCheckPool"
          type="danger"
          @click="showEmptyDialog = true"
        >
          清空评分
        </el-button>
      </div>
    </div>
    <el-tabs v-model="tabKey" class="tabs-wrap">
      <el-tab-pane
        v-for="tab in tabList"
        :label="tab.name"
        :name="tab.name"
        :key="tab.name"
        @tab-click="handleSwitchTab"
      >
        <span slot="label">
          <span v-if="!tab.isEdit">{{ tab.name }}
            <i slot="reference" class="el-icon-edit-outline" @click.stop="handleOpenEditCategoryName(tab)"></i>
          </span>
          <span v-else>
            <el-input
              class="ml-10 w150"
              v-no-special-chinese
              v-model="tab.editName"
              @hook:mounted="handleEditCategoryNameInputMounted"
              placeholder="请输入类别"
              size="mini"
              ref="editCategoryInput"
              @blur="handleConfirmEditCategoryName(tab)"
              v-on:keyup.enter="handleConfirmEditCategoryName(tab)"
              maxlength="5"
              clearable
            >
            </el-input>
          </span>
        </span>
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

    <!-- 清空弹出框 -->
    <el-dialog
      width="35%"
      title="清空评分内容"
      center
      custom-class="empty-dialog"
      :visible.sync="showEmptyDialog"
    >
      <div class="">
        <span>选择清空对象:</span>
        <scorer-select v-model="emptyPeople"></scorer-select>
        <span v-if="!emptyPeople.length" class="all-empty-warning">默认清空全部人员评分</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="showEmptyDialog = false">取 消</el-button>
        <el-button type="primary" @click="setEmpty">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { GRADE_CONFIGURATION_TYPE, GRADE_LABEL_TYPE } from '@/utils/enumerate'
import Assessment from "./assessment-item"
import * as GradeConfigurationApi from '@/api/gradeConfiguration'
import ScorerSelect from '@SelectBox/scorerSelect/index'
import { mapGetters } from 'vuex'

function getScoreGroupBase (scoreTypeId) {
  return {
    name: '',
    editName: '',
    scoreTypeId,
    isEdit: true,
    isNew: true,
    id: +new Date(),
    children: _.cloneDeep(GRADE_CONFIGURATION_TYPE)
  }
}

export default {
  name: 'GradeConfigurationMain',
  components: {
    Assessment, ScorerSelect
  },
  props: {
    title: String,
    gradeType: {
      type: String,
      default: GRADE_LABEL_TYPE.CLOUD
    }
  },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      // 清空评分
      showEmptyDialog: false,
      emptyPeople: [],
      tabList: [],
      tabKey: '',
      // 类别弹出框
      showAddCategoryDialog: false,
      addCategoryName: ''
    }
  },
  computed: {
    ...mapGetters(['showEmptyCheckPool']),
    isShowEditCategoryButton () {
      return this.tabList.some(tab => tab.name === this.tabKey)
    }
  },
  mounted () {
    this.getAllScoreConfig()
  },
  methods: {
    async getAllScoreConfig () {
      const res = await GradeConfigurationApi.getScoreConfigByEdit(this.gradeType)
      this.tabList = res
      if (res.length > 0) {
        this.tabKey = res[0].name
      }
      this.tabList = res
    },
    async handleConfirmCategory () {
      if (this.tabList.some(tab => tab.name === this.addCategoryName)) {
        return this.$message.error('存在相同的评分类别。')
      }
      if (!this.addCategoryName) {
        return this.$message.error('请填写正确的类别名称')
      }
      const req = { name: this.addCategoryName, gradeType: this.gradeType }
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        await GradeConfigurationApi.addScoreType(req)
        this.$message.success('评分类别创建成功。')
        await this.getAllScoreConfig()
        this.tabKey = this.addCategoryName
        this.showAddCategoryDialog = false
        this.addCategoryName = ''
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * 自组建冒泡上来的添加事件
     */
    handleAddScoreGroup (id) {
      try {
        const index = this.tabList.findIndex(tab => tab.id === id)
        this.tabList[index].children.unshift(getScoreGroupBase(id))
      } catch (err) {
        this.$message.error('添加评分项失败')
        throw new Error('添加评分项失败')
      }
    },
    /**
     * 编辑某个类下的某一个组
     */
    handleEditScoreItem (groupId, categoryId) {
      try {
        const editCategory = this.tabList.find(tab => Number(tab.id) === Number(categoryId))
        const editGroup = editCategory.children.find(group => Number(group.id) === Number(groupId))
        editGroup.isEdit = true
        editGroup.editName = editGroup.name
        editGroup.children.forEach(item => {
          item.editScore = item.score
        })
      } catch (err) {
        this.$message.error('编辑评分项失败')
        throw new Error('编辑评分项失败')
      }
    },
    /**
     * 删除一个组
     */
    async handleDeleteScoreItem (groupId, categoryId) {
      const tabKey = this.tabKey
      const editCategory = this.tabList.find(tab => Number(tab.id) === Number(categoryId))
      if (!editCategory) {
        this.$message.error('删除评分项失败')
        throw new Error('删除评分项失败')
      }
      const deleteGroupIndex = editCategory.children.findIndex(group => Number(group.id) === Number(groupId))
      const deleteGroup = editCategory.children[deleteGroupIndex]
      if (!deleteGroup) {
        this.$message.error('删除评分项失败')
        throw new Error('删除评分项失败')
      }
      // 没有保存过的， 不需要调接口
      if (deleteGroup.isNew) {
        editCategory.children.splice(deleteGroupIndex, 1)
        return
      }
      const req = { id: deleteGroup.id, gradeType: this.gradeType }
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        await GradeConfigurationApi.delScoreConfig(req)
        await this.getAllScoreConfig()
        this.tabKey = tabKey
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * 取消编辑
     */
    handleCancelScoreItem (groupId, categoryId) {
      try {
        const editCategory = this.tabList.find(tab => Number(tab.id) === Number(categoryId))
        const editGroup = editCategory.children.find(group => Number(group.id) === Number(groupId))
        editGroup.isEdit = false
        editGroup.editName = editGroup.name
        editGroup.children.forEach(item => {
          item.editScore = item.score
        })
      } catch (err) {
        this.$message.error('取消评分项失败')
        throw new Error('取消评分项失败')
      }
    },
    /**
     * 保存评分组
     */
    async handleSaveScoreItem (groupId, categoryId) {
      const editCategory = this.tabList.find(tab => Number(tab.id) === Number(categoryId))
      const editGroup = _.cloneDeep(editCategory.children.find(group => Number(group.id) === Number(groupId)))
      // 区分是新增还是编辑
      const action = editGroup.isNew
        ? GradeConfigurationApi.addScoreConfig
        : GradeConfigurationApi.editScoreConfig
      const message = `评分内容${ editGroup.isNew ? '创建' : '编辑' }成功。`

      // 删除无用数据
      delete editGroup.isNew
      editGroup.isEdit = false
      editGroup.name = editGroup.editName
      delete editGroup.editName
      editGroup.children.forEach(item => {
        item.score = item.editScore
        delete item.editScore
      })

      const req = { ...editGroup, gradeType: this.gradeType }
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const res = await action(req)
        if (res) this.$message.success(message)
        await this.getAllScoreConfig()
        this.tabKey = editCategory.name
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * 切换tab， 需要吧当前编辑的都取消掉
     */
    handleSwitchTab () {
      this.tabList.forEach(tab => {
        tab.isEdit = false
      })
    },
    /**
     * 打开修改分类名称的弹窗
     */
    handleOpenEditCategoryName (editTab) {
      const editEditCategory = this.tabList.find(tab => tab.name === editTab.name)
      if (!editEditCategory) {
        this.$message.error('切换分类失败')
        throw new Error('切换分类失败')
      }
      this.tabKey = editTab.name
      editEditCategory.isEdit = true
      editEditCategory.editName = editEditCategory.name
    },
    /**
     * 修改的输入框打开扣需要获取焦点，其他的方式都不太好用
     */
    handleEditCategoryNameInputMounted () {
      if (!this.$refs.editCategoryInput) return
      this.$refs.editCategoryInput.forEach(v => v.focus())
    },
    /**
     * 确认修改类别名称
     */
    async handleConfirmEditCategoryName (editTab) {
      const currentTab = this.tabList.find(tab => tab.id === editTab.id)
      if (!currentTab.editName) {
        this.$message.error('请填写正确的评分类型。')
        return
      }
      // 名字没有改变，算作取消
      if (currentTab.editName === currentTab.name) {
        currentTab.isEdit = false
        return
      }
      if (this.tabList.some(tab => tab.name === currentTab.editName)) {
        this.$message.error('存在相同的评分类别。')
        return
      }
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const req = { name: currentTab.editName, id: currentTab.id, gradeType: this.gradeType }
        await GradeConfigurationApi.editScoreTypeName(req)
        await this.getAllScoreConfig()
        this.tabKey = currentTab.editName
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 确认清除
     */
    async setEmpty () {
      const params = {}
      if (this.emptyPeople.length > 0) {
        params.staffIds = this.emptyPeople
      }
      const msg = await GradeConfigurationApi.emptyCheckPoolByStaffId(params)
      if (msg) {
        this.$newMessage.success('清除成功')
        this.emptyPeople = []
        this.showEmptyDialog = false
      }
    }
  }
}
</script>

<style scoped lang="less">

.grade-configuration-main {
  position: relative;
  height: 100%;

  .empty-button {
    margin-left: 15px;
  }

  .tabs-wrap {
    overflow: hidden;
    border-radius: 16px;
    box-shadow: @boxShadow;
  }
}
</style>

<style lang="less">
.grade-configuration-add-item-main {
  display: flex;
  align-items: center;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ml-10 {
    margin-left: 10px;
  }

  .w150 {
    width: 150px;
  }
}
</style>
