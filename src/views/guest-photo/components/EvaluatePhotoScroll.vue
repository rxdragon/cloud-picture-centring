<template>
  <div class="evaluate-photo-scroll">
    <div class="search-box">
      <div class="search-item">
        <span>摄影上传时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <div class="staff-box search-item">
        <span>伙伴</span>
        <staff-select v-model="staffId" />
      </div>
      <!-- 修图标准 -->
      <div class="search-item">
        <span>修图标准</span>
        <retouch-kind-select v-model="retouchStandard" placeholder="请选择修图标准"/>
      </div>
      <div class="button-box">
        <el-button type="primary" @click="getAttitudePhotoList(1)">查询</el-button>
      </div>
    </div>
    <div class="search-box">
      <!-- 产品名称 -->
      <div class="product-box search-item">
        <span class="row-title">产品名称</span>
        <product-select v-model="productValue" :props="{ multiple: false }" />
      </div>
    </div>
    <div
      id="tableBox"
      class="module-panel search-data table-box"
      :style="{
        height: searchDataBox + 'px'
      }"
    >
      <list-scroll
        v-if="photos.length"
        :list.sync="photos"
        :height="354"
        :list-height="searchDataBox"
        :page="pager.page"
        :load-more-data="getData"
      >
        <template v-slot="{ data }">
          <div class="photo-row">
            <div v-for="photoItem in data" :key="photoItem.id" class="photo-box" @click="goToDetails(photoItem)">
              <photo-box :use-ele-image="false" :src="photoItem.src" />
              <div class="staff-name">修图师：{{ photoItem.retoucherName }}</div>
              <div class="group-name">修图小组：{{ photoItem.retouchGroupName }}</div>
            </div>
            <div v-for="i in columnCount" :key="i + 'empty'" class="empty-box" />
          </div>
        </template>
      </list-scroll>
      <no-data v-else />
    </div>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import PhotoBox from '@/components/PhotoBox'
import ListScroll from '@/components/ListScroll'
import StaffSelect from '@SelectBox/StaffSelect'
import RetouchKindSelect from '@SelectBox/RetouchKindSelect'
import ProductSelect from '@SelectBox/ProductSelect'
import NoData from '@/components/NoData'
import { joinTimeSpan } from '@/utils/timespan.js'

import * as GuestPhoto from '@/api/guestPhoto.js'

