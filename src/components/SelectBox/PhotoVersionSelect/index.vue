<template>
  <div class="photo-version-select">
    <el-select
      :popper-append-to-body="false"
      v-bind="$attrs"
      v-on="$listeners"
      collapse-tags
      placeholder="请选择照片类型"
    >
      <el-option
        v-for="(optionItem, optionIndex) in options"
        :key="optionIndex"
        :label="optionItem.label"
        :value="optionItem.value"
      />
    </el-select>
  </div>
</template>

<script>
import { PHOTO_VERSION, PhotoEnumName } from '@/utils/enumerate.js'

export default {
  name: 'PhotoVersionSelect',
  data () {
    const searchEunm = [
      PHOTO_VERSION.ORIGINAL_PHOTO,
      PHOTO_VERSION.COMPLETE_PHOTO,
      PHOTO_VERSION.FINISH_PHOTO
    ]
    const optionSearch = searchEunm.map(item => {
      return {
        label: PhotoEnumName[item],
        value: item
      }
    })
    return {
      options: optionSearch
    }
  }
}
</script>

<style lang="less" scoped>
.order-state-select {
  min-width: 164px;
}
</style>
