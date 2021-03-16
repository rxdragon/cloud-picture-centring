<template>
  <div class="assessment-history page-class">
    <div class="header">
      <h3>评价历史记录</h3>
    </div>
    <!-- 评价历史 -->
    <assessment-history-module />
  </div>
</template>

<script>
import AssessmentHistoryModule from '@AssessmentComponents/AssessmentHistoryModule/index.vue'
import { GRADE_LABEL_TYPE } from '@/utils/enumerate.js'

export default {
  name: 'AssessmentHistory',
  components: { AssessmentHistoryModule },
  provide: {
    cloudType: GRADE_LABEL_TYPE.CLOUD
  }
}
</script>
