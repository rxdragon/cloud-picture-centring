<template>
  <div class="guest-photo page-class">
    <div class="header">
      <h3>客片池</h3>
    </div>
    <!-- 搜索相关 -->
    <el-row class="search-box" :gutter="20">
      <!-- 修图完成时间 -->
      <el-col :span="8" :xl="4">
        <div class="search-item">
          <span>修图完成时间</span>
          <date-picker v-model="timeSpan" />
        </div>
      </el-col>
      <!-- 伙伴 -->
      <el-col :span="8" :xl="4">
        <div class="staff-box search-item">
          <span class="row-title">伙伴</span>
          <staff-select v-model="staffId" />
        </div>
      </el-col>
      <!-- 订单信息 -->
      <el-col :span="8" :xl="4">
        <div class="order-search search-item">
          <el-input
            v-model.trim="orderSearchValue"
            clearable
            placeholder="请输入内容"
            class="input-with-select"
            @keyup.native.enter="getPhotoList(1)"
          >
            <el-select slot="prepend" v-model="orderType" placeholder="请选择">
              <el-option label="云端流水号" :value="1" />
              <el-option label="订单号" :value="2" />
              <el-option label="顾客姓名" :value="3" />
              <el-option label="手机号" :value="4" />
            </el-select>
          </el-input>
        </div>
      </el-col>
      <!-- 照片类型 -->
      <el-col :span="8" :xl="4">
        <div class="order-search search-item">
          <span class="row-title">照片类型</span>
          <PhotoVersionSelect v-model="photoVersion" />
        </div>
      </el-col>
      <!-- 看片评价 -->
      <el-col :span="8" :xl="4">
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
      </el-col>
      <!-- 产品名称 -->
      <el-col :span="8" :xl="4">
        <div class="product-box search-item">
          <span class="row-title">产品名称</span>
          <product-select v-model="productValues" />
        </div>
      </el-col>
      <!-- 修图标准 -->
      <el-col :span="6" :xl="4">
        <div class="search-item">
          <span>修图标准</span>
          <retouch-kind-select v-model="retouchStandards" multiple placeholder="请选择修图标准"/>
        </div>
      </el-col>
      <el-col :span="2" :xl="2">
        <div class="button-box search-item">
          <el-button type="primary" @click="getPhotoList">查询</el-button>
        </div>
      </el-col>
    </el-row>
   
    <guest-photo-scroll ref="guestScroll" :search-params="searchParams" v-if="guestInfiniteScroll" />
    <guest-photo-list ref="guestList" :search-params="searchParams" v-else />
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import RetouchKindSelect from '@SelectBox/RetouchKindSelect'
import ProductSelect from '@SelectBox/ProductSelect'
import StaffSelect from '@SelectBox/StaffSelect'
import PhotoVersionSelect from '@SelectBox/PhotoVersionSelect'

import GuestPhotoScroll from './components/GuestPhotoScroll'
import GuestPhotoList from './components/GuestPhotoList'
import { mapGetters } from 'vuex'
import { PHOTO_VERSION } from '@/utils/enumerate.js'


export default {
  name: 'GuestPhotoCenter',
  components: { GuestPhotoScroll, GuestPhotoList, DatePicker, StaffSelect, ProductSelect, RetouchKindSelect, PhotoVersionSelect },
  data () {
    return {
      initSearchData: {},
      timeSpan: null, // 查询时间
      staffId: [], // 伙伴id
      orderSearchValue: '', // 订单信息
      orderType: 1, // 查询类型 1 云端流水号 2 订单号 3 顾客姓名 4 手机号
      checkValue: 0, // 看片评价星数
      productValues: '', // 产品id
      retouchStandards: '', // 修图标准
      photoVersion: PHOTO_VERSION.FINISH_PHOTO, // 照片版本
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
      searchParams: {} // 搜索参数
    }
  },
  computed: {
    ...mapGetters(['guestInfiniteScroll'])
  },
  activated () {
    const { orderNum, streamNum } = this.$route.query
    let searchValue = {}
    if (orderNum) {
      searchValue = {
        orderType: 2,
        orderSearchValue: orderNum
      }
    }
    // 初始查询流水号
    if (streamNum) {
      searchValue = {
        orderType: 1,
        orderSearchValue: streamNum
      }
    }

    const { orderType, orderSearchValue } = searchValue
    if (!orderType) return
    this.orderType = orderType
    this.orderSearchValue = orderSearchValue
    this.getPhotoList()
  },
  methods: {
    /**
     * @description 获取列表
     */
    async getPhotoList () {
      // 如果有额外搜索条件，则取消时间项
      if (this.orderSearchValue) {
        this.timeSpan = ''
      }

      this.searchParams = {
        timeSpan: this.timeSpan,
        staffId: this.staffId,
        orderSearchValue: this.orderSearchValue,
        orderType: this.orderType,
        checkValue: this.checkValue,
        productValues: this.productValues,
        retouchStandards: this.retouchStandards,
        photoVersion: this.photoVersion
      }
      await this.$nextTick()
      if (this.guestInfiniteScroll) {
        this.$refs['guestScroll'].getPhotoList()
      } else {
        this.$refs['guestList'].getPhotoList(true)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.search-box {
  .order-search {
    & /deep/ .el-input-group__prepend {
      width: 120px;

      .el-select {
        width: 120px;
      }
    }
  }
}
</style>
