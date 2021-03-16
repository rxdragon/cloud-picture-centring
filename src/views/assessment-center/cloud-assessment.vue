<template>
  <div class="cloud-assessment page-class">
    <div class="header">
      <h3>云学院评价中心</h3>
      <portal-target name="assessmentPlug" />
    </div>
    <!-- 评价中心 -->
    <assessment-center :cloudType="GRADE_LABEL_TYPE.CLOUD" />
  </div>
</template>

<script>
import AssessmentCenter from '@AssessmentComponents/AssessmentCenter/index.vue'
import { GRADE_LABEL_TYPE } from '@/utils/enumerate.js'

export default {
  name: 'CloudAssessment',
  components: { AssessmentCenter },
  data () {
    return {
      GRADE_LABEL_TYPE
    }
  }
}
</script>
