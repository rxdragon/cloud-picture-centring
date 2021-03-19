<template>
  <div class="showpic-assessment-history">
    <div class="header">
      <h3>修修兽评价历史记录</h3>
    </div>
    <!-- 评价历史 -->
    <assessment-history-module />
  </div>
</template>

<script>
import AssessmentHistoryModule from '@AssessmentComponents/AssessmentHistoryModule/index.vue'
import { GRADE_LABEL_TYPE } from '@/utils/enumerate.js'

export default {
  name: 'ShowpicAssessmentHistory',
  components: { AssessmentHistoryModule },
  provide: {
    cloudType: GRADE_LABEL_TYPE.SHOW_PIC
  }
}
</script>
