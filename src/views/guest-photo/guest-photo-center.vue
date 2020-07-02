<template>
  <div class="guest-photo page-class">
    <div class="header">
      <h3>客片池</h3>
    </div>
    <guest-photo-scroll :init-search="initSearchData" v-if="guestInfiniteScroll" />
    <guest-photo-list :init-search="initSearchData" v-else />
  </div>
</template>

<script>
import GuestPhotoScroll from './components/GuestPhotoScroll'
import GuestPhotoList from './components/GuestPhotoList'
import { mapGetters } from 'vuex'

export default {
  name: 'GuestPhotoCenter',
  components: { GuestPhotoScroll, GuestPhotoList },
  data () {
    return {
      initSearchData: {}
    }
  },
  computed: {
    ...mapGetters(['guestInfiniteScroll'])
  },
  activated () {
    const { orderNum, streamNum } = this.$route.query
    if (orderNum) {
      this.initSearchData = {
        orderType: 2,
        orderSearchValue: orderNum
      }
    }
    // 初始查询流水号
    if (streamNum) {
      this.initSearchData = {
        orderType: 1,
        orderSearchValue: streamNum
      }
    }
  }
}
</script>
