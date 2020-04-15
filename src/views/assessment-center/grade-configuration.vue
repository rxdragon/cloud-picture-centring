<template>
  <div class="grade-configuration">
    <div class="header">
      <h3>云学院评分配置</h3>
      <div class="deploy-weight">
        <span class="weight-info">当前权重比 1(点) : {{ weight }}(分)</span>
        <el-button type="primary" @click="showWeight">配置权重分值</el-button>
      </div>
    </div>
    <div class="main module-panel">
      <div class="add-configuration-item">
        <el-popover
          placement="bottom-end"
          width="462"
          popper-class="add-new-item"
          :offset="20"
          v-model="showAddNewClassProp"
          trigger="click">
          <div class="add-item-main">
            <span class="add-desc">细类评分项数量：</span>
            <el-input-number v-model="newIssueItem" :min="1" :max="10" label="添加数量"></el-input-number>
            <el-button @click="addNewAddClass" size="small" type="primary">确认</el-button>
            <el-button @click="showAddNewClassProp = false" size="small" type="info">取消</el-button>
          </div>
          <el-button slot="reference" type="primary">添加评分类</el-button>
        </el-popover>
      </div>
      <div class="configuration-main" v-if="scoreConfigList.length">
        <issue-class v-for="issueClass in scoreConfigList"
          @getList="getScoreConfigList"
          :key="issueClass.key" :issue-class-data="issueClass" />
      </div>
      <div class="no-data-box" v-else>
        <img src="@/assets/404_images/no-data.png" alt="">
        <span class="desc">当前暂无评分项</span>
      </div>
    </div>
    <!-- 配置弹出框 -->
    <el-dialog
      width="35%"
      title="权重点配置"
      custom-class="weight-dialog"
      center
      :visible.sync="showConfigWeight">
      <div class="config-weight-box">
        <div class="from-box">
          权重点配置：1点 - <el-input v-model="cacheWeight" v-numberOnly type="number" min="1" max="100" placeholder="请输入分值"></el-input> 分
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
  </div>
</template>

<script>
import IssueClass from './components/GradeConfig/IssueClass'
import uuidv4 from 'uuid'
import * as GradeConfiguration from '@/api/gradeConfiguration.js'

export default {
  name: 'GradeConfiguration',
  components: { IssueClass },
  provide () {
    return {
      weight: this.weightObject
    }
  },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      showConfigWeight: false,
      weight: '',
      cacheWeight: '',
      scoreConfigList: [],
      showAddNewClassProp: false,
      newIssueItem: 1,
      weightObject: {
        score: 0
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
        await GradeConfiguration.setWeightsScore(req)
        this.weight = this.cacheWeight
        this.showConfigWeight = false
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
        this.scoreConfigList = await GradeConfiguration.getScoreConfigList()
      } catch (error) {
        console.error(error)
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 添加大类
     */
    addNewAddClass () {
      const createData = {
        key: uuidv4(),
        name: '',
        child: [],
        isEdit: true,
        isNewAdd: true
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
    }
  }
}
</script>

<style lang="less" scoped>
.grade-configuration {
  height: calc(100% - 14px);

  .header {
    .deploy-weight {
      display: flex;
      align-items: center;

      .weight-info {
        margin-right: 20px;
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
        color: #606266;
      }
    }
  }

  .main {
    height: 100%;
    padding: 0 24px 19px;
    overflow: overlay;

    .add-configuration-item {
      position: sticky;
      top: 0;
      padding: 19px 0 24px;
      background-color: #fff;
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
