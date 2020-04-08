<template>
  <div class="cloud-assessment page-class">
    <div class="header" :class="headerClass">
      <h3>云学院评价中心</h3>
      <div class="button-box">
        <el-button v-show="allPhotoPath.length" type="primary" @click="onedownAll">一键下载</el-button>
      </div>
    </div>
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
    <grade-preview v-if="gradeInfo && showGradePreview" :show.sync="showGradePreview" :info="gradeInfo" />
    <el-button @click="showPreview">冲！冲！冲！</el-button>
    <!-- <grade-box
      v-for="photoItem in photoData"
      :key="photoItem.businessId"
      is-grade
      class="photo-data module-panel"
      :photo-info="photoItem"
      @finsihed="resetPage"
    /> -->
    <el-dialog
      width="300px"
      class="spot-success"
      center
      :visible.sync="dialogTableVisible"
    >
      <div class="icon-box">
        <i class="el-icon-success" />
      </div>
      <div class="content">抽取成功</div>
      <div class="description">共：{{ spotAllNum }}张</div>
    </el-dialog>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import InstitutionType from '@SelectBox/InstitutionType'
// import GradeBox from './components/GradeBox'
import GradePreview from './components/GradePreview'
import DownIpc from '@electronMain/ipc/DownIpc'
import * as AssessmentCenter from '@/api/assessmentCenter'
import { PhotoEnumName } from '@/utils/enumerate.js'
import { joinTimeSpan, getNowDate } from '@/utils/timespan.js'

export default {
  name: 'CloudAssessment',
  components: { DatePicker, InstitutionType, GradePreview },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 时间
      institutionType: 0, // 修图标准
      sampleNum: '', // 伙伴抽样量
      spotAllNum: '-',
      allPhotoPath: [],
      pager: {
        page: 1,
        pageSize: 10,
        total: 10
      },
      uuid: '', // id
      photoData: [], // 照片数据
      headerClass: '', // 顶部class
      isTakePhoto: false, // 是第一次抽取的照片
      todayInfo: {},
      showGradePreview: false, // 是否显示打分概况
      dialogTableVisible: false // 抽取成功弹框
    }
  },
  computed: {
    gradeInfo () {
      return this.photoData[1] || null
    }
  },
  created () {
    this.resetPage()
  },
  methods: {
    showPreview () {
      this.showGradePreview = true
    },
    /**
     * @description 一键下载
     */
    onedownAll () {
      const savePath = `${getNowDate()}-云端抽片`
      const photoArr = []
      this.allPhotoPath.forEach(photoItem => {
        photoArr.push({
          url: photoItem.path,
          photoId: photoItem.photo_id,
          version: PhotoEnumName[photoItem.version],
          path: savePath
        })
      })
      DownIpc.addDownloadFiles(photoArr)
    },
    /**
     * @description 初始化页面
     */
    resetPage () {
      this.$store.dispatch('setting/showLoading', this.routeName)
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
      if (this.institutionType) {
        req.retouchStandard = this.institutionType
      }
      return req
    },
    /**
     * @description 抽取
     */
    async takePhoto () {
      try {
        const req = this.getTakeParams()
        if (!req) return false
        this.$store.dispatch('setting/showLoading', this.routeName)
        if (await this.getHaveCheckResult()) return false
        const data = await AssessmentCenter.takePhoto(req)
        if (!data.length) {
          this.$newMessage.warning('当前暂无可被抽取的订单。')
          this.$store.dispatch('setting/hiddenLoading', this.routeName)
          return
        }
        this.uuid = data
        this.isTakePhoto = true
        await this.getSpotCheckResult()
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    },
    /**
     * @description 是否有抽片
     */
    async getHaveCheckResult () {
      try {
        const msg = await AssessmentCenter.getHaveCheckResult()
        if (msg) {
          this.uuid = msg
          this.pager.page = 1
          this.getSpotCheckResult()
          return true
        } else {
          this.photoData = []
          this.spotAllNum = '-'
          this.pager.total = 10
          this.$store.dispatch('setting/hiddenLoading', this.routeName)
          return false
        }
      } catch (error) {
        this.photoData = []
        this.spotAllNum = '-'
        this.pager.total = 10
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    },
    /**
     * @description 获取抽片数据
     */
    async getSpotCheckResult (page) {
      try {
        this.pager.page = page || this.pager.page
        const req = {
          uuid: this.uuid,
          skip: (this.pager.page - 1) * this.pager.pageSize,
          limit: this.pager.pageSize
        }
        const data = await AssessmentCenter.getSpotCheckResult(req)
        this.spotAllNum = data.total
        this.pager.total = data.pageTotal || this.pager.total
        if (this.isTakePhoto === true) {
          this.dialogTableVisible = true
          this.isTakePhoto = false
          setTimeout(() => {
            this.dialogTableVisible = false
          }, 1500)
        }
        this.allPhotoPath = data.allPhotoPath
        this.photoData = []
        this.photoData = data.list
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
@import "~@/styles/variables.less";

.cloud-assessment {
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
      width: 800px;
      margin-top: 20px;

      .list-content,
      .list-title {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
      }

      .list-title {
        padding: 17px 20px;
        font-size: 14px;
        font-weight: 500;
        line-height: 22px;
        color: #303133;
        background-color: #fafafa;
      }

      .list-content {
        padding: 21px 20px;
        font-size: 14px;
        font-weight: 400;
        line-height: 14px;
        color: #606266;
        border-bottom: 1px solid #f2f6fc;
      }
    }
  }

  .photo-data {
    margin-bottom: 24px;
  }

  .spot-success {
    text-align: center;

    .icon-box {
      font-size: 60px;
      color: @green;
      text-align: center;
    }

    .content {
      color: #303133;
      text-align: center;
    }

    .description {
      font-size: 12px;
      text-align: center;
    }

    .el-dialog__header {
      display: none;
    }
  }

  .el-pagination .btn-next,
  .el-pagination .btn-prev,
  .el-pager li {
    background-color: transparent;
  }
}
</style>
