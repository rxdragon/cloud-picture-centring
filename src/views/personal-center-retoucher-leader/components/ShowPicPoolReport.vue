<template>
  <div class="assessment-report module-panel">
    <group-cloud-report :searchRole="SEARCH_ROLE.GROUP_LEADER" :search-type="GRADE_LABEL_TYPE.SHOW_PIC"/>
  </div>
</template>

<script>
import GroupCloudReport from '@/components/CloudReport/GroupCloudReport'
import { SEARCH_ROLE, GRADE_LABEL_TYPE } from '@/utils/enumerate'
export default {
  name: 'ShowPicPoolReport',
  components: { GroupCloudReport},
  data () {
    return {
      SEARCH_ROLE,
      GRADE_LABEL_TYPE
    }
  },
}
</script>
