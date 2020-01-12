<template>
  <div class="good-guest page-class">
    <div class="header">
      <h3>{{ $route.name === 'BadGuest' ? '问题客片' : '优秀客片' }}</h3>
    </div>
    <EvaluatePhotoScroll v-if="guestInfiniteScroll" />
    <EvaluatePhoto v-else />
  </div>
</template>

<script>
import EvaluatePhoto from './components/EvaluatePhoto'
import EvaluatePhotoScroll from './components/EvaluatePhotoScroll'
import { mapGetters } from 'vuex'

export default {
  name: 'GoodGuest',
  components: { EvaluatePhoto, EvaluatePhotoScroll },
  computed: {
    ...mapGetters(['guestInfiniteScroll'])
  }
}
</script>
