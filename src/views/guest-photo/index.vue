<template>
  <div class="guest-photo">
    <div class="header">
      <h3>客片池</h3>
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
      <!-- 订单信息 -->
      <div class="order-search search-item">
        <el-input v-model="orderSearchValue" placeholder="请输入内容" class="input-with-select">
          <el-select slot="prepend" v-model="orderType" placeholder="请选择">
            <el-option label="云端流水号" :value="1" />
            <el-option label="顾客姓名" :value="2" />
            <el-option label="手机号" :value="3" />
          </el-select>
        </el-input>
      </div>
      <div class="button-box search-item">
        <el-button type="primary" @click="getPhotoList(1)">查询</el-button>
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
    </div>
    <div class="search-data table-box">
      <div v-for="(photoItem, photoIndex) in photos" :key="photoIndex" class="photo-box">
        <photo-box :tags="photoItem.tags" :src="photoItem.src" @click.native="goGuestInfo(photoItem)" />
      </div>
      <div v-for="i in 4" :key="'empty' + i" class="empty-box" />
      <div v-if="pager.total > pager.pageSize" class="page-box">
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
import { joinTimeSpan } from '@/utils/timespan.js'

import * as GuestPhoto from '@/api/guestPhoto'

export default {
  name: 'GuestPhoto',
  components: { DatePicker, PhotoBox, StaffSelect },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null,
      orderType: 1,
      orderSearchValue: '',
      checkValue: 0,
      staffId: [], // 伙伴id
      photos: [],
      pager: {
        page: 1,
        pageSize: 12,
        total: 0
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
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        const data = await GuestPhoto.getPhotoList(reqData)
        this.photos = data.list || []
        this.pager.total = data.total
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

.guest-photo {
  .search-box {
    flex-wrap: wrap;
    align-items: center;

    .search-item {
      margin-bottom: 20px;
      margin-right: 24px;
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
