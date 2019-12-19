<template>
  <div class="update-notes">
    <div class="header" :class="showBorder">
      <h3>关于</h3>
    </div>
    <div v-for="versionItem in versionArr" :key="versionItem.title" class="content-main" @scroll="scrollMove">
      <h3 class="version-title">版本更新：{{ versionItem.title }} </h3>
      <marddown-viewer :key="versionItem.title + 'viewer'" :value="versionItem.desc" />
    </div>
  </div>
</template>

<script>
import MarddownViewer from './components/MarddownViewer'
import notes from './assets/notes'

export default {
  name: 'UpdateNotes',
  components: { MarddownViewer },
  data () {
    return {
      versionArr: notes,
      showBorder: ''
    }
  },
  methods: {
    scrollMove (e) {
      const scrollTop = e.target.scrollTop
      this.showBorder = scrollTop > 0 ? 'header-box' : ''
    }
  }
}
</script>

<style lang="less" scoped>
.header-box {
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
}

.version-title {
  font-weight: 400;
}

.content-main {
  margin-right: -24px;
  padding-right: 24px;
}
</style>
