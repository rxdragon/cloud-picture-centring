<template>
  <div id="App">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="less">
body {
  margin: 0;
  padding: 0;
}

#App {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
