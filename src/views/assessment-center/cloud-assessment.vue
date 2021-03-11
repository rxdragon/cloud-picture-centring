<template>
  <div class="cloud-assessment page-class">
    <div class="header">
      <h3>云学院评价中心</h3>
      <portal-target name="assessmentPlug" />
    </div>
    <!-- 评价中心 -->
    <assessment-center />
  </div>
</template>

<script>
import AssessmentCenter from '@AssessmentComponents/AssessmentCenter/index.vue'

export default {
  name: 'CloudAssessment',
  components: { AssessmentCenter }
}
</script>
