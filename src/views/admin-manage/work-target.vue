<template>
  <div class="work-target">
    <transition name="fade-transform" mode="out-in">
      <div v-if="!isAddShow" class="show-box">
        <div class="header">
          <h3>云端工作指标</h3>
          <!-- <el-button type="primary" @click="addWorkLoad">配置建议工作量</el-button> -->
        </div>
        <div class="search-box">
          <div class="search-item">
            <span>时间</span>
            <date-picker v-model="timeSpan" type="date" />
          </div>
          <div class="button-box">
            <el-button type="primary" @click="getCloudRetoucherQuota">查询</el-button>
          </div>
        </div>
        <div class="list-table-box module-panel">
          <list-table :listdata="listData" />
        </div>
        <div class="table-box">
          <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="groupName" label="修图组" />
            <el-table-column prop="groupLeader" label="组长" />
            <el-table-column prop="expectPhotoNum" label="预计完成（张）" />
            <el-table-column prop="finishPhotoNum" label="实际完成（张）" />
            <el-table-column v-if="isToday" prop="groupName" label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="adjustWork(scope.row)">调整工作量</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <!-- 调整工作量弹框 -->
        <el-dialog
          width="400px"
          title="调整工作量"
          center
          :before-close="dialogClose"
          :visible.sync="dialogVisible"
        >
          <el-form ref="form" label-width="100px">
            <el-form-item label="建议工作量：">
              <span>{{ suggestPhotoNum }}</span>
            </el-form-item>
            <el-form-item label="预计完成：">
              <el-input v-model="predictFinish" v-numberOnly />
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="onSubmitDigData">确 定</el-button>
          </span>
        </el-dialog>
      </div>
      <add-work-load v-else :is-add-show.sync="isAddShow" />
    </transition>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import ListTable from '@/components/ListTable'
import limitNum from '@/directive/limit-num'
import AddWorkLoad from './components/AddWorkLoad'
import { parseTime } from '@/utils'

import * as WorkManage from '@/api/workManage.js'

export default {
  name: 'WorkTarget',
  directives: { limitNum },
  components: { DatePicker, ListTable, AddWorkLoad },
  data () {
    return {
      timeSpan: '', // 时间
      listData: [{
        label: '预计完成总量',
        value: '-'
      }, {
        label: '实际上传总量',
        value: '-'
      }, {
        label: '已完成总量（张）',
        value: '-'
      }, {
        label: '预计完成率',
        value: '-'
      }, {
        label: '实际完成率',
        value: '-'
      }],
      tableData: [], // 列表数据
      dialogVisible: false, // 是否显示弹框
      groudId: '', // 编辑组id
      suggestPhotoNum: 0, // 建议完成量
      predictFinish: '', // 预计完成数
      isAddShow: false // 是否显示配置建议工作量
    }
  },
  computed: {
    // 是否当日
    isToday () {
      const today = new Date().getTime()
      return this.timeSpan === parseTime(today, '{y}-{m}-{d}')
    }
  },
  watch: {
    isAddShow: {
      handler: function (value) {
        if (!value) { this.getCloudRetoucherQuota() }
      }
    }
  },
  created () {
    const today = new Date().getTime()
    this.timeSpan = parseTime(today, '{y}-{m}-{d}')
    this.getCloudRetoucherQuota()
  },
  methods: {
    /**
     * @description 调整工作量
     */
    adjustWork (listItem) {
      this.suggestPhotoNum = listItem.suggestPhotoNum
      this.groudId = listItem.groupId
      this.dialogVisible = true
    },
    /**
     * @description 弹出框关闭
     */
    dialogClose () {
      this.predictFinish = ''
      this.suggestPhotoNum = ''
      this.groudId = ''
      this.dialogVisible = false
    },
    /**
     * @description 确认工作量
     */
    onSubmitDigData () {
      if (!this.predictFinish) {
        this.$newMessage.warning('请输入预计完成量')
        return false
      }
      const reqData = {
        groupId: this.groudId,
        expectPhotoNum: this.predictFinish
      }
      WorkManage.editRetoucherGroupTargetQuota(reqData)
        .then(() => {
          this.$newMessage.success('编辑成功')
          this.dialogVisible = false
        })
    },
    /**
     * @description 配置建议工作量
     */
    addWorkLoad () {
      this.isAddShow = true
    },
    /**
     * @description 获取云端工作指标
     */
    async getCloudRetoucherQuota () {
      try {
        if (!this.timeSpan) {
          this.$newMessage.warning('请输入时间')
          return false
        }
        const reqData = { year: this.timeSpan }
        const data = await WorkManage.getCloudRetoucherQuota(reqData)
        this.listData = data.listData
        this.tableData = data.groups
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        throw new Error(error)
      }
    }
  }
}
</script>

<style lang="less">
@import "~@/styles/variables.less";
.work-target {
  .list-table-box {
    margin-top: 20px;
    width: 80%;
  }
}
</style>
