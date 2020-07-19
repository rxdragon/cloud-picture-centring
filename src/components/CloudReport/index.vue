<template>
  <div class="cloud-report">
    <div class="search-box">
      <div class="search-item">
        <span>评价时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <div class="staff-option search-item" v-if="role === CLOUD_ROLE.GROUP_LEADER">
        <span>组员</span>
        <crew-select v-model="staffId" />
      </div>
      <div class="staff-search search-item" v-if="role === CLOUD_ROLE.OPERATE">
        <span>云端伙伴</span>
        <staff-select v-model="staffIds" />
      </div>
      <div class="product-box search-item" v-if="role === CLOUD_ROLE.OPERATE">
        <span>产品</span>
        <product-select v-model="productValue" />
      </div>
      <div class="button-box search-item">
        <el-button type="primary" @click="searchData">查 询</el-button>
      </div>
    </div>
    <div class="report-module">
      <!-- TODO -->
      <div class="panel-title">整理抽查数据统计</div>
    </div>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import CrewSelect from '@SelectBox/CrewSelect'
import StaffSelect from '@SelectBox/StaffSelect'
import ProductSelect from '@SelectBox/ProductSelect'
import { CLOUD_ROLE } from '@/utils/enumerate'

export default {
  name: 'CloudReport',
  components: { DatePicker, CrewSelect, StaffSelect, ProductSelect },
  props: {
    role: { type: String, required: true }
  },
  data () {
    return {
      CLOUD_ROLE,
      routeName: this.$route.name, // 路由名字
      timeSpan: '',
      staffId: '',
      staffIds: [], // 云端伙伴
      productValue: [] // 产品
    }
  },
  methods: {
    searchData () {
      // TODO
    }
  }
}
</script>

<style lang="less" scoped>
.search-item {
  margin-bottom: 24px;
}

.search-box {
  border-bottom: 1px solid #ecedee;
}

.report-module {
  margin-top: 24px;
}

& /deep/ .product-select {
  .el-cascader {
    width: 250px;
  }
}
</style>
