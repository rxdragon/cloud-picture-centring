<template>
  <div class="domain-switch-box">
    <el-radio-group v-model="domainValue" size="small" @change="onDomainChange">
      <el-radio-button :label="1">又拍云</el-radio-button>
      <el-radio-button :label="2">阿里云</el-radio-button>
    </el-radio-group>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'DomainSwitchBox',
  data () {
    return {
      domainValue: 1 // 1 又拍云 2 阿里云
    }
  },
  computed: {
    ...mapGetters(['imgDomain'])
  },
  created () {
    this.domainValue = this.imgDomain.includes('cdn2') ? 2 : 1
  },
  methods: {
    /**
     * @description 监听域名变换
     */
    onDomainChange (domainType) {
      this.$store.dispatch('setting/changeDomain', domainType)
    }
  }
}
</script>
