<template>
  <div class="showpic-assessment">
    <div class="header">
      <h3>修修兽评价中心</h3>
      <portal-target name="assessmentPlug" />
    </div>
    <!-- 评价中心 -->
    <assessment-center />
  </div>
</template>

<script>
import AssessmentCenter from '@AssessmentComponents/AssessmentCenter/index.vue'
import { GRADE_LABEL_TYPE } from '@/utils/enumerate.js'

export default {
  name: 'ShowpicAssessment',
  components: { AssessmentCenter },
  provide: {
    cloudType: GRADE_LABEL_TYPE.SHOW_PIC
  }
}
</script>
