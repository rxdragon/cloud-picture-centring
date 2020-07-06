<template>
  <div class="grade-configuration">
    <div class="header">
      <h3>云学院评分配置</h3>
      <el-button type="primary" @click="showEmptyDialog = true">清空评分</el-button>
    </div>
    <div class="main module-panel">
      <div class="add-configuration-item">
        <el-popover
          placement="bottom-start"
          width="462"
          popper-class="add-new-item"
          :offset="20"
          v-model="showAddNewClassProp"
          trigger="click"
        >
          <div class="add-item-main">
            <span class="add-desc">细类评分项数量：</span>
            <el-input-number
              v-model="newIssueItem"
              :min="1"
              :max="10"
              label="添加数量"
            >
            </el-input-number>
            <el-button @click="addNewAddClass" size="small" type="primary">确认</el-button>
            <el-button @click="showAddNewClassProp = false" size="small" type="info">取消</el-button>
          </div>
          <el-button slot="reference" type="primary">添加评分类</el-button>
        </el-popover>
        <div class="right">
          <div class="grade-limit">
            <el-button type="primary" plain @click="gradeLimitDialog = true">设置分数限制</el-button>
            <span class="weight-info">{{ showScoreLimit.bottom }}(分) ~ {{ showScoreLimit.top }}(分)</span>
          </div>
          <div class="deploy-weight">
            <el-button type="primary" @click="showWeight">配置权重分值</el-button>
            <span class="weight-info">1(点) : {{ weight }}(分)</span>
          </div>
        </div>
      </div>
      <el-tabs @tab-click="tabChange" v-model="tabName" >
        <el-tab-pane
          v-for="(tab, index) in tabMap"
          :label="tab.name"
          :name="tab.type"
          :key="index"
        >
        </el-tab-pane>
      </el-tabs>
      <div v-if="tabName === 'goodWord'">
        <good-word></good-word>
      </div>
      <div v-else class="score-area">
        <div class="configuration-main" v-if="scoreConfigList.length">
          <issue-class
            v-for="issueClass in scoreConfigList"
            @getList="getScoreConfigList"
            :key="issueClass.key"
            :issue-class-data="issueClass"
          />
        </div>
        <div class="no-data-box" v-else>
          <img src="@/assets/404_images/no-data.png" alt="">
          <span class="desc">当前暂无评分项</span>
        </div>
      </div>
    </div>
    
    <!-- 配置弹出框 -->
    <el-dialog
      width="35%"
      title="权重点配置"
      custom-class="weight-dialog"
      center
      :visible.sync="showConfigWeight"
    >
      <div class="config-weight-box">
        <div class="from-box">
          权重点配置：1点 ： <el-input
            v-model="cacheWeight"
            v-numberOnly
            type="number"
            min="1"
            max="99"
            placeholder="请输入分值"
          >
          </el-input> 分
        </div>
        <div class="weight-desc">
          <i class="el-icon-warning"></i> 提示：权重点配置为1个权重点对应的具体分值请填入输入框
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="cancelWeight">取 消</el-button>
        <el-button type="primary" @click="setWeight">确 定</el-button>
      </span>
    </el-dialog>
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
    <!-- 分数限制 -->
    <el-dialog
      width="35%"
      title="设置分数限制"
      custom-class="grade-limit-dialog"
      center
      :visible.sync="gradeLimitDialog"
    >
      <div class="grade-limit-dialog-cont">
        <span>分数范围:</span>
        <el-input
          v-numberOnly
          min="0"
          max="100"
          v-model="gradeLimit.bottom"
          placeholder="下限"
        >
        </el-input>
        ~
        <el-input
          v-numberOnly
          min="0"
          max="100"
          v-model="gradeLimit.top"
          placeholder="上限"
        >
        </el-input>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="gradeLimitDialog = false">取 消</el-button>
        <el-button type="primary" @click="setGradeLimit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import IssueClass from './components/GradeConfig/IssueClass'
