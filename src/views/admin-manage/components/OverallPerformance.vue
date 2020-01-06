<template>
  <div v-loading="loading" class="overall-performance">
    <!-- 搜索盒 -->
    <div class="search-box">
      <div class="search-item">
        <span>时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <div class="button-box">
        <el-button type="primary" @click="getWholeQuota">查询</el-button>
      </div>
    </div>
    <div class="table-panel">
      <list-table :listdata="listDataOne" />
      <list-table :listdata="listDataTwo" />
    </div>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import ListTable from '@/components/ListTable'
import moment from 'moment'
import { joinTimeSpan } from '@/utils/timespan.js'
import * as WorkManage from '@/api/workManage'

export default {
  name: 'OverallPerformance',
  components: { DatePicker, ListTable },
  data () {
    return {
      timeSpan: null,
      loading: false,
      listDataOne: [{
        key: 'photographyUploadPhotoNum',
        label: '摄影上传张数(单人 / 多人)',
        value: ''
      }, {
        key: 'reviewPhotoNum',
        label: '摄影上传单',
        value: ''
      }, {
        key: 'cloudRetouchPhotoNum',
        label: '总已修张数(单人 / 多人)',
        value: ''
      }, {
        key: 'reviewPhotoNum',
        label: '总已修单量',
        value: ''
      }, {
        key: 'cloudRetouchPhotoNum',
        label: '云端已修张数(单人 / 多人)',
        value: ''
      }, {
        key: 'reviewPhotoNum',
        label: '云端已修单量',
        value: ''
      }],
      listDataTwo: [{
        key: 'templatePhotoNum',
        label: '模版照(完成 / 生成)',
        value: ''
      }, {
        key: 'outerRetouchPhotoNum',
        label: '外包已修张数(单人 / 多人)',
        value: ''
      }, {
        key: 'reviewPhotoNum',
        label: '外包已修单',
        value: ''
      }, {
        key: 'retouchReworkNum',
        label: '重修率',
        value: ''
      }]
    }
  },
  created () {
    const nowAt = moment().locale('zh-cn').format('YYYY-MM-DD')
    this.timeSpan = [nowAt, nowAt]
    this.getWholeQuota()
  },
  methods: {
    /**
     * @description 获取参数
     */
    getParams () {
      const req = {}
      if (!this.timeSpan) {
        this.$newMessage.warning('请填写时间')
        return false
      }
      req.startAt = joinTimeSpan(this.timeSpan[0])
      req.endAt = joinTimeSpan(this.timeSpan[1], 1)
      return req
    },
    /**
     * @description 获取总体绩效
     */
    async getWholeQuota () {
      try {
        const req = this.getParams()
        if (!req) return
        this.loading = true
        const data = await WorkManage.getWholeQuota(req)
        this.listDataOne.forEach(item => {
          item.value = data[item.key]
        })
        this.listDataTwo.forEach(item => {
          item.value = data[item.key]
        })
      } catch (error) {
        console.error(error)
      } finally {
        setTimeout(() => { this.loading = false }, 500)
      }
    }
  }
}
</script>

<style lang="less">
.overall-performance {
  .table-panel {
    margin-top: 20px;
  }
}
</style>
