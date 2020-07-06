<template>
  <div class="guest-photo-list">
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
        <el-input
          v-model.trim="orderSearchValue"
          placeholder="请输入内容"
          @keyup.native.enter="getPhotoList(true)"
          class="input-with-select"
        >
          <el-select slot="prepend" v-model="orderType" placeholder="请选择">
            <el-option label="云端流水号" :value="1" />
            <el-option label="订单号" :value="2" />
            <el-option label="顾客姓名" :value="3" />
            <el-option label="手机号" :value="4" />
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
        <product-select v-model="productValues" />
      </div>
      <!-- 修图标准 -->
      <div class="search-item">
        <span>修图标准</span>
        <retouch-kind-select v-model="retouchStandards" multiple placeholder="请选择修图标准"/>
      </div>
      <div class="button-box search-item">
        <el-button type="primary" @click="getPhotoList(true)">查询</el-button>
      </div>
    </div>
    <div class="search-data table-box">
      <div v-if="photos.length" class="photo-module">
        <div
          v-for="photoItem in photos"
          :key="photoItem.id"
          class="photo-box"
          @click="goGuestInfo(photoItem)"
        >
          <photo-box contain-photo :src="photoItem.src" />
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
import DatePicker from '@/components/DatePicker'
import PhotoBox from '@/components/PhotoBox'
import RetouchKindSelect from '@SelectBox/RetouchKindSelect'
import ProductSelect from '@SelectBox/ProductSelect'
import StaffSelect from '@SelectBox/StaffSelect'
import NoData from '@/components/NoData'
import { joinTimeSpan } from '@/utils/timespan.js'
import * as GuestPhoto from '@/api/guestPhoto'

export default {
  name: 'GuestPhotoList',
  components: { DatePicker, PhotoBox, StaffSelect, ProductSelect, RetouchKindSelect, NoData },
  props: {
    initSearch: { type: Object, required: true }
  },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 查询时间
      orderType: 1, // 查询类型 1 云端流水号 2 订单号 3 顾客姓名 4 手机号
      orderSearchValue: '', // 订单信息
      checkValue: 0, // 看片评价星数
      staffId: [], // 伙伴id
      productValues: '', // 产品id
      retouchStandards: '', // 修图标准
      columnCount: 4,
      locPager: {
        page: 1,
        pageSize: 12,
        total: 12
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
      ],
      reqPager: {
        page: 1,
        pageSize: 50,
        hasMore: true,
      },
      orinPhotoes: [] // 存储所有请求到的photoes
    }
  },
  computed: {
    photos () { // 展示的照片
      const starterIndex = (this.locPager.page - 1) * this.locPager.pageSize
      const enderIndex = starterIndex + this.locPager.pageSize
      const truePhotoes = this.orinPhotoes.slice(starterIndex, enderIndex)
      return truePhotoes
    }
  },
  watch: {
    'initSearch': {
      handler (value) {
        const { orderType, orderSearchValue } = value
        if (!orderType) return
        this.orderType = orderType
        this.orderSearchValue = orderSearchValue
        this.getPhotoList(true)
      },
      immediate: true
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
      if (this.orderSearchValue) {
        const key = type[this.orderType - 1]
        reqData[key] = this.orderSearchValue
      }
      if (!this.timeSpan && !this.orderSearchValue) {
        this.$newMessage.warning('请填写时间')
        return false
      }
      if (this.timeSpan) {
        reqData.startAt = joinTimeSpan(this.timeSpan[0])
        reqData.endAt = joinTimeSpan(this.timeSpan[1], 1)
      }
      if (this.staffId.length) {
        reqData.staffIds = this.staffId
      }
      if (this.checkValue) {
        reqData.evaluateStar = this.checkValue
      }
      if (this.productValues.length) {
        reqData.productIds = this.productValues
      }
      if (this.retouchStandards.length) {
        reqData.retouchStandards = this.retouchStandards
      }
      return reqData
    },
    /**
     * @description 获取客片池列表
     */
    async getPhotoList (needRest) {
      if (needRest) {
        this.restCondition()
      }
      const reqData = this.getParam()
      if (!reqData) return
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await GuestPhoto.getPhotoList(reqData)
        if (!data.length) {
          this.reqPager.hasMore = false
        }
        this.orinPhotoes = this.orinPhotoes.concat(data)
        this.locPager.total = this.orinPhotoes.length
      } catch (error) {
        console.error(error)
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
