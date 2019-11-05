<template>
  <div class="evaluate-photo">
    <div class="header">
      <h3>{{ $route.name === 'IssuePhoto' ? '问题客片' : '优秀客片' }}</h3>
    </div>
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
        <retouch-kind-select v-model="retouchStandard" />
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
    <div class="module-panel table-box">
      <div class="panel-title">照片列表</div>
      <div class="search-data">
        <div v-for="(photoItem, photoIndex) in photos" :key="photoIndex" class="photo-box">
          <photo-box
            :tags="photoItem.tags"
            :src="photoItem.src"
            @click.native="goToDetails(photoItem)"
          />
          <div class="staff-name">修图师：{{ photoItem.stream.retoucher.name }}</div>
          <div class="group-name">修图小组：{{ photoItem.stream.retoucher.retouch_group.name }}</div>
        </div>
        <div v-for="i in 4" :key="'empty' + i" class="empty-box" />
      </div>
      <!-- 分页 -->
      <div class="page-box">
        <el-pagination
          :hide-on-single-page="true"
          :current-page.sync="pager.page"
          :page-size="pager.pageSize"
          layout="total, prev, pager, next, jumper"
          :total="pager.total"
          @current-change="handleCurrentChange"
        />
      </div>
      <div v-if="!photos.length" class="no-data">暂无数据</div>
    </div>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import PhotoBox from '@/components/PhotoBox'
import StaffSelect from '@SelectBox/StaffSelect'
import RetouchKindSelect from '@SelectBox/RetouchKindSelect'
import ProductSelect from '@SelectBox/ProductSelect'
import { joinTimeSpan } from '@/utils/timespan.js'

import * as GuestPhoto from '@/api/guestPhoto.js'

export default {
  name: 'EvaluatePhoto',
  components: { DatePicker, PhotoBox, StaffSelect, RetouchKindSelect, ProductSelect },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 时间戳
      type: '', // 查看类型
      staffId: [], // 伙伴id
      productValue: '', // 产品id
      retouchStandard: '', // 修图类别
      photos: [], // 照片数据
      pager: {
        page: 1,
        pageSize: 10,
        total: 0
      }
    }
  },
  created () {
    const name = this.$route.name
    if (name === 'ExcellentPhoto') {
      this.type = 'good'
    } else if (name === 'IssuePhoto') {
      this.type = 'bad'
    } else {
      this.$router.replace('/404')
    }
  },
  methods: {
    handleCurrentChange () {
      this.getAttitudePhotoList()
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
     * @description 获取优秀客片列表
     */
    async getAttitudePhotoList (page) {
      try {
        if (!this.timeSpan) {
          this.$newMessage.warning('请输入时间')
          return false
        }
        this.pager.page = page || this.pager.page
        const reqData = {
          attitude: this.type,
          startAt: joinTimeSpan(this.timeSpan[0]),
          endAt: joinTimeSpan(this.timeSpan[1], 1),
          page: this.pager.page,
          pageSize: this.pager.pageSize
        }
        if (this.staffId.length) { reqData.staffIds = this.staffId }
        if (this.retouchStandard) { reqData.retouchStandard = this.retouchStandard }
        if (this.productValue) { reqData.productId = this.productValue }
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await GuestPhoto.getAttitudePhotoList(reqData)
        this.pager.total = data.total
        this.photos = data.list
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

.evaluate-photo {
  .search-box {
    margin-bottom: 20px;

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
    margin-top: 20px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding-bottom: 0;

    .photo-box {
      width: 24%;
      margin-bottom: 24px;
      cursor: pointer;

      .group-name,
      .staff-name {
        font-size: 12px;
        color: #606266;
        line-height: 17px;
      }

      .staff-name {
        padding: 12px 6px 10px;
        border-bottom: 1px solid #ebeef5;
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
