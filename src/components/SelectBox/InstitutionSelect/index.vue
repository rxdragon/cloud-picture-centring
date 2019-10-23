<template>
  <div class="institution-select">
    <el-select
      :disabled="disableState"
      filterable
      v-bind="$attrs"
      clearable
      placeholder="请选择机构"
      v-on="$listeners"
    >
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
</template>

<script>
import * as Institution from '@/api/institution.js'

export default {
  name: 'InstitutionSelect',
  props: {
    institutionClass: { type: String, default: 'retouch' }
  },
  data () {
    return {
      options: [],
      disableState: false
    }
  },
  created () {
    this.getInstitutionList()
  },
  methods: {
    async getInstitutionList () {
      if (this.institutionClass === 'retouch') {
        const list = await Institution.getRetoucherOrg()
        this.options = list
      } else {
        const list = await Institution.getPhotographerOrg()
        this.options = list
      }
      this.options.length === 0 && (this.disableState = true)
    }
  }
}
</script>
