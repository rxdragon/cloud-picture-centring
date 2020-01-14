<template>
  <div v-loading="loading" class="report-box">
    <div class="list-tabel list-tabel-one">
      <div v-for="(listItem, listIndex) in tableDataCount" :key="listIndex" class="list-box">
        <div class="title">{{ listItem.label }}</div>
        <div class="content">
          <el-link
            v-if="listItem.componentSwitch"
            type="primary"
            class="el-router-link"
            @click="componentChange(listItem)"
          >
            {{ listItem.value }}
          </el-link>
          <template v-else>{{ listItem.value }}</template>
        </div>
      </div>
    </div>
    <div
      class="list-tabel"
      style="grid-template-columns: repeat(5, 1fr);"
    >
      <div v-for="(listItem, listIndex) in tableDataRate" :key="listIndex" class="list-box">
        <div class="title">{{ listItem.label }}</div>
        <div class="content">
          <el-link
            v-if="listItem.componentSwitch"
            type="primary"
            class="el-router-link"
            @click="componentChange(listItem)"
          >
            {{ listItem.value }}
          </el-link>
          <template v-else>{{ listItem.value }}</template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as ReviewCheck from '@/api/reviewCheck.js'
import { joinTimeSpan } from '@/utils/timespan.js'
import { SearchType } from '@/utils/enumerate.js'

export default {
  name: 'ReportBox',
  props: {
    staffId: { type: [Number, String], required: true },
    timeSpan: { type: Array, required: true }
  },
  data () {
    return {
      tableDataCount: {
        reviewerReviewStreamNum: { label: '审核单量', value: '-', componentSwitch: true },
        reviewerReviewPhotoNum: { label: '审核张数', value: '-' },
        reviewTimeAvgStream: { label: '审核平均用时(单)', value: '-' },
        reviewTimeAvgPhoto: { label: '审核平均用时(张)', value: '-' },
        reviewPhotoPlantInfo: { label: '审核种草(张) / 种草率(%)', value: '-', componentSwitch: true, searchType: SearchType.CheckPlant },
        reviewPhotoPullInfo: { label: '审核拔草(张) / 拔草率(%)', value: '-', componentSwitch: true, searchType: SearchType.CheckPull },
        spotCheckPhotoPlantInfo: { label: '抽查种草(张) / 种草率(%)', value: '-', componentSwitch: true, searchType: SearchType.SpotPlant },
        spotCheckPhotoPullInfo: { label: '抽查拔草(张) / 拔草率(%)', value: '-', componentSwitch: true, searchType: SearchType.SpotPull }
      },
      tableDataRate: {
        rectifyDifferentPhotoInfo: { label: '纠偏意见不同单位：(张 / %)', value: '- / -', componentSwitch: true, searchType: SearchType.RectifyDifferent },
        rectifyDifferentPlantPhotoInfo: { label: '纠偏意见不同-种草单位：(张 / %)', value: '- / -', componentSwitch: true, searchType: SearchType.RectifyPlant },
        rectifyDifferentPullPhotoInfo: { label: '纠偏意见不同-拔草单位：(张 / %)', value: '- / -', componentSwitch: true, searchType: SearchType.RectifyPull },
        rectifyDifferentNoGrassPhotoInfo: { label: '纠偏意见不同-不种不拔单位：(张 / %)', value: '- / -', componentSwitch: true, searchType: SearchType.RectifyNone },
        rectifySamePhotoInfo: { label: '纠偏意见相同单位：(张 / %)', value: '- / -', componentSwitch: true, searchType: SearchType.RectifySame }
      },
      loading: false
    }
  },
  watch: {
    timeSpan: {
      handler (value) {
        if (value.length) {
          this.getReviewCheckInfo()
        }
      },
      immediate: true
    }
  },
  methods: {
    /**
     * @description 获取审核数据
     */
    async getReviewCheckInfo () {
      try {
        const reqData = {
          range: 'group',
          startAt: joinTimeSpan(this.timeSpan[0]),
          endAt: joinTimeSpan(this.timeSpan[1], 1)
        }
        if (this.staffId) { reqData.staffId = this.staffId }
        this.loading = true
        const data = await ReviewCheck.getGroupReviewQuotaBySelf(reqData)
        for (const key in data) {
          if (this.tableDataCount[key]) {
            this.tableDataCount[key].value = data[key]
          } else if (this.tableDataRate[key]) {
            this.tableDataRate[key].value = data[key]
          }
        }
      } catch (error) {
        console.error(error)
      } finally {
        setTimeout(() => {
          this.loading = false
        }, 500)
      }
    },
    /**
     * @description 跳转链接
     */
    componentChange (item) {
      const data = {
        searchType: item.searchType || '',
        staffId: this.staffId
      }
      this.$emit('showDetail', data)
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";

.report-box {
  .list-tabel {
    display: grid;
    text-align: center;
    border-bottom: 1px solid #f2f6fc;
  }

  .list-tabel-one {
    grid-template-columns: 2fr 2fr 3fr 3fr 3fr 3fr 3fr 3fr;
  }

  .list-box {
    display: flex;
    flex-direction: column;
  }

  .title {
    background-color: #fafafa;
    font-size: 14px;
    font-family: @pingFang;
    font-weight: 500;
    color: #303133;
    line-height: 22px;
    padding: 17px 20px;
    text-align: left;
    height: 100%;
    max-height: 78px;
    display: flex;
    align-items: center;
  }

  .content {
    padding: 21px 20px;
    font-size: 14px;
    text-align: left;
    height: 58px;
    background-color: #fff;

    .el-router-link {
      text-decoration: underline;
    }

    a {
      color: @blue;
    }
  }
}
</style>
