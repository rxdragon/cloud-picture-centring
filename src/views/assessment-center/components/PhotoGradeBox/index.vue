<template>
  <div class="photo-grade-box">
    <div class="photo-num info-box">
      <label class="data-label">照片编号：</label>
      <div class="data-value">1-1</div>
    </div>
    <div class="product-info">
      <div class="info-box">
        <label class="data-label">修图标准：</label>
        <div class="data-value">蓝标</div>
      </div>
      <div class="info-box">
        <label class="data-label">产品名称：</label>
        <div class="data-value">结婚照-结婚登记照</div>
      </div>
    </div>
    <div class="photo-list">
    </div>
  </div>
</template>

<script>
export default {
  name: 'PhotoGradeBox',
  data () {
    return {}
  }
}
</script>

<style lang="less" scoped>
.photo-grade-box {
  width: 357px;
  height: 244px;
  padding: 20px 0 20px 20px;
  margin: 0 20px 20px 0;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.06);

  .info-box {
    display: flex;

    .data-value,
    .data-label {
      font-size: 14px;
      font-weight: 400;
      line-height: 22px;
      color: #303133;
    }
  }

  .photo-num {
    margin-bottom: 4px;
  }

  .product-info {
    display: flex;

    .info-box {
      margin-right: 20px;
    }
  }

  .photo-list {
    height: 140px;
    margin-top: 16px;
    background-color: red;
  }
}
</style>
