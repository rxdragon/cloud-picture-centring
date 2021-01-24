<template>
  <div class="information-switch">
    <el-button @click="toAnnouncement" class="icon-button" icon="iconfont iconxiaoxi"></el-button>
  </div>
</template>

<script>
export default {
  name: 'InformationSwitch',
  data () {
    return {}
  },
  methods: {
    /**
     * @description 跳转值公告管理
     */
    toAnnouncement () {
      this.$router.push({ path: '/announcement-center/announcement-center-index' })
    }
  }
}
</script>

<style lang="less" scoped>
.information-switch {
  margin-right: 6px;

  .icon-button {
    width: 24px;
    height: 24px;
    padding: 0;
  }
}
</style>