export default {
  name: 'EvaluatePhotoScroll',
  components: { DatePicker, PhotoBox, StaffSelect, RetouchKindSelect, ProductSelect, NoData, ListScroll },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 时间戳
      type: '', // 查看类型
      staffId: [], // 伙伴id
      productValue: '', // 产品id
      retouchStandard: '', // 修图类别
      photos: [], // 照片数据
      columnCount: 4, // 照片列数
      searchDataBox: 200,
      pager: {
        page: 1,
        pageSize: 16
      }
    }
  },
  created () {
    const name = this.$route.name
    if (name === 'GoodGuest') {
      this.type = 'good'
    } else if (name === 'BadGuest') {
      this.type = 'bad'
    } else {
      this.$router.replace('/404')
    }
  },
  mounted () {
    this.resizeWindow()
    this.$ipcRenderer.on('win-resize', (e, item) => {
      const { data } = item
      this.resizeWindow(data)
    })
  },
  methods: {
    /**
     * @description 窗口调整大小后事件
     */
    resizeWindow (data) {
      if (this.routeName !== this.$route.name) return
      const height = data ? data[1] : null
      const otherHeight = 310
      const paddingWidth = 48
      const photoBoxWidth = 253
      const AppHeight = height || window.innerHeight
      const tableBoxDom = document.querySelector('#tableBox')
      const searchDataWidth = tableBoxDom.offsetWidth - paddingWidth
      this.searchDataBox = AppHeight - otherHeight
      const columnCount = parseInt(searchDataWidth / photoBoxWidth)
      if (this.columnCount === columnCount) return
      if (!this.timeSpan) return
      this.getAttitudePhotoList()
      this.columnCount = columnCount
    },
    /**
     * @description 调整到详情页面
     */
    goToDetails (photoItem) {
      this.$router.push({
        path: '/guest-photo-details',
        query: {
          uuid: photoItem.uuid
        }
      })
    },
    /**
     * @description 处理行数据
     */
    handleRowData (data) {
      const rowData = []
      const sliceTimes = Math.ceil(data.length / this.columnCount)
      for (let index = 0; index < sliceTimes; index++) {
        const firstIndex = index * this.columnCount
        const lastIndex = firstIndex + this.columnCount
        rowData.push(data.slice(firstIndex, lastIndex))
      }
      return rowData
    },
    /**
     * @description 拼接数据
     */
    jointData (newPhotos) {
      if (!newPhotos.length) return []
      const lastPhotoIndex = this.photos.length - 1
      const lastPhotoslength = this.photos[lastPhotoIndex].length
      const sliceLength = this.columnCount - lastPhotoslength
      const slicePhoto = newPhotos.slice(0, sliceLength)
      slicePhoto.forEach(photoItem => this.photos[lastPhotoIndex].push(photoItem))
      newPhotos.splice(0, sliceLength)
      const newRowPhotos = this.handleRowData(newPhotos)
      newRowPhotos.forEach(rowItem => this.photos.push(rowItem))
      return newRowPhotos
    },
    /**
     * @description 获取参数
     */
    getParam () {
      if (!this.timeSpan) {
        this.$newMessage.warning('请输入时间')
        return false
      }
      const reqData = {
        attitude: this.type,
        startAt: joinTimeSpan(this.timeSpan[0]),
        endAt: joinTimeSpan(this.timeSpan[1], 1),
        page: this.pager.page,
        pageSize: this.pager.pageSize
      }
      if (this.staffId.length) {
        reqData.staffIds = this.staffId
      }
      if (this.retouchStandard) {
        reqData.retouchStandard = this.retouchStandard
      }
      if (this.productValue) {
        reqData.productId = this.productValue
      }
      return reqData
    },
    /**
     * @description 获取优秀客片列表
     */
    async getAttitudePhotoList (page) {
      try {
        this.pager.page = 1
        const reqData = this.getParam()
        if (!reqData) return
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await GuestPhoto.getAttitudePhotoList(reqData)
        this.photos = this.handleRowData(data) || []
      } catch (error) {
        console.error(error)
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 获取数据分页
     */
    async getData () {
      this.pager.page += 1
      const reqData = this.getParam()
      if (!reqData) return
      try {
        const data = await GuestPhoto.getAttitudePhotoList(reqData)
        const newRowPhotos = this.jointData(data)
        return newRowPhotos
      } catch (error) {
        console.error(error)
        return []
      }
    }
  }
}
</script>

<style lang="less">
@import "~@/styles/variables.less";

.evaluate-photo-scroll {
  .search-box {
    margin-bottom: 20px;

    .panel-title {
      margin-bottom: 12px;
    }

    .product-box {
      .row-title {
        width: 84px;
      }

      .el-cascader {
        width: 300px;
      }
    }

    .search-item {
      & > span {
        text-align-last: justify;
      }
    }
  }

  .search-data {
    margin-top: 0;
    overflow: hidden;

    .photo-row {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      margin-bottom: 24px;

      .empty-box {
        width: 253px;
      }
    }

    .photo-box {
      display: inline-block;
      width: 253px;
      height: 330px;
      cursor: pointer;

      .group-name,
      .staff-name {
        font-size: 12px;
        line-height: 17px;
        color: #606266;
      }

      .staff-name {
        padding: 12px 6px 10px;
        border-bottom: 1px solid @borderColor;
      }

      .group-name {
        padding: 9px 6px 4px;
      }
    }

    .no-data-components {
      height: 100%;
    }
  }
}
</style>
