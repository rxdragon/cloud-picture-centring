<template>
  <div class="evaluate-photo">
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
        <el-button type="primary" @click="getAttitudePhotoList(true)">查询</el-button>
      </div>
    </div>
    <div class="search-box">
      <!-- 产品名称 -->
      <div class="product-box search-item">
        <span class="row-title">产品名称</span>
        <product-select v-model="productValue" :props="{ multiple: false }" />
      </div>
    </div>
    <div class="module-panel table-box">
      <div v-if="photos.length" class="search-data">
        <div v-for="(photoItem, photoIndex) in photos" :key="photoIndex" class="photo-box">
          <photo-box
            contain-photo
            :show-special-effects="false"
            :tags="photoItem.tags"
            :src="photoItem.src"
            @click.native="goToDetails(photoItem)"
          />
          <div class="staff-name">修图师：{{ photoItem.retoucherName }}</div>
          <div class="group-name">修图小组：{{ photoItem.retouchGroupName }}</div>
        </div>
        <div v-for="i in columnCount" :key="'empty' + i" class="empty-box" />
      </div>
      <no-data v-else />
      <!-- 分页 -->
      <div class="page-box">
        <el-pagination
          hide-on-single-page
          :current-page.sync="locPager.page"
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
import StaffSelect from '@SelectBox/StaffSelect'
import RetouchKindSelect from '@SelectBox/RetouchKindSelect'
import ProductSelect from '@SelectBox/ProductSelect'
import NoData from '@/components/NoData'
import { joinTimeSpan } from '@/utils/timespan.js'

import * as GuestPhoto from '@/api/guestPhoto.js'

export default {
  name: 'EvaluatePhoto',
  components: { DatePicker, PhotoBox, StaffSelect, RetouchKindSelect, ProductSelect, NoData },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 时间戳
      type: '', // 查看类型
      staffId: [], // 伙伴id
      productValue: '', // 产品id
      retouchStandard: '', // 修图类别
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
    photos () { // 展示的照片
      const starterIndex = (this.locPager.page - 1) * this.locPager.pageSize
      const enderIndex = starterIndex + this.locPager.pageSize
      const truePhotoes = this.orinPhotoes.slice(starterIndex, enderIndex)
      return truePhotoes
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
  methods: {
    /**
     * @description 分页组件页码变动逻辑
     */
    handleLocalPhoto (value) {
      // 先判断后面是否还有两页的量,没有的话,reqPager.page+1,去请求下一页,有的话,直接本地到下一页;
      const starterIndex = (value - 1) * this.locPager.pageSize
      if (this.orinPhotoes.slice(starterIndex).length < (this.locPager.pageSize * 2) && this.reqPager.hasMore) {
        this.reqPager.page += 1
        this.getAttitudePhotoList()
      }
      this.locPager.page = value
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
        page: this.reqPager.page,
        pageSize: this.reqPager.pageSize
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
    async getAttitudePhotoList (needRest) {
      if (needRest) {
        this.restCondition()
      }
      const reqData = this.getParam()
      if (!reqData) return
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await GuestPhoto.getAttitudePhotoList(reqData)
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

.evaluate-photo {
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
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding-bottom: 0;
    margin-top: 20px;

    .photo-box {
      width: 24%;
      margin-bottom: 24px;
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

    .empty-box {
      width: 24%;
    }

    .page-box {
      width: 100%;
    }
  }
}
</style>
