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
    <div class="search-data table-box">
      <list-scroll :list.sync='photos' :loadMoreData="getData">
        <template v-slot="data">
          <div>
            {{ data }}
          </div>
        </template>
      </list-scroll>
      <div v-if="!photos.length" class="no-data">暂无数据</div>
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
import { joinTimeSpan } from '@/utils/timespan.js'

import * as GuestPhoto from '@/api/guestPhoto'

export default {
  name: 'GuestPhotoCenter',
  components: { DatePicker, PhotoBox, StaffSelect, ProductSelect, RetouchKindSelect, ListScroll },
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
      pager: {
        page: 1,
        pageSize: 12
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
  methods: {
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
    handleRowData (msg) {
      const rowData = []
      const columnCount = 4
      const sliceTimes = Math.ceil(msg.length / columnCount)
      for (let index = 0; index < sliceTimes; index++) {
        const firstIndex = index * columnCount
        const lastIndex = firstIndex + columnCount
        rowData.push(msg.slice(firstIndex, lastIndex))
      }
    },
    /**
     * @description 获取客片池列表
     */
    async getPhotoList (page) {
      this.pager.page = page || this.pager.page
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
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await GuestPhoto.getPhotoList(reqData)
        this.photos = this.handleRowData(data) || []
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    },
    async getData () {
      return []
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

    .photo-box {
      width: 24%;
      margin-bottom: 24px;
      cursor: pointer;
    }

    .empty-box {
      width: 24%;
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
