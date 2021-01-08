<template>
  <div class="auto-image" v-loading="loading">
    <img
      class="auto-image-content"
      :src="activatedImage"
      @load="imageLoaded"
      alt=""
    >
  </div>
</template>

<script>
import { OperationBit, changeToCompress } from '@/api/autoRetouch'

export default {
  name: 'AutoImage',
  props: {
    autoImageInfo: { type: Object, required: true }
  },
  data () {
    return {
      loading: false
    }
  },
  computed: {
    activatedImage () {
      const handleSwtich = _.get(this.autoImageInfo, 'handleSwtich') || {}
      let typeBit = 0
      for (const key in handleSwtich) {
        const switchValue = handleSwtich[key]
        if (switchValue) {
          typeBit = typeBit | OperationBit[key]
        }
      }
      if (!typeBit) return ''
      const url = this.autoImageInfo.autoFixPhotoList[typeBit]
      if (!url) return ''
      const compressUrl = changeToCompress(url)
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.loading = true
      return compressUrl
    }
  },
  methods: {
    imageLoaded () {
      this.loading = false
    }
  }
}
</script>

<style lang="less" scoped>
.auto-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  .auto-image-content {
    max-width: 100%;
    max-height: 100%;
  }
}
</style>
