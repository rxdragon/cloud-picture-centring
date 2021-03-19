<template>
  <div class="assessment-report module-panel">
    <group-cloud-report :searchRole="SEARCH_ROLE.GROUP_LEADER" />
  </div>
</template>

<script>
import GroupCloudReport from '@/components/CloudReport/GroupCloudReport'
import { SEARCH_ROLE } from '@/utils/enumerate'
export default {
  name: 'AssessmentReport',
  components: { GroupCloudReport},
  data () {
    return {
      SEARCH_ROLE,
    }
  },
}
</script>
