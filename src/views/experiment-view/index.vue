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
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'ExperimentView',
  data () {
    return {}
  },
  computed: {
    ...mapGetters([
      'showCat'
    ])
  },
  methods: {
    setCatShow (value) {
      this.$store.dispatch('setting/setShowCat', value)
    }
  }
}
</script>
