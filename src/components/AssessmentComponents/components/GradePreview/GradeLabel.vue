<template>
  <div class="grade-label">
    <div class="label-header">
      <div class="panel-title">标签栏</div>
    </div>
    <transition name="fade" mode="out-in">
      <LoadingTea class="loading-box" v-if="loading"/>
      <div class="lable-main" v-else>
        <el-collapse v-model="activeNames" v-if="labelClass.length">
          <el-collapse-item
            v-for="labelClassItem in labelClass"
            :key="labelClassItem.id"
            :title="labelClassItem.name"
            :name="labelClassItem.idString"
          >
            <LabelModule :labelClass="labelClassItem" :activeLabelId="activeLabelId" @selectLabelId="onSelectGrade" />
          </el-collapse-item>
        </el-collapse>
        <div class="tip" v-else>请联系主管添加评分</div>
      </div>
    </transition>
  </div>
</template>

<script>
import * as AssessmentCenter from '@/api/assessmentCenter'
import LabelModule from './LabelModule.vue'
import LoadingTea from '@/components/LoadingTea'

export default {
  name: 'GradeLabel',
  components: { LabelModule, LoadingTea },
  data () {
    return {
      activeNames: [],
      labelClass: [],
      chainLine: [],
      activeLabelId: '', // 当前选中标签id
      loading: true, // 是否加载中
    }
  },
  created () {
    this.getAllLabel()
  },
  mounted () {
    this.registerLableEvent()
  },
  destroyed () {
    this.cancelRegisterLableEvent()
  },
  methods: {
    /**
     * @description 注册监听事件
     */
    registerLableEvent () {
      this.$bus.$on('delete-grade-lable', (lableInfo) => { this.deleteGradeLable(lableInfo) })
      this.$bus.$on('reset-grade-lable', () => { this.clearAllLabelValue() })
      this.$bus.$on('skip-next-label', (lableIds) => { this.skipNextLabel(lableIds) })
    },
    /**
     * @description 取消监听lable事件
     */
    cancelRegisterLableEvent () {
      this.$bus.$off('delete-grade-lable')
      this.$bus.$off('reset-grade-lable')
      this.$bus.$off('skip-next-label')
    },
    /**
     * @description
     */
    deleteGradeLable (lableInfo) {
      const idchains = lableInfo.id.split('-')
      const findClass = this.labelClass.find(item => Number(item.id) === Number(idchains[0]))
      if (!findClass) return
      const findGrade = findClass.children.find(item => Number(item.id) === Number(idchains[1]))
      if (!findGrade) return
      findGrade.value = ''
      const findOneBtn = findClass.children.find(item => item.isOneAll)
      if (!findOneBtn) return
      findOneBtn.value = ''
    },
    /**
     * @description 清楚全部标签数据
     */
    clearAllLabelValue () {
      this.labelClass.forEach(classItem => {
        const gradeLabelItem = classItem.children
        gradeLabelItem.forEach(gradeItem => {
          gradeItem.value = ''
        })
      })
    },
    /**
     * @description 获取标签数据
     */
    async getAllLabel () {
      try {
        this.loading = true
        const { labelClass, chainLine } = await AssessmentCenter.getScoreConfigList()
        await this.$delayLoading()
        this.labelClass = labelClass
        this.activeNames = [String(_.get(labelClass[0], 'id'))]
        this.chainLine = chainLine
      } finally {
        this.loading = false
      }
    },
    /**
     * @description 调整下一个id
     */
    skipNextLabel (labelIds) {

      const findChainLineIndex = this.chainLine.findIndex(item => Number(item) === Number(labelIds.id))
      // 没有在链路中找到index 不跳转
      if (findChainLineIndex < 0) return
      // 最后一个不跳转
      if (findChainLineIndex === this.chainLine.length -1 ) return
      const nextId = this.chainLine[findChainLineIndex + 1]

      let findNextGradeLabel = null
      this.labelClass.forEach(classItem => {
        const gradeList = classItem.children || []
        const findGrade = gradeList.find(item => Number(item.id) === Number(nextId))
        if (findGrade) findNextGradeLabel = findGrade
      })
      if (!findNextGradeLabel) return
      // 下一个标签有值 不跳转
      if (findNextGradeLabel.value) return
      // 打开折叠栏
      const classId = findNextGradeLabel.parentId
      if (!this.activeNames.includes(String(classId))) {
        this.activeNames.push(String(classId))
      }
      this.onSelectGrade(nextId)
    },
    /**
     * @description 选中问题
     */
    onSelectGrade (id) {
      this.activeLabelId = id
    }
  }
}
</script>

<style lang="less" scoped>
.grade-label {
  @border-color: 1px solid #666;
  @gradeLabelBack: #393939;

  width: 100%;
  font-size: 12px;
  color: #eee;

  .label-header {
    padding: 14px 12px;

    .panel-title {
      color: #eee;
    }
  }

  & /deep/ .el-collapse {
    border-top: @border-color;
    border-bottom: none;

    .el-collapse-item__header {
      padding-left: 12px;
      font-size: 14px;
      line-height: 20px;
      color: #eee;
      background-color: @gradeLabelBack;
      border-bottom: @border-color;

      &.is-active {
        border-bottom: transparent;
      }
    }

    .el-collapse-item__wrap {
      font-size: 12px;
      color: #eee;
      background-color: @gradeLabelBack;
      border-bottom: @border-color;

      .el-collapse-item__content {
        padding: 0 12px 14px;
        color: #eee;
      }
    }
  }

  .loading-box {
    display: flex;
    align-items: center;
    justify-content: center;
    height: calc(100% - 60px);
  }

  .lable-main {
    .tip {
      padding: 14px 12px;
      font-size: 14px;
      font-weight: bolder;
    }
  }
}
</style>
