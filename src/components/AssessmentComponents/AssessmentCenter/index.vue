<template>
  <div class="assessment-center">
    <!-- 一键下载功能 -->
    <portal to="assessmentPlug">
      <div class="button-box">
        <el-button v-show="allPhotoPath.length" type="primary" @click="onedownAll">一键下载</el-button>
      </div>
    </portal>
    <!-- 搜索模块 -->
    <el-row class="search-box" :gutter="20">
      <!-- 修图通过时间 -->
      <el-col :span="8" :xl="6">
        <div class="search-item">
          <span>修图提交</span>
          <date-picker v-model="timeSpan" value-format="yyyy-MM-dd" />
        </div>
      </el-col>
      <!-- 产品 -->
      <el-col :span="8" :xl="6">
        <div class="search-item">
          <span>产品</span>
          <ProductSelect
            :show-pic-product="cloudType === GRADE_LABEL_TYPE.SHOW_PIC"
            :himo-product="cloudType === GRADE_LABEL_TYPE.CLOUD"
            v-model="productIds"
          />
        </div>
      </el-col>
      <!-- 修图机构 -->
      <el-col :span="8" :xl="4" v-if="cloudType === GRADE_LABEL_TYPE.CLOUD">
        <div class="search-item">
          <span>修图机构</span>
          <InstitutionSelect v-model="retouchInstitution" />
        </div>
      </el-col>
      <!-- 抽取张数 -->
      <el-col :span="6" :xl="4">
        <div class="sample-num search-item">
          <span>抽取张数</span>
          <el-select v-model="sampleNum" placeholder="单次不可超过5张">
            <el-option :label="1" :value="1" />
            <el-option :label="2" :value="2" />
            <el-option :label="3" :value="3" />
            <el-option :label="4" :value="4" />
            <el-option :label="5" :value="5" />
          </el-select>
        </div>
      </el-col>
      <!-- 搜索按钮 -->
      <el-col :span="2" :xl="2">
        <div class="search-item button-box">
          <el-button @click="takePhoto" :disabled="Boolean(photoData.length)" type="primary">抽 取</el-button>
        </div>
      </el-col>
    </el-row>
    <!-- 完成数据 -->
    <div class="assessment-info module-panel">
      <div class="panel-title">
        今日完成数据
      </div>
      <div class="list-table">
        <div class="list-title">
          <span>今日已评价照片</span>
          <span>今日评价平均分</span>
        </div>
        <div class="list-content">
          <span>{{ todayInfo.evaluationNum || '-' }}</span>
          <span>{{ todayInfo.avgScore }}</span>
        </div>
      </div>
    </div>
    <!-- 订单数据 -->
    <div class="photo-grade-list">
      <photo-grade-box
        v-for="photoItem in photoData"
        @startGrade="showGrade"
        :key="photoItem.businessId"
        :photo-info="photoItem"
      />
    </div>
    <!-- 分页 -->
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
    <!-- 抽片提示 -->
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
    <!-- 打分模块 -->
    <grade-preview
      v-if="gradeInfo && showGradePreview"
      :photo-version="showPhotoVersion"
      @submit="submitData"
      ref="grade-preview"
      :show.sync="showGradePreview"
      :info="gradeInfo"
    />
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import ProductSelect from '@SelectBox/ProductSelect'
import InstitutionSelect from '@SelectBox/InstitutionSelect'

import GradePreview from '../components/GradePreview/index.vue'
import PhotoGradeBox from '../components/PhotoGradeBox/index.vue'

import DownIpc from '@electronMain/ipc/DownIpc'
import dayjs from 'dayjs'
import { PhotoEnumName, GRADE_LABEL_TYPE } from '@/utils/enumerate.js'
import { joinTimeSpan, getNowDate } from '@/utils/timespan.js'

import * as AssessmentCenter from '@/api/assessmentCenter'

