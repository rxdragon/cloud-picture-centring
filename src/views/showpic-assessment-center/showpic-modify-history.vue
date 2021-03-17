<template>
  <div class="showpic-modify-history">
    <div class="header">
      <h3>修修兽评分修改记录</h3>
    </div>
    <ModifyHistoryModule />
  </div>
</template>

<script>
import ModifyHistoryModule from '@AssessmentComponents/ModifyHistoryModule/index.vue'
import { GRADE_LABEL_TYPE } from '@/utils/enumerate.js'

export default {
  name: 'ShowpicModifyHistory',
  components: { ModifyHistoryModule },
  provide: {
    cloudType: GRADE_LABEL_TYPE.SHOW_PIC
  }
}
</script>
