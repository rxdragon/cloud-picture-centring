<template>
  <div class="detail-announcement">
    <!-- 标题 -->
    <div class="header">
      <h3>公告详情</h3>
      <div class="header-plugin">
        <el-button type="info" @click="back">返回</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DetailAnnouncement',
  methods: {
    back () {
      this.$emit('close')
    }
  }
}
</script>
