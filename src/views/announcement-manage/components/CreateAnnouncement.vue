<template>
  <div class="create-announcement">
    <!-- 标题 -->
    <div class="header">
      <h3>创建公告</h3>
      <div class="header-plugin">
        <el-button type="info" @click="back">返回</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreateAnnouncement',
  methods: {
    back () {
      this.$emit('close')
    }
  }
}
</script>
