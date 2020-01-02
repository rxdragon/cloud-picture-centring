<template>
  <div class="guest-photo page-class">
    <div class="header">
      <h3>客片池</h3>
    </div>
    <guest-photo-scroll v-if="guestInfiniteScroll" />
    <guest-photo-list v-else />
  </div>
</template>

<script>
import GuestPhotoScroll from './components/GuestPhotoScroll'
import GuestPhotoList from './components/GuestPhotoList'
import { mapGetters } from 'vuex'

export default {
  name: 'GuestPhotoCenter',
  components: { GuestPhotoScroll, GuestPhotoList },
  computed: {
    ...mapGetters(['guestInfiniteScroll'])
  }
}
</script>
