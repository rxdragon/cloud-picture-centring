<template>
  <div class="institution-select">
    <el-select
      :disabled="disableState"
      filterable
      v-bind="$attrs"
      :multiple="isMulti"
      clearable
      :popper-append-to-body="false"
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
    institutionClass: { type: String, default: 'retouch' },
    isMulti: { type: Boolean, default: false }
  },
  data () {
    return {
      options: [],
      disableState: true
    }
  },
  created () {
    this.getInstitutionList()
  },
  methods: {
    /**
     * @description 获取机构列表
     */
    async getInstitutionList () {
      if (this.institutionClass === 'retouch') {
        const list = await Institution.getRetoucherOrg()
        this.options = list
      } else {
        const list = await Institution.getPhotographerOrg()
        this.options = list
      }
      this.disableState = false
    }
  }
}
</script>
