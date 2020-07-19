<template>
  <div class="retoucher-charge-back-report">
    <div class="search-box">
      <div class="search-item">
        <span>时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <div class="staff-option search-item">
        <span>云端伙伴</span>
        <staff-select v-model="staffIds" />
      </div>
      <div class="button-box search-item">
        <el-button type="primary" @click="searchData">查 询</el-button>
      </div>
    </div>
    <!-- 退单单量统计 -->
    <div class="charge-back-chat charge-back-module">
      <div class="panel-title">退单单量统计</div>
      <charge-back-chat />
    </div>
    <div class="charge-back-chat charge-back-module">
      <div class="panel-title">其他数据</div>
      <div class="panel-content">
        <div class="info-item" v-for="(otherItem, otherIndex) in otherInfo" :key="otherIndex">
          <div class="info-header">
            <div class="info-title">{{ otherItem.title }}</div>
            <div class="info-desc">{{ otherItem.desc || '&nbsp;' }}</div>
          </div>
          <div class="info-value">
            ¥{{ otherItem.value }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import StaffSelect from '@SelectBox/StaffSelect'
import ChargeBackChat from '@/components/ChartComponents/ChargeBackChat'

export default {
  name: 'RetoucherChargeBackReport',
  components: { DatePicker, StaffSelect, ChargeBackChat },
  data () {
    return {
      timeSpan: null,
      staffIds: '',
      otherInfo: {
        storeReturnIncome: { title: '退单总收益', desc: '门店退回云端所获得实际收益', value: '10' },
        storeReturnIncomeForNotQuality: { title: '退单非质量问题获得收益', desc: '', value: '10' },
        // TODO
        storeReturnIncomeForNotSelf: { title: '退单质量问题非本人接单获得收益', desc: '', value: '10' },
        storeReturnIncomeForPunish: { title: '退单质量问题扣除收益', desc: '', value: '10' },
        storeReturnExp: { title: '退单总海草', desc: '门店退回云端所获得实际海草', value: '10' },
        storeReturnExpForNotQuality: { title: '退单非质量问题获得海草', desc: '', value: '10' },
        // TODO
        storeReturnExpForNotSelf: { title: '退单质量问题非本人接单获得海草', desc: '', value: '10' },
        storeReturnExpForPunish: { title: '退单质量问题扣除海草', desc: '', value: '10' },
        storeReturnRetouchTime: { title: '门店退回修图时长', desc: '门店退回至云端再次提交的平均修图时长', value: '10' },
        // TODO storeReturnPhotoNumForQuality / retouchAll
        returnPhotoRate: { title: '退张率', desc: '质量问题', value: '10' }
      },
      chatData: {
        // 门店退回（总）
        storeReturn: {
          orderCount: 'storeReturnStreamNum',
          photoCount: 'storeReturnPhotoNum'
        },
        // 云端完成退回订单（总）
        retoucherFinishRework: {
          orderCount: 'retoucherFinishReworkStreamNum',
          photoCount: 'retoucherFinishReworkPhotoNum'
        },
        // 退回非质量问题
        storeReturnForNotQuality: {
          orderCount: 'storeReturnStreamNumForNotQuality',
          photoCount: 'storeReturnPhotoNumForNotQuality'
        },
        // 退回质量问题
        storeReturnForQuality: {
          orderCount: 'storeReturnStreamNumForQuality',
          photoCount: 'storeReturnPhotoNumForQuality'
        },
        // 退回质量问题
        storeReturnForBoth: {
          orderCount: 'storeReturnStreamNumForBoth',
          photoCount: 'storeReturnPhotoNumForBoth'
        }
      }
    }
  },
  methods: {
    /**
     * @description 搜索数据
     */
    searchData () {
      // TODO 搜搜时间
    }
  }
}
</script>

<style lang="less" scoped>
.search-box {
  border-bottom: 1px solid #ecedee;

  .search-item {
    margin-bottom: 24px;
  }
}

.charge-back-module {
  margin-top: 24px;

  .panel-content {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-top: 24px;

    .info-item {
      display: flex;
      flex-direction: column;
      width: 25%;

      .info-header {
        padding: 14px 12px;
        text-align: center;
        background-color: #fafafa;

        .info-title {
          font-size: 14px;
          font-weight: 500;
          line-height: 22px;
          color: #303133;
        }

        .info-desc {
          font-size: 14px;
          font-weight: 500;
          line-height: 22px;
          color: #8f9398;
        }
      }

      .info-value {
        padding: 21px 0;
        font-size: 14px;
        font-weight: 400;
        color: #606266;
        text-align: center;
      }
    }
  }
}
</style>
