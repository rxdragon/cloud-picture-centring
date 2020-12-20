<template>
  <div class="guest-photo-list">
    <div class="search-data table-box">
      <div v-if="photos.length" class="photo-module">
        <div
          v-for="photoItem in photos"
          :key="photoItem.id"
          class="photo-box"
          @click="goGuestInfo(photoItem)"
        >
          <photo-box :show-special-effects="false" contain-photo :src="photoItem.src" />
        </div>
        <div v-for="i in columnCount" :key="i + 'empty'" class="empty-box" />
      </div>
      <no-data v-else />
      <div class="page-box">
        <el-pagination
          hide-on-single-page
          :current-page="locPager.page"
          :page-size="locPager.pageSize"
          layout="prev, pager, next, jumper"
          :total="locPager.total"
          @current-change="handleLocalPhoto"
        />
      </div>
    </div>
  </div>
</template>

<script>
import PhotoBox from '@/components/PhotoBox'
import NoData from '@/components/NoData'
import { joinTimeSpan } from '@/utils/timespan.js'
import * as GuestPhoto from '@/api/guestPhoto'

export default {
  name: 'GuestPhotoList',
  components: { PhotoBox, NoData },
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
      columnCount: 4,
      locPager: {
        page: 1,
        pageSize: 12,
        total: 12
      },
      reqPager: {
        page: 1,
        pageSize: 50,
        hasMore: true,
      },
      orinPhotoes: [] // 存储所有请求到的photoes
    }
  },
  computed: {
    // 展示的照片
    photos () {
      const starterIndex = (this.locPager.page - 1) * this.locPager.pageSize
      const enderIndex = starterIndex + this.locPager.pageSize
      const truePhotoes = this.orinPhotoes.slice(starterIndex, enderIndex)
      return truePhotoes
    }
  },
  methods: {
    /**
     * @description 分页组件页码变动逻辑
     */
    handleLocalPhoto (value) {
      // 先判断后面是否还有两页的量,没有的话,reqPager.page+1,去请求下一页,有的话,直接本地到下一页;
      const starterIndex = (value - 1) * this.locPager.pageSize
      if (this.orinPhotoes.slice(starterIndex).length < (this.locPager.pageSize * 2) && this.reqPager.hasMore) {
        this.reqPager.page += 1
        this.getPhotoList()
      }
      this.locPager.page = value
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
     * @description 获取参数
     */
    getParam () {
      const type = ['streamNum', 'orderNum', 'customerName', 'telephone']
      const reqData = {
        page: this.reqPager.page,
        pageSize: this.reqPager.pageSize
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
    async getPhotoList (needRest) {
      if (needRest) { this.restCondition() }
      const reqData = this.getParam()
      if (!reqData) return
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await GuestPhoto.getPhotoList(reqData, this.searchParams.photoVersion)
        this.reqPager.hasMore = Boolean(data.length)
        this.orinPhotoes = this.orinPhotoes.concat(data)
        this.locPager.total = this.orinPhotoes.length
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 当条件查询时候,重置列表和分页项
     */
    restCondition () {
      this.orinPhotoes = []
      this.reqPager.page = 1
      this.reqPager.hasMore = true
      this.locPager = {
        page: 1,
        pageSize: 12,
        total: 12,
      }
    }
  }
}
</script>

<style lang="less">

.guest-photo-list {
  .search-box {
    flex-wrap: wrap;
    align-items: center;

    .search-item {
      margin-right: 24px;
      margin-bottom: 20px;

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
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: 0;

    .photo-module {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      width: 100%;

      .photo-box {
        width: 24%;
        margin-bottom: 24px;
        cursor: pointer;
      }

      .empty-box {
        width: 24%;
      }
    }

    .page-box {
      width: 100%;

      .page-item {
        box-sizing: border-box;
        display: inline-block;
        min-width: 28px;
        height: 28px;
        padding: 0 4px;
        margin: 0;
        font-size: 13px;
        line-height: 28px;
        text-align: center;
        vertical-align: top;
        cursor: pointer;
        background: #fff;
      }

      .more-page {
        line-height: 28px;
        color: #303133;
      }
    }

    .no-data {
      margin-bottom: 0;
    }
  }
}
</style>
