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
import { GRADE_CONFIGURATION_TYPE } from '@/utils/enumerate'
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
      const res = await this.getScoreConfig()
      // 每次这个页面改动只有， 都会重新调用getAllScoreConfig，保证vuex里的是最新的
      this.$store.commit('gradeConfiguration/SAVE_CLOUD_GRADE_CONFIGURATION_LIST', _.cloneDeep(res))
      res.forEach(tab => {
        tab.isEdit = false
        tab.editName = tab.name
        if (!tab.children) tab.children = []
        tab.children.forEach(group => {
          group.isNew = false
          group.isEdit = false
          group.editName = group.name
          if (!group.children) group.children = []
          group.children.forEach(score => {
            score.editScore = score.score
          })
        })
      })
      this.tabList = res
      if (res.length > 0) {
        this.tabKey = res[0].name
      }
      this.tabList = res
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
        await this.getAllScoreConfig()
        this.tabKey = this.addCategoryName
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
      this.tabList[index].children.unshift(getScoreGroupBase(id))
    },
    /**
     * 编辑某个类下的某一个组
     */
    handleEditScoreItem (groupId, categoryId) {
      const editCategory = this.tabList.find(tab => Number(tab.id) === Number(categoryId))
      const editGroup = editCategory.children.find(group => Number(group.id) === Number(groupId))
      editGroup.isEdit = true
      editGroup.editName = editGroup.name
      editGroup.children.forEach(item => {
        item.editScore = item.score
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
        await this.getAllScoreConfig()
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
      editGroup.editName = editGroup.name
      editGroup.children.forEach(item => {
        item.editScore = item.score
      })
    },
    /**
     * 保存评分组
     */
    async handleSaveScoreItem (groupId, categoryId) {
      const editCategory = this.tabList.find(tab => Number(tab.id) === Number(categoryId))
      const editGroup = _.cloneDeep(editCategory.children.find(group => Number(group.id) === Number(groupId)))
      // 区分是新增还是编辑
      const action = editGroup.isNew
        ? this.addScoreConfig
        : this.editScoreConfig

      // 删除无用数据
      delete editGroup.isNew
      editGroup.isEdit = false
      editGroup.name = editGroup.editName
      delete editGroup.editName
      editGroup.children.forEach(item => {
        item.score = item.editScore
        delete item.editScore
      })

      const req = {
        ...editGroup
      }
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const res = await action(req)
        if (res) this.$message.success('评分内容创建成功。')
        await this.getAllScoreConfig()
        this.tabKey = editCategory.name
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
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
        const req = {
          name: currentTab.editName,
          id: currentTab.id
        }
        await this.editScoreTypeName(req)
        await this.getAllScoreConfig()
        this.tabKey = currentTab.editName
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
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
      const msg = GradeConfigurationApi.emptyCheckPoolByStaffId(params)
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
