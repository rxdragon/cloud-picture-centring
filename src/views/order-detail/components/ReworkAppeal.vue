<template>
  <div class="rework-area">
    <p class="appeal-photo-title panel-title" v-if="!canAppeal">{{ reasonText }}</p>
    <template v-else>
      <p class="appeal-photo-title panel-title">选择问题照片</p>
      <div class="appeal-photos">
        <rework-appeal-photo v-for="photo in appealPhotos" :photo-item="photo" :key="photo.id" />
      </div>
    </template>
  </div>
</template>

<script>
import ReworkAppealPhoto from './ReworkAppealPhoto'

import { APPEAL_TYPE } from '@/utils/enumerate.js'

export default {
  name: 'ReworkAppeal',
  components: { ReworkAppealPhoto },
  props: {
    appealPhotos: { type: Array, required: true },
    orderData: { type: Object, required: true }
  },
  computed: {
    canAppeal () {
      let canAppeal = true

      this.orderData.currentStreamAppeals.forEach(item => { // 是否在申诉中
        if (item.type === APPEAL_TYPE.REWORK) canAppeal = false
      })
      if (!this.appealPhotos.length) canAppeal = false
      return canAppeal
    },
    reasonText () {
      let reasonText = ''
      if (!this.appealPhotos.length) reasonText = '没有可以申诉的质量问题照片'
      this.orderData.currentStreamAppeals.forEach(item => { // 是否在申诉中
        if (item.type === APPEAL_TYPE.REWORK) reasonText = '该流水质量问题申诉正在进行中'
      })
      return reasonText
    }
  }
}
</script>

<style lang="less" scoped>
.rework-area {
  min-height: 282px;
}

.appeal-photo-title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
}
</style>
