<template>
  <div class="guest-photo-scroll">
    <div
      id="tableBox"
      class="search-data table-box"
      :style="{
        height: searchDataBox + 'px'
      }"
    >
      <list-scroll
        v-if="photos.length"
        :list.sync="photos"
        :height="277"
        :list-height="searchDataBox"
        :page="pager.page"
        :load-more-data="getData"
      >
        <template v-slot="{ data }">
          <div class="photo-row">
            <div
              v-for="photoItem in data"
              :key="photoItem.id"
              class="photo-box"
              @click="goGuestInfo(photoItem)"
            >
              <photo-box :show-special-effects="false" contain-photo :src="photoItem.src" />
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
import PhotoBox from '@/components/PhotoBox'
import ListScroll from '@/components/ListScroll'
import NoData from '@/components/NoData'
import { joinTimeSpan } from '@/utils/timespan.js'
import * as GuestPhoto from '@/api/guestPhoto'

export default {
  name: 'GuestPhotoScroll',
  components: { PhotoBox, ListScroll, NoData },
  props: {
    searchParams: { type: Object, default: () => {
      return {
        timeSpan: null,
        staffId: [], // 伙伴id
        orderSearchValue: '', // 订单信息
        orderType: 1, // 查询类型 1 云端流水号 2 订单号 3 顾客姓名 4 手机号
        checkValue: 0, // 看片评价星数
        productValues: '', // 产品id
        retouchStandards: '', // 修图标准
        photoVersion: '' // 照片版本
      }
    }}
  },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      photos: [], // 照片列表
      searchDataBox: 200,
      columnCount: 4, // 照片列数
      pager: {
        page: 1,
        pageSize: 16
      }
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
      let otherHeight = 48 + 36 + 88 + 24
      const paddingWidth = 48
      const photoBoxWidth = 253
      const AppHeight = height || window.innerHeight
      otherHeight += this.$el.offsetTop
      const tableBoxDom = document.querySelector('#tableBox')
      const searchDataWidth = tableBoxDom.offsetWidth - paddingWidth
      this.searchDataBox = AppHeight - otherHeight
      const columnCount = parseInt(searchDataWidth / photoBoxWidth)
      if (this.columnCount === columnCount) return
      if (!this.searchParams.timeSpan) return
      this.getPhotoList()
      this.columnCount = columnCount
    },
    /**
     * @description 跳转到客片池详情
     */
    goGuestInfo (photoItem) {
      this.$router.push({
        name: 'GuestInfo',
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
      const type = ['streamNum', 'orderNum', 'customerName', 'telephone']
      const reqData = {
        page: this.pager.page,
        pageSize: this.pager.pageSize
      }
      if (this.searchParams.orderSearchValue) {
        const key = type[this.searchParams.orderType - 1]
        reqData[key] = this.searchParams.orderSearchValue
      }
      if (!this.searchParams.timeSpan && !this.searchParams.orderSearchValue) {
        this.$newMessage.warning('请填写时间')
        return false
      }
      if (this.searchParams.timeSpan) {
        reqData.startAt = joinTimeSpan(this.searchParams.timeSpan[0])
        reqData.endAt = joinTimeSpan(this.searchParams.timeSpan[1], 1)
      }
      if (this.searchParams.staffId.length) { reqData.staffIds = this.searchParams.staffId }
      if (this.searchParams.checkValue) { reqData.evaluateStar = this.searchParams.checkValue }
      if (this.searchParams.productValues.length) { reqData.productIds = this.searchParams.productValues }
      if (this.searchParams.retouchStandards.length) { reqData.retouchStandards = this.searchParams.retouchStandards }
      return reqData
    },
    /**
     * @description 获取客片池列表
     */
    async getPhotoList () {
      this.pager.page = 1
      const reqData = this.getParam()
      if (!reqData) return
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await GuestPhoto.getPhotoList(reqData, this.searchParams.photoVersion)
        this.photos = this.handleRowData(data) || []
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
        const data = await GuestPhoto.getPhotoList(reqData)
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
.guest-photo-scroll {
  .search-data {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: 0;

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
      height: 253px;
      cursor: pointer;
    }

    .no-data {
      margin-bottom: 0;
    }
  }
}
</style>
