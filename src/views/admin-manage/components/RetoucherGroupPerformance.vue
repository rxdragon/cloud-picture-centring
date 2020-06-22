<template>
  <div class="retoucher-group-performance">
    <div class="search-box">
      <div class="search-item">
        <span>时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <div class="staff-search search-item">
        <span>修图组</span>
        <retoucher-group-select v-model="retoucherGroupValue" />
      </div>
      <div class="search-item">
        <el-button type="primary">查 询</el-button>
      </div>
      <div class="tip-box search-item">
        <tip :message="tipMessage" />
      </div>
    </div>
    <div class="module-table-box">
      <el-table :data="tableData" style="width: 100%;">
        <el-table-column prop="date" label="修图组"/>
        <el-table-column prop="date" label="修图主管" />
        <el-table-column prop="date" label="工号" />
        <el-table-column label="退单">
          <template slot-scope="{ row }">
            <p>退单率：{{ row.date.value }}%</p>
            <p>排名：1</p>
          </template>
        </el-table-column>
        <el-table-column label="抽查">
          <template slot-scope="{ row }">
            <p>平均分：{{ row.date.value }}</p>
            <p>排名：1</p>
          </template>
        </el-table-column>
        <el-table-column label="绩效">
          <template slot-scope="{ row }">
            <p>得分：{{ row.date.value }}</p>
            <p>排名：1</p>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker'
import RetoucherGroupSelect from '@SelectBox/RetoucherGroupSelect'
import Tip from '@/components/Tip'

const tipMessage = `列表中，绩效是人工导入，其余的是由系统进行计算得出的排名。<br/>
排名和平均分的规则为每个月最后一天23:59:59<i>自动冻结</i>当月的排名和分数,<br/>
只有当月的是实时根据天数进行变化的。`

export default {
  name: 'RetoucherGroupPerformance',
  components: { DatePicker, RetoucherGroupSelect, Tip },
  data () {
    return {
      tipMessage,
      timeSpan: null, // 查询时间
      retoucherGroupValue: '', // 修图组
      tableData: [
        {
          date: {
            value: 123,
            tip: 12
          }
        }
      ]
    }
  }
}
</script>

<style lang="less" scoped>
.retoucher-group-performance {
  .search-box {
    margin-bottom: 20px;
  }
}
</style>