export default {
  name: 'AssessmentCenter',
  components: { DatePicker, GradePreview, PhotoGradeBox, ProductSelect, InstitutionSelect },
  inject: ['cloudType'],
  data () {
    return {
      GRADE_LABEL_TYPE,
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 搜索时间
      productIds: [], // 搜索产品
      retouchInstitution: '', // 修图机构
      sampleNum: '', // 搜索伙伴抽样量
      spotAllNum: '-',
      allPhotoPath: [],
      pager: {
        page: 1,
        pageSize: 10,
        total: 10
      },
      uuid: '', // id
      photoData: [], // 照片数据
      isTakePhoto: false, // 是第一次抽取的照片
      todayInfo: {},
      gradeUUid: '', // 正在打分uuid
      showGradePreview: false, // 是否显示打分概况
      dialogTableVisible: false, // 抽取成功弹框
      showPhotoVersion: '', // 展示图片版本
      intervalGetSpotCheckTimer: null // 定时获取数据
    }
  },
  computed: {
    gradeInfo () {
      const findGradePhoto = this.photoData.find(item => item._id === this.gradeUUid)
      return findGradePhoto || {}
    }
  },
  async created () {
    await this.resetPage()
  },
  methods: {
    /**
     * @description 获取下一页图片
     */
    async getNextPhoto () {
      try {
        const findGradePhotoIndex = this.photoData.findIndex(item => item._id === this.gradeUUid)
        const nowPhotoIndexArr = this.photoData[findGradePhotoIndex].photoIndex.split('-')
        const isAllLast = nowPhotoIndexArr[0] === nowPhotoIndexArr[1]
        const isPageLast = this.photoData.length === findGradePhotoIndex + 1 // 页面嘴鸥
        // 第一页只有一张图
        if (isAllLast && this.photoData.length === 1 && this.pager.page === 1) {
          this.$newMessage.success('你已经打完全部照片')
          this.showGradePreview = false
          this.$store.dispatch('setting/showLoading', this.routeName)
          await Promise.all([
            this.getSpotCheckResult(),
            this.getStatistics()
          ])
          // 处理在非第一页情况下处理只有一张图的情况
        } else if (isAllLast && this.photoData.length === 1 && this.pager.page > 1) {
          this.$refs['grade-preview'].allLoading = true
          this.pager.page--
          await Promise.all([
            this.getSpotCheckResult(),
            this.getStatistics()
          ])
          this.gradeUUid = this.photoData[0]._id
          this.$refs['grade-preview'].allLoading = false
        } else {
          let gradeUUid = ''
          if (isPageLast && this.photoData.length !== 1) {
            gradeUUid = this.photoData[findGradePhotoIndex - 1]._id
          } else {
            gradeUUid = this.photoData[findGradePhotoIndex + 1]._id
          }
          this.$refs['grade-preview'].allLoading = true
          this.gradeUUid = gradeUUid
          await Promise.all([
            this.getSpotCheckResult(),
            this.getStatistics()
          ])
          this.$refs['grade-preview'].allLoading = false
        }
      } catch (error) {
        console.error(error)
        this.$newMessage.error('更新照片数据失败')
      }
    },
    /**
     * @description 提交数据
     */
    async submitData (sendData) {
      try {
        const selectPhoto = this.photoData.find(item => item._id === this.gradeUUid)
        if (!selectPhoto) throw new Error('找不到对应照片')
        const req = {
          photoId: selectPhoto.photo_id,
          uuid: selectPhoto._id,
          picUrl: sendData.markPhotoImg,
          tags: sendData.lableId,
          spotUuid: this.uuid,
        }
        req.axiosType = this.cloudType
        this.$refs['grade-preview'].allLoading = true
        await AssessmentCenter.commitHistory(req)
        this.getNextPhoto()
      } catch (error) {
        console.error(error)
      } finally {
        this.$refs['grade-preview'].allLoading = false
        this.$refs['grade-preview'].isSubmit = false
      }
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
    async resetPage () {
      this.$store.dispatch('setting/showLoading', this.routeName)
      await Promise.all([
        this.getStatistics(),
        this.getHaveCheckResult(true)
      ])
    },
    /**
     * @description 获取今日评价数据
     */
    async getStatistics () {
      try {
        const req = { axiosType: this.cloudType }
        this.todayInfo = await AssessmentCenter.getStatistics(req)
      } catch (error) {
        console.error(error)
      }
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
      // 时间间隔是否大于30天
      const isMoreThen30 = dayjs(this.timeSpan[1]).subtract(30, 'day').isAfter(dayjs(this.timeSpan[0]))
      if (isMoreThen30) {
        this.$newMessage.warning('抽片时间间隔不能超过30天')
        return false
      }

      const req = {
        takeNum: this.sampleNum,
        submitStartAt: joinTimeSpan(this.timeSpan[0]),
        submitEndAt: joinTimeSpan(this.timeSpan[1], 1)
      }
      if (this.productIds.length) { req.productIds = this.productIds }
      if (this.retouchInstitution) { req.orgId = this.retouchInstitution }
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
        // 防止重读抽片
        if (await this.getHaveCheckResult()) return false
        req.axiosType = this.cloudType
        const data = await AssessmentCenter.takePhoto(req)
        if (!data.length) throw new Error('当前暂无可被抽取的订单。')
        this.uuid = data
        this.isTakePhoto = true
        await this.getSpotCheckResult()
      } catch (error) {
        console.error(error)
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 是否有抽片
     */
    async getHaveCheckResult (isReset) {
      try {
        const req = { axiosType: this.cloudType }
        const msg = await AssessmentCenter.getHaveCheckResult(req)
        if (msg) {
          this.uuid = msg
          this.pager.page = 1
          await this.getSpotCheckResult()
          return true
        } else {
          this.photoData = []
          this.spotAllNum = '-'
          this.pager.total = 10
          if (isReset) { this.$store.dispatch('setting/hiddenLoading', this.routeName) }
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
        req.axiosType = this.cloudType
        const data = await AssessmentCenter.getSpotCheckResult(req)
        this.spotAllNum = data.total
        this.pager.total = data.pageTotal || this.pager.total
        // 抽片成功
        if (this.isTakePhoto) {
          this.dialogTableVisible = true
          this.isTakePhoto = false
          setTimeout(() => {
            this.dialogTableVisible = false
          }, 1500)
        }
        this.allPhotoPath = data.allPhotoPath
        this.photoData = data.list
        // 如果抽取成功清空定时器
        if (this.intervalGetSpotCheckTimer) {
          clearTimeout(this.intervalGetSpotCheckTimer)
          this.intervalGetSpotCheckTimer = null
        }
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.photoData = []
        if (error.message === '正在抽片中') {
          this.intervalGetSpotCheck()
        } else {
          this.$store.dispatch('setting/hiddenLoading', this.routeName)
        }
        console.error(error)
      }
    },
    /**
     * @description 定时获取数据
     */
    intervalGetSpotCheck () {
      clearTimeout(this.intervalGetSpotCheckTimer)
      this.intervalGetSpotCheckTimer = setTimeout(() => {
        this.getSpotCheckResult(1)
      }, 500)
    },
    /**
     * @description 页面更换
     */
    handlePage () {
      this.getSpotCheckResult()
    },
    /**
     * @description 展示数据
     */
    showGrade (clickData) {
      this.gradeUUid = clickData.id
      this.showPhotoVersion = clickData.version
      this.showGradePreview = true
    }
  }
}
</script>
<style lang="less">

.assessment-center {
  .search-box {
    flex-wrap: wrap;

    .search-item {
      margin-right: 0;
      margin-bottom: 20px;

      & > span {
        display: inline-block;
        flex-shrink: 0;
        text-align: left;
      }

      & /deep/ .el-range-editor.el-input__inner {
        width: 100% !important;
      }

      & /deep/ .date-picker,
      & /deep/ .issue-label-select,
      & /deep/ .evaluate-select,
      & /deep/ .cloud-spot-grass-select,
      & /deep/ .quality-select,
      & /deep/ .el-select,
      & /deep/ .return-select,
      & /deep/ .cloud-spot,
      & /deep/ .el-cascader {
        width: 100%;
      }
    }

    .sample-num {
      display: flex;
      align-items: center;
    }
  }

  .assessment-info {
    margin-bottom: 20px;

    .list-table {
      width: 400px;
      margin-top: 20px;

      .list-content,
      .list-title {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
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

  .photo-grade-list {
    display: flex;
    flex-wrap: wrap;
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
