import exportPerformanceExcel, { headerCellkeys, getGradeMouth } from "@/utils/exportPerformanceExcel.js"
import moment from 'moment'
import * as Performance from '@/api/performance.js'

export default {
  data() {
    return {
      headerKeys: headerCellkeys,
      editInfo: {} // 编辑修图绩效信息
    }
  },
  methods: {
    /**
     * @description 获取修图绩效
     */
    async searchPerformance (page) {
      try {
        if (!this.timeSpan) return this.$newMessage.warning('请输入时间')
        this.$store.dispatch('setting/showLoading', this.routeName)
        const req = {
          type: this.searchType,
          cycle: this.timeSpan
        }
        if (this.pager) {
          this.pager.page = page === 1 ? 1 : this.pager.page
          req.page = this.pager.page,
          req.pageSize = this.pager.pageSize
        }
        // 云端绩效管理，查询修图师绩效
        if (this.staffIds && this.staffIds.length) {
          req.staffIds = this.staffIds
          req.type = 'some'
        }
        const data = await Performance.getStaffPerformance(req)
        this.tableData = data.list
        if (this.pager) { this.pager.total = data.total }
      } catch (error) {
        console.error(error)
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 修改成绩
     */
    alterPerformance (performanceInfo) {
      this.editInfo = performanceInfo
      this.dialogVisible = true
    },
    /**
     * @description 关闭弹出框
     */
    closeDialog (action) {
      this.dialogVisible = false
      if (action === 'refreshList') {
        this.searchPerformance()
      }
    },
    /**
     * @description 下载绩效模版
     */
    async downPerformanceTemplete () {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await Performance.getCanScoreStaff(this.searchType)
        const gradeMouth = getGradeMouth()
        this.canUpdatePerformance()
        const title = this.searchType === 'retoucherLeader' ? `修图主管${gradeMouth}月` : `组员${gradeMouth}月`
        exportPerformanceExcel(title, data)
      } catch (error) {
        console.error(error)
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 处理完成
     */
    async handleSuccess ({ results }) {
      try {
        results.splice(0, 1)
        const reg = /^\d+\.?\d{0,2}$/g
        const hasEveryScore = results.every(item => {
          const hasScore = Boolean(item.score)
          const isDecimal = reg.test(item.score)
          return hasScore && isDecimal
        })
        if (!hasEveryScore) throw new Error('分数没有填写完整！')
        const staffScores = results.map(item => {
          return {
            id: item.staffNum,
            score: Number(item.score),
            name: item.name
          }
        })
        await this.saveRetouchPerformance(staffScores)
        const nowDate = moment(new Date())
        this.timeSpan = nowDate.format('YYYYMM')
        this.searchPerformance()
      } catch (error) {
        if (error.message) this.$newMessage.warning(error.message)
        console.error(error)
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 上传表格前
     */
    beforeUpload () {
      if (!this.canUpdatePerformance()) return false
      this.$store.dispatch('setting/showLoading', this.routeName)
      return true
    },
    /**
     * @description 批量保存组员分数
     */
    async saveRetouchPerformance (staffScores) {
      const req = {
        type: this.searchType,
        staffScores
      }
      await Performance.batchSaveStaffScores(req)
    },
    /**
     * @description 判断能否导入绩效
     */
    canUpdatePerformance() {
      const nowDate = moment(new Date())
      const day = nowDate.date()
      if (day > 10 && day < 20) {
        this.$newMessage.warning('只能在当月20日后和次月10日后导入绩效')
        return false
      }
      return true
    }
  }
}
