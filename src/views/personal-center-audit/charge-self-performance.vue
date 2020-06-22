<template>
  <div class="personal-center-audit">
    <div class="header">
      <h3>个人绩效</h3>
    </div>
    <!-- 小蜜蜂 -->
    <div class="module-panel apis-florea">
      <div class="panel-title">小蜜蜂</div>
      <div class="search-box">
        <div class="search-item">
          <span>查询时间</span>
          <el-date-picker
            v-model="yearValue"
            type="month"
            value-format="yyyy"
            placeholder="选择年"
          />
        </div>
        <div class="search-item">
          <el-button type="primary">查询</el-button>
        </div>
      </div>
      <div class="apis-info">
        <el-row class="info-box">
          <el-col :span="4" class="info-item">
            <div class="info-label">金额</div>
            <div class="info-value">¥：20.00</div>
          </el-col>
          <el-col :span="4" class="info-item">
            <div class="info-label">绩效平均分</div>
            <div class="info-value">1</div>
          </el-col>
          <el-col :span="4" class="info-item">
            <div class="info-label">排名</div>
            <div class="info-value">1</div>
          </el-col>
        </el-row>
      </div>
    </div>
    <!-- 月度绩效 -->
    <div class="module-panel monthly-performance">
      <div class="panel-title">月度绩效</div>
      <div class="search-box">
        <div class="search-item">
          <span>查询时间</span>
          <el-date-picker
            v-model="timeSpan"
            type="month"
            value-format="yyyy-MM"
            placeholder="选择月"
          />
        </div>
        <div class="search-item">
          <el-button type="primary">查询</el-button>
        </div>
      </div>
      <div class="performance-box">
        <el-row class="info-box">
          <el-col :span="6" class="info-item">
            <div class="info-label">退单率</div>
            <div class="info-value">¥：20.00</div>
          </el-col>
          <el-col :span="6" class="info-item">
            <div class="info-label">退单排名</div>
            <div class="info-value">1</div>
          </el-col>
          <el-col :span="6" class="info-item">
            <div class="info-label">绩效得分</div>
            <div class="info-value">1</div>
          </el-col>
          <el-col :span="6" class="info-item">
            <div class="info-label">绩效排名</div>
            <div class="info-value">1</div>
          </el-col>
          <el-col :span="6" class="info-item">
            <div class="info-label">抽查平均分</div>
            <div class="info-value">1</div>
          </el-col>
          <el-col :span="18" class="info-item">
            <div class="info-label">抽查排名</div>
            <div class="info-value">1</div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PersonalCenterAudit',
  data() {
    return {
      yearValue: null,
      timeSpan: null
    }
  },
}
</script>

<style lang="less" scoped>
.personal-center-audit {
  .module-panel {
    margin-bottom: 20px;

    .panel-title {
      margin-bottom: 20px;
    }

    .info-box {
      margin-top: 20px;
      border-bottom: 1px solid #fafafa;

      .info-label {
        display: flex;
        align-items: center;
        height: 100%;
        max-height: 78px;
        padding: 17px 20px;
        font-family: @pingFang;
        font-size: 14px;
        font-weight: 500;
        line-height: 22px;
        color: #303133;
        text-align: left;
        background-color: #f2f2f2;
      }

      .info-value {
        height: 58px;
        padding: 21px 20px;
        font-size: 14px;
        text-align: left;
        background-color: #fff;
      }
    }
  }
}
</style>