import GoodWord from './components/GoodWord'
import scorerSelect from '@SelectBox/scorerSelect'
import uuidv4 from 'uuid'
import * as GradeConfiguration from '@/api/gradeConfiguration.js'
import { mapGetters } from 'vuex'
import { PlantTypeIdEnum } from '@/utils/enumerate'

export default {
  name: 'GradeConfiguration',
  components: { IssueClass, GoodWord, scorerSelect },
  provide () {
    return {
      weightProvide: this.weightObject
    }
  },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      emptyPeople: [],
      showEmptyDialog: false,
      gradeLimitDialog: false,
      gradeLimit: {
        bottom: 0,
        top: 0
      },
      showConfigWeight: false,
      weight: '',
      cacheWeight: '',
      allScoreConfigList: {},
      showAddNewClassProp: false,
      newIssueItem: 1,
      weightObject: {
        score: 0
      },
      tabName: 'plant',
      tabMap: [
        {
          name: '种草',
          type: 'plant',
        },
        {
          name: '一般',
          type: 'none',
        },
        {
          name: '拔草',
          type: 'pull',
        },
        {
          name: '激励词',
          type: 'goodWord'
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['showSpotRecheck']),
    scoreConfigList () {
      if (Object.keys(this.allScoreConfigList).length) {
        return this.allScoreConfigList[this.tabName].list
      } else {
        return []
      }
    },
    showScoreLimit () {
      if (Object.keys(this.allScoreConfigList).length && this.tabName !== 'goodWord') {
        return {
          top: this.allScoreConfigList[this.tabName].maxScore,
          bottom: this.allScoreConfigList[this.tabName].minScore
        }
      } else {
        return {
          top: '--',
          bottom: '--'
        }
      }
    }
  },
  watch: {
    weight () {
      this.weightObject.score = this.weight
    }
  },
  created () {
    this.getWeight()
    this.getScoreConfigList()
  },
  methods: {
    /**
     * @description 重制标签
     */
    resetIssue (sendData) {
      const findClassIndex = this.scoreConfigList.findIndex(item => item.key === sendData.key)
      if (findClassIndex >= 0) {
        this.$set(this.scoreConfigList, findClassIndex, sendData.cacheData)
      }
    },
    /**
     * @description 显示权重值
     */
    showWeight () {
      this.cacheWeight = this.weight
      this.showConfigWeight = true
    },
    /**
     * @description 设置权重值
     */
    async setWeight () {
      try {
        if (this.cacheWeight > 100 || this.cacheWeight <= 0 || isNaN(Number(this.cacheWeight))) {
          throw new Error('请填写正确的权重值')
        }
        this.$store.dispatch('setting/showLoading', this.routeName)
        const req = { score: this.cacheWeight }
        const res = await GradeConfiguration.setWeightsScore(req)
        if (res) {
          this.weight = this.cacheWeight
          this.showConfigWeight = false
        }
      } catch (error) {
        if (error.message) {
          this.$newMessage.warning(error.message)
        }
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 取消权重值
     */
    cancelWeight () {
      this.showConfigWeight = false
    },
    /**
     * @description 获取权重值
     */
    async getWeight () {
      this.weight = await GradeConfiguration.getWeightsScore()
    },
    /**
     * @description 获取云学院评分配置
     */
    async getScoreConfigList () {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        this.allScoreConfigList = await GradeConfiguration.getScoreConfigList()
        this.gradeLimit.top = this.allScoreConfigList[this.tabName].maxScore
        this.gradeLimit.bottom = this.allScoreConfigList[this.tabName].minScore
      } catch (error) {
        console.error(error)
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    tabChange (e) {
      if (e.name === 'goodWord') return
      this.gradeLimit.top = this.allScoreConfigList[e.name].maxScore
      this.gradeLimit.bottom = this.allScoreConfigList[e.name].minScore
    },
    /**
     * @description 添加大类
     */
    addNewAddClass () {
      if (this.tabName === 'goodWord') {
        this.$message({
          type: 'warning',
          message: '激励词不能添加评分类!'
        })
        return
      }
      const createData = {
        key: uuidv4(),
        name: '',
        child: [],
        isEdit: true,
        isNewAdd: true,
        scoreTypeId: PlantTypeIdEnum[this.tabName]
      }
      for (let index = 0; index < this.newIssueItem; index++) {
        createData.child.push({
          key: uuidv4(),
          name: '',
          weights: 1,
          isEdit: true
        })
      }
      this.scoreConfigList.push(createData)
      this.showAddNewClassProp = false
    },
    /**
     * @description 确认清除
     */
    async setEmpty () {
      let params = {}
      if (this.emptyPeople.length > 0) {
        params.staffIds = this.emptyPeople
      }
      const msg = GradeConfiguration.emptyCheckPoolByStaffId(params)
      if (msg) {
        this.$newMessage.success('清除成功')
        this.emptyPeople = []
        this.showEmptyDialog = false
      }
    },
    /**
     * @description 设置限制
     */
    async setGradeLimit () {
      let { bottom, top } = this.gradeLimit
      bottom = parseFloat(bottom)
      top = parseFloat(top)
      if (!this.judgeLimit(bottom, top)) return
      const req = {
        scoreTypeId: String(PlantTypeIdEnum[this.tabName]),
        minScore: bottom,
        maxScore: top,
      }
      const msg = await GradeConfiguration.editScoreLimit(req)
      if (msg) {
        this.getScoreConfigList()
        this.gradeLimitDialog = false
      }
    },
    /**
     * @description 设置限制
     */
    judgeLimit (bottom, top) {
      if (this.tabName === 'goodWord') {
        this.$message({
          type: 'warning',
          message: '激励词不能设置分数限制!'
        })
        return false
      }
      if (Math.floor(bottom) !== bottom || Math.floor(top) !== top) {
        this.$message({
          type: 'warning',
          message: '分数设置需要为整数!'
        })
        return false
      }
      if (bottom < 0 || bottom > 100 || top < 0 || top > 100) {
        this.$message({
          type: 'warning',
          message: '分数设置只能再0-100之间的整数!'
        })
        return false
      }
      if (bottom > top) {
        this.$message({
          type: 'warning',
          message: '下限不能高于上限'
        })
        return false
      }
      return true
    }
  }
}
</script>

<style lang="less" scoped>
.grade-configuration {
  height: calc(100% - 14px);

  .main {
    height: 100%;
    padding: 0 24px 19px;
    overflow: overlay;

    .add-configuration-item {
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      justify-content: space-between;
      padding: 19px 0 24px;
      background-color: #fff;

      .right {
        display: flex;
        align-items: center;

        .deploy-weight,
        .grade-limit {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-right: 10px;

          .weight-info {
            font-size: 14px;
            font-weight: 400;
            line-height: 20px;
            color: #606266;
          }
        }
      }
    }

    .no-data-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: calc(100% - 40px);

      img {
        width: 291px;
        height: 210px;
      }

      .desc {
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
        color: #606266;
      }
    }
  }

  .empty-dialog {
    .el-select {
      margin-left: 10px;
    }

    .all-empty-warning {
      margin-left: 10px;
      color: red;
    }
  }

  .grade-limit-dialog {
    .grade-limit-dialog-cont {
      display: flex;
      align-items: center;

      .el-input {
        width: 100px;
        margin: 10px;
      }
    }
  }

  .weight-dialog {
    .config-weight-box {
      .from-box {
        margin-bottom: 10px;

        .el-input {
          width: 100px;

          & /deep/ .el-input__inner {
            text-align: center;
          }
        }
      }

      .weight-desc {
        color: #808080;
      }
    }
  }

  & /deep/ .el-dialog--center {
    .el-dialog__body {
      padding: 20px !important;
    }
  }
}
</style>
