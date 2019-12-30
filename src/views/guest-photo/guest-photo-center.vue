<template>
  <div class="guest-photo page-class">
    <div class="header">
      <h3>客片池</h3>
    </div>
    <div class="search-box">
      <div class="search-item">
        <span>摄影上传时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <div class="staff-box search-item">
        <span class="row-title">伙伴</span>
        <staff-select v-model="staffId" />
      </div>
      <!-- 订单信息 -->
      <div class="order-search search-item">
        <el-input v-model.trim="orderSearchValue" placeholder="请输入内容" class="input-with-select" @keyup.native.enter="getPhotoList(1)">
          <el-select slot="prepend" v-model="orderType" placeholder="请选择">
            <el-option label="云端流水号" :value="1" />
            <el-option label="顾客姓名" :value="2" />
            <el-option label="手机号" :value="3" />
          </el-select>
        </el-input>
      </div>
    </div>
    <div class="search-box">
      <!-- 看片评价 -->
      <div class="check-evaluate search-item">
        <span>看片评价</span>
        <el-select v-model="checkValue" placeholder="请选择">
          <el-option
            v-for="item in checkOption"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <!-- 产品名称 -->
      <div class="product-box search-item">
        <span class="row-title">产品名称</span>
        <product-select v-model="productValue" :props="{ multiple: false }" />
      </div>
      <!-- 修图标准 -->
      <div class="search-item">
        <span>修图标准</span>
        <retouch-kind-select v-model="retouchStandard" />
      </div>
      <div class="button-box search-item">
        <el-button type="primary" @click="getPhotoList(1)">查询</el-button>
      </div>
    </div>
    <div
      class="search-data table-box"
      :style="{
        height: searchDataBox + 'px'
      }"
    >
      <list-scroll v-if="photos.length" :list.sync="photos" :height="277" :load-more-data="getData">
        <template v-slot="{ data }">
          <div class="photo-row">
            <div v-for="photoItem in data" :key="photoItem.id" class="photo-box">
              <photo-box :use-ele-image="false" :src="photoItem.src" />
            </div>
            <div v-for="i in 4" :key="i + 'empty'" class="empty-box" />
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
import RetouchKindSelect from '@SelectBox/RetouchKindSelect'
import ProductSelect from '@SelectBox/ProductSelect'
import StaffSelect from '@SelectBox/StaffSelect'
import NoData from '@/components/NoData'
import { joinTimeSpan } from '@/utils/timespan.js'

import * as GuestPhoto from '@/api/guestPhoto'

export default {
  name: 'GuestPhotoCenter',
  components: { DatePicker, PhotoBox, StaffSelect, ProductSelect, RetouchKindSelect, ListScroll, NoData },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 查询时间
      orderType: 1, // 查询类型 1 云端流水号 2 顾客姓名 3 手机号
      orderSearchValue: '', // 订单信息
      checkValue: 0, // 看片评价星数
      staffId: [], // 伙伴id
      productValue: '', // 产品id
      retouchStandard: '', // 修图标准
      photos: [], // 照片列表
      searchDataBox: 200,
      pager: {
        page: 1,
        pageSize: 16
      },
      checkOption: [
        {
          label: '全部',
          value: 0
        }, {
          label: '一星',
          value: 1
        }, {
          label: '二星',
          value: 2
        }, {
          label: '三星',
          value: 3
        }, {
          label: '四星',
          value: 4
        }, {
          label: '五星',
          value: 5
        }
      ]
    }
  },
  created () {
    const startAt = '2019-12-01'
    const endAt = '2019-12-30'
    this.timeSpan = [startAt, endAt]
    this.getPhotoList()
  },
  mounted () {
    console.log(window.global.onresize)
    window.οnresize = () => {
      console.log(1)
    }
    console.log(window.onresize)
    this.resizeWindow()
  },
  methods: {
    resizeWindow () {
      console.dir(window.innerHeight)
      const otherHeight = 310
      this.searchDataBox = window.innerHeight - otherHeight
      console.log(this.searchDataBox)
    },
    /**
     * @description 页面变化
     */
    handleCurrentChange () {
      this.getPhotoList()
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
      const columnCount = 4
      const sliceTimes = Math.ceil(data.length / columnCount)
      for (let index = 0; index < sliceTimes; index++) {
        const firstIndex = index * columnCount
        const lastIndex = firstIndex + columnCount
        rowData.push(data.slice(firstIndex, lastIndex))
      }
      return rowData
    },
    /**
     * @description 拼接数据
     */
    jointData (newPhotos) {
      if (!newPhotos.length) return
      const lastPhotoIndex = this.photos.length - 1
      const lastPhotoslength = this.photos[lastPhotoIndex].length
      const sliceLength = 4 - lastPhotoslength
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
      const type = ['streamNum', 'customerName', 'telephone']
      const reqData = {
        page: this.pager.page,
        pageSize: this.pager.pageSize
      }
      if (this.orderSearchValue) {
        const key = type[this.orderType - 1]
        reqData[key] = this.orderSearchValue
        if (key !== 'streamNum' && !this.timeSpan) {
          this.$newMessage.warning('请填写时间')
          return false
        }
      }
      if (!this.timeSpan && !this.orderSearchValue) {
        this.$newMessage.warning('请填写时间')
        return false
      }
      if (this.timeSpan) {
        reqData.startAt = joinTimeSpan(this.timeSpan[0])
        reqData.endAt = joinTimeSpan(this.timeSpan[1], 1)
      }
      if (this.staffId.length) { reqData.staffIds = this.staffId }
      if (this.checkValue) { reqData.evaluateStar = this.checkValue }
      if (this.productValue) { reqData.productId = this.productValue }
      if (this.retouchStandard) { reqData.retouchStandard = this.retouchStandard }
      return reqData
    },
    /**
     * @description 获取客片池列表
     */
    async getPhotoList () {
      this.pager.page = 1
      console.log(this.$el)
      const reqData = this.getParam()
      if (!reqData) return
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await GuestPhoto.getPhotoList(reqData)
        // 调试
        data.forEach((item, index) => {
          item.indexNumber = index
        })
        this.photos = this.handleRowData(data) || []
        console.log(this.photos)
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
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
        // 调试
        let count = 0
        this.photos.forEach(item => {
          count += item.length
        })
        data.forEach((item, index) => {
          item.indexNumber = count + index
        })
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

.guest-photo {
  .search-box {
    flex-wrap: wrap;
    align-items: center;

    .search-item {
      margin-bottom: 20px;
      margin-right: 24px;

      & > span {
        text-align-last: justify;
      }
    }

    .row-title {
      width: 56px;
    }

    .product-box {
      .el-cascader {
        width: 220px !important;
      }
    }

    .order-search {
      .el-input-group__prepend {
        width: 120px;
      }
    }

    .check-evaluate {
      & > span {
        width: 84px;
      }

      .el-select {
        width: 300px;
      }
    }
  }

  .search-data {
    margin-top: 0;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;

    .photo-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24px;
      flex-wrap: wrap;

      .photo-box {
        width: 253px;
        display: inline-block;
        cursor: pointer;
        height: 253px;
      }

      .empty-box {
        width: 253px;
      }
    }

    .page-box {
      width: 100%;
    }

    .no-data {
      margin-bottom: 0;
    }
  }
}
</style>
