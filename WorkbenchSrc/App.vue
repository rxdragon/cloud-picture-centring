<template>
  <div id="App">
    <workbench />
  </div>
</template>

<script>
import workbench from './views/workbench'

export default {
  name: 'App',
  components: { workbench }
}
</script>

<style lang="less" scoped>
#App {
  -webkit-app-region: drag;
}
</style>

<style lang="less">
body {
  padding: 0;
  margin: 0;
  overflow: hidden;
}
</style>
