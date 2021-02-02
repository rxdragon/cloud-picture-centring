<template>
  <div class="information-switch">
    <el-badge
      :hidden="!announcementUnreadCount"
      :value="announcementUnreadCount"
      :max="9"
      class="item"
    >
      <el-button @click="toAnnouncement" class="icon-button" icon="iconfont iconxiaoxi"></el-button>
    </el-badge>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'InformationSwitch',
  data () {
    return {}
  },
  computed: {
    ...mapGetters(['announcementUnreadCount']),
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
  margin-right: 20px;

  .icon-button {
    width: 24px;
    height: 24px;
    padding: 0;
  }
}
</style>
