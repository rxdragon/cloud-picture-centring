<template>
  <div class="cloud-assessment">
    <div class="header" :class="headerClass">
      <h3>云学院评价中心</h3>
    </div>
    <el-scrollbar ref="scrollContainer" :vertical="false" class="scroll-container" @wheel.native="handleScroll">
      <div class="search-box">
        <div class="search-item">
          <span>审核通过时间</span>
          <date-picker v-model="timeSpan" value-format="yyyy-MM-dd" />
        </div>
        <div class="search-item">
          <span>修图标准</span>
          <institution-type v-model="institutionType" />
        </div>
        <div class="sample-num search-item">
          <span>伙伴抽样量</span>
          <el-select v-model="sampleNum" placeholder="单次不可超过5张">
            <el-option :label="1" :value="1" />
            <el-option :label="2" :value="2" />
            <el-option :label="3" :value="3" />
            <el-option :label="4" :value="4" />
            <el-option :label="5" :value="5" />
          </el-select>
        </div>
        <div class="button-box">
          <el-button :disabled="Boolean(photoData.length)" type="primary" @click="takePhoto">抽 取</el-button>
        </div>
      </div>
      <div class="assessment-info module-panel">
        <div class="panel-title">
          今日完成数据
        </div>
        <div class="list-table">
          <div class="list-title">
            <span>今日已评价照片</span>
            <span>今日抽查种草率</span>
            <span>今日抽查拔草率</span>
            <span>本次抽取总单量</span>
          </div>
          <div class="list-content">
            <span>{{ todayInfo.evaluationNum || '-' }}</span>
            <span>{{ todayInfo.plantPercent || '-' }}</span>
            <span>{{ todayInfo.pullPercent || '-' }}</span>
            <span>{{ spotAllNum }}</span>
          </div>
        </div>
      </div>
      <!-- 订单数据 -->
      <grade-box
        v-for="photoItem in photoData"
        :key="photoItem.businessId"
        is-grade
        class="photo-data module-panel"
        :photo-info="photoItem"
        @finsihed="getHaveCheckResult"
      />
      <div class="page-box">
        <el-pagination
          :hide-on-single-page="true"
          :current-page.sync="pager.page"
          :page-size="pager.pageSize"
          layout="prev, pager, next"
          :total="pager.total"
          @current-change="handlePage"
        />
      </div>
    </el-scrollbar>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import InstitutionType from '@SelectBox/InstitutionType'
import GradeBox from './components/GradeBox'

import * as AssessmentCenter from '@/api/assessmentCenter'
import { joinTimeSpan } from '@/utils/timespan.js'

export default {
  name: 'CloudAssessment',
  components: { DatePicker, InstitutionType, GradeBox },
  data () {
    return {
      timeSpan: null, // 时间
      institutionType: 0, // 修图标准
      sampleNum: '', // 伙伴抽样量
      spotAllNum: '-',
      pager: {
        page: 1,
        pageSize: 10,
        total: 10
      },
      uuid: '', // id
      photoData: [], // 照片数据
      headerClass: '', // 顶部class
      isTakePhoto: false, // 是第一次抽取的照片
      todayInfo: {}
    }
  },
  computed: {
    scrollWrapper () {
      return this.$refs.scrollContainer.$refs.wrap
    }
  },
  created () {
    this.resetPage()
  },
  methods: {
    /**
     * @description 初始化页面
     */
    resetPage () {
      this.$store.dispatch('setting/showLoading')
      Promise.all([
        this.getStatistics(),
        this.getHaveCheckResult()
      ])
    },
    /**
     * @description 获取今日评价数据
     */
    async getStatistics () {
      this.todayInfo = await AssessmentCenter.getStatistics()
    },
    /**
     * @description 获取抽查数量参数
     */
    getTakeParams () {
      if (this.sampleNum > 5 || this.sampleNum <= 0) {
        this.$newMessage.warning('请填写正确的抽片量')
        return false
      }
      if (!this.timeSpan) {
        this.$newMessage.warning('请填写正确的时间')
        return false
      }
      const req = {
        takeNum: this.sampleNum,
        passStartAt: joinTimeSpan(this.timeSpan[0]),
        passEndAt: joinTimeSpan(this.timeSpan[1], 1)
      }
      if (this.institutionType) { req.retouchStandard = this.institutionType }
      return req
    },
    /**
     * @description 抽取
     */
    async takePhoto () {
      const req = this.getTakeParams()
      if (!req) return false
      this.$store.dispatch('setting/showLoading')
      const data = await AssessmentCenter.takePhoto(req)
      this.uuid = data
      this.isTakePhoto = true
      await this.getSpotCheckResult()
    },
    /**
     * @description 是否有抽片
     */
    getHaveCheckResult () {
      AssessmentCenter.getHaveCheckResult()
        .then(msg => {
          if (msg) {
            this.uuid = msg
            this.pager.page = 1
            this.getSpotCheckResult()
          } else {
            this.photoData = []
            this.spotAllNum = '-'
            this.pager.total = 10
            this.$store.dispatch('setting/hiddenLoading')
          }
        })
    },
    /**
     * @description 获取抽片数据
     */
    async getSpotCheckResult (page) {
      this.pager.page = page || this.pager.page
      const req = {
        uuid: this.uuid,
        skip: (this.pager.page - 1) * this.pager.pageSize,
        limit: this.pager.pageSize
      }
      const data = await AssessmentCenter.getSpotCheckResult(req)
      //  调试
      this.isTakePhoto = true

      if (this.isTakePhoto === true) {
        this.isTakePhoto = false
      }
      this.photoData = []
      this.photoData = data.list
      this.pager.total = this.spotAllNum = data.total
      this.$nextTick(() => {
        this.$store.dispatch('setting/hiddenLoading')
        this.$newMessage.success('抽取成功')
      })
    },
    /**
     * @description 监听页面变更
     */
    handlePage () {
      this.getSpotCheckResult()
    },
    /**
     * @description 处理滚动
     */
    handleScroll (e) {
      this.headerClass = this.scrollWrapper.scrollTop !== 0 ? 'header-fixed' : ''
    }
  }
}
</script>

<style lang="less">
 @import "~@/styles/variables.less";

.cloud-assessment {
  .header-fixed {
    box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.08);
    width: calc(~'100% + 56px');
    margin-left: -28px;
    padding: 0 28px 24px;
    z-index: 100;
    position: relative;
  }

  .search-box {
    .sample-num {
      display: flex;
      align-items: center;

      .el-input {
        width: 194px;
      }
    }

    .sample-num,
    .institution-select {
      .el-select {
        width: 160px;

        .el-input {
          width: 100%;
        }
      }
    }
  }

  .assessment-info {
    margin: 20px 0;

    .list-table {
      margin-top: 20px;
      width: 800px;

      .list-content,
      .list-title {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
      }

      .list-title {
        padding: 17px 20px;
        font-size:14px;
        font-weight:500;
        color:#303133;
        line-height:22px;
        background-color: #FAFAFA;
      }

      .list-content {
        padding: 21px 20px;
        font-size:14px;
        font-weight:400;
        color:#606266;
        line-height:14px;
        border-bottom: 1px solid #F2F6FC;
      }
    }
  }

  .photo-data {
    margin-bottom: 24px;
  }

  .page-box {
    margin-top: 24px;
    text-align: center;
  }

  .scroll-container {
    height: @orderScrollContainerHeight;

    .el-scrollbar__wrap{
      overflow-x:hidden;
    }
  }

  .el-pagination .btn-next,
  .el-pagination .btn-prev,
  .el-pager li {
    background-color: transparent;
  }
}
</style>
