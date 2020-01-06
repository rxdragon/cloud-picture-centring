<template>
  <div class="experiment-view">
    <div class="header">
      <h3>扩展功能</h3>
    </div>
    <div class="content">
      <el-form ref="experiment" label-width="200px" label-position="left">
        <el-form-item label="是否显示宠物">
          <el-switch :value="showCat" @change="setCatShow" />
        </el-form-item>
        <el-form-item label="是否对已上传的照片打标记">
          <el-switch :value="showOverTag" @change="setShowOverTag" />
        </el-form-item>
        <el-form-item label="是否开启自动选中文件">
          <el-switch :value="autoUpload" @change="setAutoUpload" />
        </el-form-item>
        <el-form-item label="是否开启预加载功能">
          <el-switch :value="cacheImageSwitchValue" @change="setCacheImageSwitch" />
        </el-form-item>
        <el-form-item label="客片池使用无限下拉">
          <el-switch :value="cacheGuestInfiniteScroll" @change="setCacheGuestInfiniteScroll" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as Setting from '@/indexDB/getSetting.js'
export default {
  name: 'ExperimentView',
  data () {
    return {}
  },
  computed: {
    ...mapGetters([
      'showCat',
      'showOverTag',
      'autoUpload',
      'cacheImageSwitch',
      'guestInfiniteScroll'
    ]),
    cacheImageSwitchValue () {
      return Boolean(Number(this.cacheImageSwitch))
    },
    cacheGuestInfiniteScroll () {
      return Boolean(Number(this.guestInfiniteScroll))
    }
  },
  methods: {
    setCatShow (value) {
      this.$store.dispatch('setting/setShowCat', value)
    },
    setShowOverTag (value) {
      this.$store.dispatch('setting/setShowOverTag', value)
    },
    setAutoUpload (value) {
      this.$store.dispatch('setting/setAutoUpload', value)
    },
    setCacheImageSwitch (value) {
      this.$store.dispatch('setting/setImageCacheSwitch', value)
        .then(() => {
          const data = value ? 1 : 0
          Setting.updateSetting('imageCacheSwitch', data)
        })
    },
    setCacheGuestInfiniteScroll (value) {
      this.$store.dispatch('setting/setGuestInfiniteScroll', value)
        .then(() => {
          const data = value ? 1 : 0
          Setting.updateSetting('guestInfiniteScroll', data)
        })
    }
  }
}
</script>
