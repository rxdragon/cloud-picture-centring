<template>
  <div class="overall-performance">
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
import { joinTimeSpan } from '@/utils/timespan.js'
import * as WorkManage from '@/api/workManage'

export default {
  name: 'OverallPerformance',
  components: {
    DatePicker,
    ListTable
  },
  data () {
    return {
      timeSpan: '',
      listDataOne: [{
        key: 'photographyUploadPhotoNum',
        label: '摄影上传张数(单人 / 多人)',
        value: ''
      }, {
        key: 'reviewPhotoNum',
        label: '总已修张数(单人 / 多人)',
        value: ''
      }, {
        key: 'cloudRetouchPhotoNum',
        label: '云端已修张数(单人 / 多人)',
        value: ''
      }, {
        key: 'templatePhotoNum',
        label: '模版照(完成 / 生成)',
        value: ''
      }, {
        key: 'outerRetouchPhotoNum',
        label: '外包已修张数(单人 / 多人)',
        value: ''
      }, {
        key: 'overTimeStreamNum',
        label: '超时单量',
        value: ''
      }],
      listDataTwo: [{
        key: 'storeEvaluateScoreAvg',
        label: '门店评分(平均值)',
        value: ''
      }, {
        key: 'reviewPhotoPlantNum',
        label: '种草率',
        value: ''
      }, {
        key: 'reviewPhotoPullNum',
        label: '拔草率',
        value: ''
      }, {
        key: 'retouchReworkNum',
        label: '重修率',
        value: ''
      }]
    }
  },
  created () {
    this.getWholeQuota()
  },
  methods: {
    getParams () {
      const req = {}
      if (this.timeSpan) {
        req.startAt = joinTimeSpan(this.timeSpan[0])
        req.endAt = joinTimeSpan(this.timeSpan[1], 1)
      }
      return req
    },
    /**
     * @description 获取总体绩效
     */
    getWholeQuota () {
      const req = this.getParams()
      WorkManage.getWholeQuota(req).then(data => {
        this.listDataOne.forEach(item => {
          item.value = data[item.key]
        })
        this.listDataTwo.forEach(item => {
          item.value = data[item.key]
        })
      })
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
