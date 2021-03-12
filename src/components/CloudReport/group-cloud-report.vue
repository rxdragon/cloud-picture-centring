<template>
  <div class="cloud-report" v-loading="loading">
    <div class="search-box">
      <div class="search-item">
        <span>评价时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <div class="staff-search search-item">
        <span>修图伙伴</span>
        <staff-select v-model="staffIds" />
      </div>
      <div class="product-box search-item">
        <span>产品</span>
        <product-select v-model="productValue" />
      </div>
    </div>
    <div class="chat-warp">
      <div class="total-sore"> 云端平均分：80 </div>
      <chart-bar></chart-bar>
    </div>

    <div>
      <el-tabs v-model="tabKey" @tab-click="handleChangeCategory">
        <el-tab-pane
          v-for="tab in cloudGradeConfigurationList"
          :label="tab.name"
          :name="tab.name"
          style="width: 100%;"
          :key="tab.name"
        >
        </el-tab-pane>
      </el-tabs>

      <div class="group-warp">
        <el-select v-model="currentSelectedGroup" multiple placeholder="请选择">
          <el-option
            v-for="item in currentGroup"
            :key="item.id"
            :label="item.name"
            :value="item.name"
          >
          </el-option>
        </el-select>
        <chart-bar ></chart-bar>
      </div>
    </div>
  </div>
</template>

<script>
import { delayLoading } from "@/utils/timespan"
import DatePicker from '@/components/DatePicker/index'
import StaffSelect from '@SelectBox/StaffSelect/index'
import ProductSelect from '@SelectBox/ProductSelect/index'
import ChartBar from './chart-bar'
import { mapGetters } from 'vuex'

export default {
  name: 'group-cloud-report',
  components: { DatePicker, StaffSelect, ProductSelect, ChartBar },
  data () {
    return {
      loading: false,
      timeSpan: null,
      staffIds: [], // 云端伙伴
      productValue: [], // 产品
      tabKey: '',
      currentSelectedGroup: []
    }
  },
  computed: {
    ...mapGetters(['cloudGradeConfigurationList']),
    currentGroup () {
      if (!this.cloudGradeConfigurationList) return []
      const currentGroup = this.cloudGradeConfigurationList.find(tab => tab.name === this.tabKey)
      if (!currentGroup) return []
      return [
        // { id: 0, name: '全部' },
        ...(currentGroup.children || []),
      ]
    }
  },
  async mounted () {
    await this.$store.dispatch('gradeConfiguration/getCloudGradeConfigurationList')
  },
  methods: {
    /**
     * @description 搜搜数据
     */
    async searchData () {
      this.loading = true
      try {
        await Promise.all([
          this.getCheckPoolQuota(),
          this.getCheckPoolSubQuota()
        ])
      } finally {
        await delayLoading()
        this.loading = false
      }
    },
    /**
     * 切换了大类需要初始化小类情况
     */
    handleChangeCategory () {
      this.currentSelectedGroup = []
    }
  }
}
</script>

<style scoped>
.chat-warp {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}
</style>
