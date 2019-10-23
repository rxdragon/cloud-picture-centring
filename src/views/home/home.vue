<template>
  <div class="Home">

    <photo-box stream-num="C2019123123" downing src="10c8033841f4f1b557222102055d0301.jpg" />
    你好！
  </div>
</template>

<script>
import PhotoBox from '@/components/PhotoBox'

export default {
  name: 'Home',
  components: { PhotoBox },
  data () {
    return {}
  },
  created () {},
  mounted () {},
  methods: {
  }
}
</script>
<style src="./home.less" lang="less"></style>

<style lang="less" scoped>
.photo {
  width: 200px;
}
</style>

