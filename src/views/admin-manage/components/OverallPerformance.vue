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
    <div class="module-panel">
      <div class="data-info-box">
        <div class="panel-title">修图数据</div>
        <div class="info-flex">
          <div class="info-box-row">
            <div class="info-box">
              <div class="info-title">摄影上传张数（单人/双人）</div>
              <div class="info-content">
                <count-to :end-value="otherInfo.photographyUploadPhotoNum.single" />
                /
                <count-to :end-value="otherInfo.photographyUploadPhotoNum.multi" />
              </div>
            </div>
            <div class="info-box">
              <div class="info-title">摄影上传单</div>
              <div class="info-content">
                <count-to :end-value="otherInfo.photographOrgUploadStreamNum" />
              </div>
            </div>
          </div>
          <div class="info-line" />
          <div class="info-box-row">
            <div class="info-box">
              <div class="info-title">模板照（完成/生产）</div>
              <div class="info-content">
                <count-to :end-value="otherInfo.templatePhotoNum.overTemplatePhotoNum" />
                /
                <count-to :end-value="otherInfo.templatePhotoNum.photographOrgUploadTemplatePhotoNum" />
              </div>
            </div>
            <div class="info-box">
              <div class="info-title">重修率</div>
              <div class="info-content">
                <count-to :end-value="otherInfo.reworkRate" />%
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="chart-box">
        <div class="photo-chart">
          <retouch-photo-count :photo-data="photoCountData" />
        </div>
        <div class="stream-chart">
          <retouch-stream-count :stream-data="streamCountData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import CountTo from '@/components/CountTo'
import moment from 'moment'
import RetouchPhotoCount from './chart-components/RetouchPhotoCount'
import RetouchStreamCount from './chart-components/RetouchStreamCount'
import { joinTimeSpan } from '@/utils/timespan.js'
import * as WorkManage from '@/api/workManage'

export default {
  name: 'OverallPerformance',
  components: { DatePicker, RetouchPhotoCount, RetouchStreamCount, CountTo },
  data () {
    return {
      timeSpan: null,
      loading: false,
      photoCountData: {
        cloudRetouchPhotoNum: { single: 0, multi: 0 },
        outerRetouchPhotoNum: { single: 0, multi: 0 }
      },
      streamCountData: {
        cloudRetouchPhotoStream: '0',
        outerRetouchStreamNum: '0'
      },
      otherInfo: {
        reworkRate: '0',
        templatePhotoNum: { overTemplatePhotoNum: 0, photographOrgUploadTemplatePhotoNum: 0 },
        photographOrgUploadStreamNum: '0',
        photographyUploadPhotoNum: { single: 0, multi: 0 }
      }
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
        for (const key in data) {
          if (this.photoCountData[key]) {
            this.photoCountData[key] = data[key]
          }
          if (this.streamCountData[key]) {
            this.streamCountData[key] = data[key]
          }
          if (this.otherInfo[key]) {
            this.otherInfo[key] = data[key]
          }
        }
      } catch (error) {
        console.error(error)
      } finally {
        setTimeout(() => {
          this.loading = false
        }, 500)
      }
    }
  }
}
</script>

<style lang="less">
.overall-performance {
  .search-box {
    margin-bottom: 32px;
  }

  .module-panel {
    display: flex;
    padding: 38px 0 13px;
    border-top: 1px solid #e8e8e8;
    border-radius: 0;
    box-shadow: none;

    .data-info-box {
      width: 320px;

      .panel-title {
        margin-bottom: 28px;
      }

      .info-flex {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: calc(~'100% - 52px');

        .info-line {
          width: 100%;
          height: 1px;
          background-color: #ebeef5;
        }
      }

      .info-box-row {
        display: grid;
        grid-template-columns: 2fr 1fr;

        .info-box {
          padding-left: 12px;

          .info-title {
            font-size: 12px;
            line-height: 17px;
            color: #909399;
          }

          .info-content {
            padding: 8px 0;
            font-size: 24px;
            line-height: 28px;
            color: #303133;
          }
        }
      }
    }

    .chart-box {
      display: flex;
      width: calc(~'100% - 320px');

      .photo-chart {
        border-right: 1px solid #ebeef5;
      }

      .stream-chart,
      .photo-chart {
        width: 381px;
      }
    }
  }
}
</style>
