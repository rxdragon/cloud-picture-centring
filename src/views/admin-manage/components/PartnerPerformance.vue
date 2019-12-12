<template>
  <div class="partner-performance">
    <div class="search-box">
      <div class="search-item">
        <span>审核通过时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <div class="staff-search search-item">
        <span>云端伙伴</span>
        <staff-select v-model="staffIds" />
      </div>
      <div class="button-box">
        <el-button type="primary" @click="getRetoucherQuota(1)">查询</el-button>
      </div>
    </div>
    <div class="table-panel">
      <list-table :listdata="listDataOne" />
      <list-table :listdata="listDataTwo" />
      <list-table :listdata="listDataThree" />
      <list-table :listdata="listDataFour" />
    </div>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import ListTable from '@/components/ListTable'
import StaffSelect from '@SelectBox/StaffSelect'
import { joinTimeSpan } from '@/utils/timespan.js'
import * as WorkManage from '@/api/workManage'

export default {
  name: 'PartnerPerformance',
  components: { DatePicker, ListTable, StaffSelect },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 时间戳
      staffIds: [], // 伙伴id
      listDataOne: {
        retouchSinglePhotoNum: {
          label: '修图数量-单人(单位：张)',
          value: '-'
        },
        retouchMultiPhotoNum: {
          label: '修图数量-多人(单位：张)',
          value: '-'
        },
        retoucherFinishStreamNum: {
          label: '修图单量（单位：单）',
          value: '-'
        },
        reviewPlantRate: {
          label: '审核种草数 / 种草率',
          value: '- / -'
        },
        reviewPullRate: {
          label: '审核拔草数 / 拔草率',
          value: '- / -'
        }
      },
      listDataTwo: {
        retoucherEvaluatedPlantRate: {
          label: '抽查种草数 / 种草率',
          value: '- / -'
        },
        retoucherEvaluatedPullRate: {
          label: '抽查拔草数 / 拔草率',
          value: '- / -'
        },
        retoucherEvaluatedNoPlantNoPullRate: {
          label: '抽查通过数 / 通过率',
          value: '- / -'
        },
        storeEvaluateScoreAvg: {
          label: '门店评分（平均值）',
          value: '-'
        },
        retoucherNpsAvg: {
          label: '顾客满意度（平均值）',
          value: '-'
        }
      },
      listDataThree: {
        exp: {
          label: '海草值',
          value: '-'
        },
        income: {
          label: '收益',
          value: '-'
        },
        overTimeStreamNum: {
          label: '超时单量',
          value: '-'
        },
        storeReturnStreamNum: {
          label: '门店退单',
          value: '-'
        }
      },
      listDataFour: {
        storeReturnPhotoNum: {
          label: '门店退单照片 单位：张',
          value: '-'
        },
        storeReturnStreamNumForQuality: {
          label: '门店退单（非质量问题）',
          value: '-'
        },
        storeReturnPhotoNumForQuality: {
          label: '门店退单照片（非质量问题）单位：张',
          value: '-'
        },
        storeReturnStreamNumForNotQuality: {
          label: '门店退单（质量问题）',
          value: '-'
        },
        storeReturnPhotoNumForNotQuality: {
          label: '门店退单照片（非质量问题）单位：张',
          value: '-'
        }
      }
    }
  },
  methods: {
    /**
     * @description 获取参数
     */
    getParams () {
      if (!this.timeSpan) {
        this.$newMessage.warning('请填写时间')
        return false
      }
      const req = {
        startAt: joinTimeSpan(this.timeSpan[0]),
        endAt: joinTimeSpan(this.timeSpan[1], 1)
      }
      if (this.staffIds.length) { req.staffIds = this.staffIds }
      return req
    },
    /**
     * @description 获取伙伴绩效
     */
    async getRetoucherQuota () {
      try {
        const req = this.getParams()
        if (!req) return false
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await WorkManage.getRetoucherQuota(req)
        for (const key in this.listDataOne) { this.listDataOne[key].value = data[key] }
        for (const key in this.listDataTwo) {
          this.listDataTwo[key].value = data[key]
          if (key === 'income') { this.listDataTwo[key].value = '¥' + (this.listDataTwo[key].value).toFixed(2) }
        }
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    }
  }
}
</script>

<style lang="less">
.partner-performance {
  .search-box {
    .button-box {
      text-align: right;
    }

    .outsourc-staff-search {
      .el-input {
        width: 180px;
      }
    }

    .date-picker .el-range-editor.el-input__inner {
      width: 260px;
    }

    .el-date-editor .el-range-separator {
      width: 7%;
    }
  }

  .table-panel {
    margin-top: 24px;
  }
}
</style>
