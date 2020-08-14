<template>
  <div class="cloud-college-report">
    <cloud-report :role="CLOUD_ROLE.OPERATE" />
  </div>
</template>

<script>
// 运营云端修图报告
import CloudReport from '@/components/CloudReport'
import { CLOUD_ROLE } from '@/utils/enumerate'

export default {
  name: 'CloudCollegeReport',
  components: { CloudReport },
  data () {
    return {
      CLOUD_ROLE
    }
  },
}
</script>
