<template>
  <div class="assessment-report module-panel">
    <group-cloud-report></group-cloud-report>
  </div>
</template>

<script>
import GroupCloudReport from '@/components/CloudReport/GroupCloudReport'
export default {
  name: 'AssessmentReport',
  components: { GroupCloudReport},
}
</script>
