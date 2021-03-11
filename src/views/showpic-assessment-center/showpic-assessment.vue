<template>
  <div class="showpic-assessment">
    <div class="header">
      <h3>修修兽评价中心</h3>
      <portal-target name="assessmentPlug" />
    </div>
    <!-- 评价中心 -->
    <assessment-center cloudType="showPic" />
  </div>
</template>

<script>
import AssessmentCenter from '@AssessmentComponents/AssessmentCenter/index.vue'

export default {
  name: 'ShowpicAssessment',
  components: { AssessmentCenter }
}
</script>
