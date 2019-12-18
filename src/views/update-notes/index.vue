<template>
  <div class="update-notes">
    <div class="header">
      <h3>关于</h3>
    </div>
    <div v-for="versionItem in versionArr" :key="versionItem.title">
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
      versionArr: notes
    }
  }
}
</script>
